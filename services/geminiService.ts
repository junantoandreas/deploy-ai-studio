import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageFile } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in process.env");
  }
  return new GoogleGenAI({ apiKey });
};

const cleanBase64 = (data: string) => {
  return data.includes('base64,') ? data.split('base64,')[1] : data;
};

const extractImageFromResponse = (response: GenerateContentResponse): string => {
  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("No content in response");
  }
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated found in response");
};

// --- PAS FOTO ---
export const generatePasFoto = async (
  faceImage: ImageFile,
  bgColor: string,
  clothingStyle: string,
  customClothingImg: ImageFile | null,
  size: string
): Promise<string> => {
  try {
    const ai = getClient();
    const faceBase64 = cleanBase64(faceImage.data);
    const colorMap: Record<string, string> = {
      'Merah': 'bright solid red (#FF0000)',
      'Biru': 'deep solid blue (#0000FF)',
      'Putih': 'clean solid white (#FFFFFF)',
      'Hitam': 'solid black (#000000)',
    };
    const bgDescription = colorMap[bgColor] || bgColor;
    const clothingPrompts: Record<string, string> = {
      'Kemeja': 'a white formal collared shirt',
      'Batik': 'a professional Indonesian Batik shirt',
      'Jas': 'a professional formal black suit with a white shirt',
      'Jas + Dasi': 'a professional black suit jacket, white shirt, and a formal necktie',
      'Blazer': 'a professional formal blazer jacket',
    };
    const parts: any[] = [
      { inlineData: { data: faceBase64, mimeType: faceImage.mimeType } }
    ];
    let attirePart = "";
    if (customClothingImg) {
      parts.push({ inlineData: { data: cleanBase64(customClothingImg.data), mimeType: customClothingImg.mimeType } });
      attirePart = "Use the clothing from the second image.";
    } else {
      attirePart = `wearing ${clothingPrompts[clothingStyle] || 'formal attire'}`;
    }
    const fullPrompt = `Create a professional formal ID photo (Pas Foto).
    - Background: Replace with flat, solid ${bgDescription}.
    - Clothing: ${attirePart}. 
    - Formatting: Standard ${size} portrait crop, head and shoulders centered.
    - Quality: Photorealistic, sharp focus, preserve facial features exactly.
    Return the generated image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [...parts, { text: fullPrompt }] 
      },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Pas Foto Gen Error:", error);
    throw error;
  }
};

// --- FOTO ANAK ---
export const generateChildPhotoSuggestion = async (image: ImageFile, type: 'style' | 'expression'): Promise<string> => {
  const ai = getClient();
  const prompt = type === 'style' 
    ? "Analisis foto ini. Berikan 1 ide tema kreatif lucu untuk foto anak dalam Bahasa Indonesia."
    : "Analisis foto ini. Berikan 1 ide ekspresi wajah lucu untuk anak dalam Bahasa Indonesia.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: prompt }] },
  });
  return response.text?.trim() || "Kreatif";
};

export const generateChildPhoto = async (
  image: ImageFile,
  gender: string,
  style: string,
  customStyle: string,
  expression: string,
  customExpression: string,
  aspectRatio: string
): Promise<string> => {
  const ai = getClient();
  const finalStyle = style === 'Kustom' ? customStyle : style;
  const finalExpr = expression === 'Kustom' ? customExpression : expression;
  const prompt = `Professional photo of a ${gender} child. Theme: ${finalStyle}. Expression: ${finalExpr}. High quality, photorealistic.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: prompt }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- GABUNG PRODUK ---
export const generateMergeInstruction = async (images: ImageFile[]): Promise<string> => {
  const ai = getClient();
  const parts = images.map(img => ({ inlineData: { data: cleanBase64(img.data), mimeType: img.mimeType } }));
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [...parts, { text: "Analyze these product images and suggest a creative composition prompt to merge them into a single professional product advertisement image (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "";
};

export const generateMergedImage = async (images: ImageFile[], prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const parts = images.map(img => ({ inlineData: { data: cleanBase64(img.data), mimeType: img.mimeType } }));
  const ratio = aspectRatio === 'Auto' ? '1:1' : aspectRatio;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [...parts, { text: `Merge these products into one professional image. ${prompt}` }] },
    config: { imageConfig: { aspectRatio: ratio as any } }
  });
  return extractImageFromResponse(response);
};

// --- HAPUS LATAR ---
export const removeBackgroundWithGemini = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: "Remove the background and return the object on a solid white background." }
      ] 
    },
  });
  return extractImageFromResponse(response);
};

// --- MAGIC ERASER ---
export const magicEraserWithGemini = async (image: ImageFile, maskBase64: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { inlineData: { data: cleanBase64(maskBase64), mimeType: 'image/png' } },
        { text: "Remove the object covered by the mask from the image. Fill the area naturally to match the surroundings." }
      ] 
    },
  });
  return extractImageFromResponse(response);
};

// --- EDIT FOTO ---
export const editRegionWithGemini = async (image: ImageFile, maskBase64: string, prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { inlineData: { data: cleanBase64(maskBase64), mimeType: 'image/png' } },
        { text: `Edit the masked area: ${prompt}. Blend naturally.` }
      ] 
    },
  });
  return extractImageFromResponse(response);
};

// --- PERBAIKI FOTO ---
export const restoreImageWithGemini = async (image: ImageFile, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: "Restore this image. Fix blur, sharpen details, improve lighting and color balance. High quality." }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- FOTO PRODUK ---
export const generateProductInstruction = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Analyze this product and suggest a professional photography setting prompt (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "";
};

export const generateProductPhoto = async (image: ImageFile, settings: any): Promise<string> => {
  const ai = getClient();
  const prompt = `Professional product photography. ${settings.userPrompt}. Lighting: ${settings.lighting}. Mood: ${settings.mood}. High resolution.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: prompt }
      ] 
    },
    config: { imageConfig: { aspectRatio: settings.aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- MODEL + PRODUK ---
export const generateModelProductInstruction = async (product: ImageFile, model: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(product.data), mimeType: product.mimeType } }, 
        { inlineData: { data: cleanBase64(model.data), mimeType: model.mimeType } },
        { text: "Suggest a prompt to naturally integrate this product into the model photo (Bahasa Indonesia)." }
      ] 
    },
  });
  return response.text?.trim() || "";
};

export const generateModelProductImage = async (product: ImageFile, model: ImageFile, prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(product.data), mimeType: product.mimeType } }, 
        { inlineData: { data: cleanBase64(model.data), mimeType: model.mimeType } },
        { text: `Integrate product into model photo. ${prompt}` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- MOCKUP ---
export const generateMockupCategory = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest a mockup placement prompt for this design (e.g. on a bottle, billboard, or screen) (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "";
};

export const generateMockup = async (image: ImageFile, category: string, prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: `Create a realistic ${category} mockup using this design. ${prompt}` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- FOTO BAYI ---
export const generateBabyThemeSuggestion = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest a cute baby photography theme (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "";
};

export const generateBabyPhoto = async (image: ImageFile, gender: string, theme: string, customTheme: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const finalTheme = theme === 'Kustom' ? customTheme : theme;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: `Professional baby photography. Gender: ${gender}. Theme: ${finalTheme}. Cute, soft lighting.` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- INTERIOR ---
export const generateInteriorConcept = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest an interior design concept for this room (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "Modern Minimalist";
};

export const generateInteriorFurniture = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest matching furniture for this room style (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "Sofa, Table";
};

export const generateInteriorInstruction = async (image: ImageFile, concept: string, furniture: string, hasCustomFurniture: boolean): Promise<string> => {
  const ai = getClient();
  const prompt = `Create a design instruction for this room. Concept: ${concept}. Furniture: ${furniture}. ${hasCustomFurniture ? 'Incorporate the provided furniture images.' : ''} (Bahasa Indonesia).`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: prompt }] },
  });
  return response.text?.trim() || "";
};

export const generateInteriorDesign = async (image: ImageFile, concept: string, furnitureText: string, customFurniture: ImageFile[], instruction: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const parts: any[] = [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }];
  customFurniture.forEach(f => parts.push({ inlineData: { data: cleanBase64(f.data), mimeType: f.mimeType } }));
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        ...parts, 
        { text: `Redesign room interior. Concept: ${concept}. Furniture: ${furnitureText}. ${instruction}` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- EXTERIOR ---
export const generateExteriorStyleSuggestion = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest an exterior renovation style (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "Modern";
};

export const generateExteriorInstruction = async (image: ImageFile, renovationType: string, style: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: `Suggest instructions for exterior renovation. Type: ${renovationType}. Style: ${style}. (Bahasa Indonesia).` }] },
  });
  return response.text?.trim() || "";
};

export const generateExteriorDesign = async (image: ImageFile, renovationType: string, style: string, instruction: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: `Renovate building exterior. Type: ${renovationType}. Style: ${style}. ${instruction}` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- SKETSA ---
export const generateSketchGoalSuggestion = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest a visual goal for this sketch (e.g. realistic 3d render, vector logo) (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "Realistic Render";
};

export const generateSketchInstruction = async (image: ImageFile, goal: string, customGoal: string): Promise<string> => {
  const ai = getClient();
  const finalGoal = goal === 'Kustom' ? customGoal : goal;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: `Suggest instructions to convert this sketch into ${finalGoal} (Bahasa Indonesia).` }] },
  });
  return response.text?.trim() || "";
};

export const generateSketchDesign = async (image: ImageFile, goal: string, customGoal: string, instruction: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const finalGoal = goal === 'Kustom' ? customGoal : goal;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: `Convert this sketch into ${finalGoal}. ${instruction}` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- ART ---
export const generateArtStyleSuggestion = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest an art style for this image (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "Oil Painting";
};

export const generateArtInstruction = async (image: ImageFile, style: string, customStyle: string): Promise<string> => {
  const ai = getClient();
  const finalStyle = style === 'Kustom' ? customStyle : style;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: `Suggest instructions to turn this photo into ${finalStyle} art (Bahasa Indonesia).` }] },
  });
  return response.text?.trim() || "";
};

export const generateArtisticImage = async (image: ImageFile, style: string, customStyle: string, instruction: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const finalStyle = style === 'Kustom' ? customStyle : style;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: `Transform photo into ${finalStyle} art. ${instruction}` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- PREWEDDING ---
export const generatePreweddingStyleSuggestion = async (image: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: "Suggest a prewedding photography style (Bahasa Indonesia)." }] },
  });
  return response.text?.trim() || "Romantic";
};

export const generatePreweddingCameraSuggestion = async (image: ImageFile, style: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: `Suggest a camera angle for ${style} prewedding photo (Bahasa Indonesia).` }] },
  });
  return response.text?.trim() || "Medium Shot";
};

export const generatePreweddingLocationSuggestion = async (image: ImageFile, style: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, { text: `Suggest a location for ${style} prewedding photo (Bahasa Indonesia).` }] },
  });
  return response.text?.trim() || "Park";
};

export const generatePreweddingPhoto = async (image: ImageFile, style: string, camera: string, location: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(image.data), mimeType: image.mimeType } }, 
        { text: `Prewedding photo. Style: ${style}. Camera: ${camera}. Location: ${location}.` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- WEDDING ---
export const generateWeddingStyleSuggestion = async (groom: ImageFile, bride: ImageFile): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(groom.data), mimeType: groom.mimeType } },
        { inlineData: { data: cleanBase64(bride.data), mimeType: bride.mimeType } },
        { text: "Suggest a wedding photography style (Bahasa Indonesia)." }
      ] 
    },
  });
  return response.text?.trim() || "Modern";
};

export const generateWeddingCameraSuggestion = async (groom: ImageFile, bride: ImageFile, style: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
        parts: [
          { inlineData: { data: cleanBase64(groom.data), mimeType: groom.mimeType } },
          { inlineData: { data: cleanBase64(bride.data), mimeType: bride.mimeType } },
          { text: `Suggest a camera angle for ${style} wedding photo (Bahasa Indonesia).` }
        ] 
    },
  });
  return response.text?.trim() || "Wide Shot";
};

export const generateWeddingLocationSuggestion = async (groom: ImageFile, bride: ImageFile, style: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
        parts: [
          { inlineData: { data: cleanBase64(groom.data), mimeType: groom.mimeType } },
          { inlineData: { data: cleanBase64(bride.data), mimeType: bride.mimeType } },
          { text: `Suggest a location for ${style} wedding photo (Bahasa Indonesia).` }
        ] 
    },
  });
  return response.text?.trim() || "Ballroom";
};

export const generateWeddingPhoto = async (groom: ImageFile, bride: ImageFile, style: string, camera: string, location: string, aspectRatio: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(groom.data), mimeType: groom.mimeType } },
        { inlineData: { data: cleanBase64(bride.data), mimeType: bride.mimeType } },
        { text: `Wedding photo of couple. Style: ${style}. Camera: ${camera}. Location: ${location}.` }
      ] 
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return extractImageFromResponse(response);
};

// --- FOTO FASHION ---

export const generateFashionStyleSuggestion = async (
  productImage: ImageFile,
  modelType: string,
  location: string
): Promise<string> => {
  try {
    const ai = getClient();
    const base64Data = cleanBase64(productImage.data);
    const prompt = `Analisis produk fashion ini. Dengan model '${modelType}' dan lokasi '${location}', berikan 1 rekomendasi gaya visual (misal: 'Streetwear Urban', 'Minimalist Studio', 'Bohemian Nature') yang paling menarik. Langsung berikan nama gayanya saja.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: productImage.mimeType } },
          { text: prompt },
        ],
      },
    });

    return response.text?.trim() || "Modern Chic";
  } catch (error) {
    console.error("Fashion Style Suggestion Error:", error);
    return "Modern";
  }
};

export const generateFashionInstructionSuggestion = async (
  productImage: ImageFile,
  modelType: string,
  location: string,
  style: string
): Promise<string> => {
  try {
    const ai = getClient();
    const base64Data = cleanBase64(productImage.data);
    const prompt = `Analisis produk ini. Konteks: Model ${modelType}, Lokasi ${location}, Gaya ${style}.
    Buatkan 1 paragraf instruksi detail (prompt) dalam Bahasa Indonesia untuk membuat foto fashion yang menarik. Jelaskan pose, pencahayaan, dan suasana.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: productImage.mimeType } },
          { text: prompt },
        ],
      },
    });

    return response.text?.trim() || "Buat foto fashion profesional dengan pencahayaan yang bagus.";
  } catch (error) {
    console.error("Fashion Instruction Error:", error);
    return "Foto fashion profesional.";
  }
};

export const generateFashionPhoto = async (
  productImage: ImageFile,
  modelImage: ImageFile | null,
  modelType: string,
  location: string,
  style: string,
  instruction: string,
  aspectRatio: string
): Promise<string> => {
  try {
    const ai = getClient();
    const productBase64 = cleanBase64(productImage.data);
    const parts: any[] = [
      { inlineData: { data: productBase64, mimeType: productImage.mimeType } }
    ];

    let basePrompt = "";

    if (modelType === 'Kustom' && modelImage) {
      // Case: Custom Model
      const modelBase64 = cleanBase64(modelImage.data);
      parts.push({ inlineData: { data: modelBase64, mimeType: modelImage.mimeType } });
      
      basePrompt = `Create a high-fashion photo.
      Input 1: The Product.
      Input 2: The Model.
      
      Task: Visualize the Model (Input 2) wearing the Product (Input 1).
      Location: ${location}.
      Style: ${style}.
      Additional Instructions: ${instruction}.
      
      Requirements:
      1. Realistic Virtual Try-On / Composition.
      2. Preserve the identity of the model.
      3. Showcase the product clearly and naturally.`;
      
    } else {
      // Case: AI Model (Manusia/Manekin)
      const modelPromptDesc = modelType === 'Manekin' 
        ? "a professional mannequin" 
        : "a realistic human fashion model (AI generated)";

      basePrompt = `Create a high-fashion photo.
      Input 1: The Product.
      
      Task: Generate a photo of ${modelPromptDesc} wearing this product.
      Location: ${location}.
      Style: ${style}.
      Additional Instructions: ${instruction}.
      
      Requirements:
      1. The product must be the main focus and look identical to Input 1.
      2. High quality fashion photography, realistic lighting.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [...parts, { text: basePrompt }],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Fashion Photo Gen Error:", error);
    throw error;
  }
};

// --- DESAIN BANNER ---

export const generateBannerTextSuggestion = async (
  productImage: ImageFile
): Promise<string> => {
  try {
    const ai = getClient();
    const base64Data = cleanBase64(productImage.data);
    const prompt = `Analisis produk ini. Buatkan 1 kalimat slogan marketing yang menarik, singkat, dan menjual untuk banner iklan dalam Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: productImage.mimeType } },
          { text: prompt },
        ],
      },
    });

    return response.text?.trim() || "Diskon Spesial Hari Ini!";
  } catch (error) {
    console.error("Banner Text Suggestion Error:", error);
    return "Promo Spesial!";
  }
};

export const generateBannerStyleSuggestion = async (
  productImage: ImageFile,
  text: string
): Promise<string> => {
  try {
    const ai = getClient();
    const base64Data = cleanBase64(productImage.data);
    const prompt = `Analisis produk ini dan teks banner: "${text}".
    Berikan 1 rekomendasi gaya desain visual (misal: 'Modern Minimalis dengan tipografi tebal', 'Pop Art Warna-warni') yang paling cocok untuk iklan produk ini. Langsung berikan nama gayanya.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: productImage.mimeType } },
          { text: prompt },
        ],
      },
    });

    return response.text?.trim() || "Modern Minimalis";
  } catch (error) {
    console.error("Banner Style Suggestion Error:", error);
    return "Modern";
  }
};

export const generateBannerDesign = async (
  productImage: ImageFile,
  text: string,
  style: string,
  aspectRatio: string
): Promise<string> => {
  try {
    const ai = getClient();
    const productBase64 = cleanBase64(productImage.data);
    
    const prompt = `Create a professional advertisement banner design.
    Product: See image (This is the main focus).
    
    Task: Design a banner featuring this product.
    Text to Include: "${text}" (Ensure this text is present in the design).
    Style: ${style}.
    
    Requirements:
    1. High-quality graphic design composition.
    2. The product must be clear and appealing.
    3. Typography should be legible and match the style.
    4. Professional layout suitable for digital marketing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: productBase64, mimeType: productImage.mimeType } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Banner Design Gen Error:", error);
    throw error;
  }
};

// --- FOTO MINIATUR ---

export const generateMiniatureInstructionSuggestion = async (
  image: ImageFile
): Promise<string> => {
  try {
    const ai = getClient();
    const base64Data = cleanBase64(image.data);
    const prompt = `Analisis gambar ini. Buatkan prompt instruksi pendek dalam Bahasa Indonesia untuk mengubah gambar ini menjadi efek miniatur (tilt-shift atau diorama) yang sangat realistis. Fokus pada apa yang harus ditonjolkan agar terlihat seperti mainan kecil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: image.mimeType } },
          { text: prompt },
        ],
      },
    });

    return response.text?.trim() || "Ubah menjadi efek miniatur tilt-shift dengan fokus pada objek tengah dan latar belakang blur.";
  } catch (error) {
    console.error("Miniature Instruction Suggestion Error:", error);
    return "Efek miniatur tilt-shift realistis.";
  }
};

export const generateMiniaturePhoto = async (
  image: ImageFile,
  prompt: string,
  aspectRatio: string
): Promise<string> => {
  try {
    const ai = getClient();
    const base64Data = cleanBase64(image.data);
    
    const fullPrompt = `Create a realistic miniature effect photo (Tilt-Shift / Diorama style).
    Input Image: See attached.
    
    Transformation Task:
    1. Apply strong tilt-shift depth of field (blurred foreground and background).
    2. Make objects look like small toys or models (plastic-like texture, high saturation).
    3. Context/Prompt: ${prompt}.
    4. Camera Angle: High angle (bird's eye view) typically works best for this effect, adapt based on input.
    
    Output: A high-quality, photorealistic miniature version of the scene.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: image.mimeType } },
          { text: fullPrompt },
        ],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Miniature Gen Error:", error);
    throw error;
  }
};