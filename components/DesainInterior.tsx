
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Armchair, Sparkles, Image as ImageIcon, Sofa } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { 
  generateInteriorConcept, 
  generateInteriorFurniture, 
  generateInteriorInstruction, 
  generateInteriorDesign 
} from '../services/geminiService';

const DesainInterior: React.FC = () => {
  // --- STATE ---
  const [roomImage, setRoomImage] = useState<ImageFile | null>(null);
  const [customFurnitureImages, setCustomFurnitureImages] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);

  // Inputs
  const [concept, setConcept] = useState('Minimalis');
  const [customConcept, setCustomConcept] = useState('');
  const [furnitureText, setFurnitureText] = useState('');
  const [instruction, setInstruction] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Refs
  const roomInputRef = useRef<HTMLInputElement>(null);
  const furnInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const CONCEPTS = ['Minimalis', 'Modern', 'Industrial', 'Japandi', 'Classic', 'Rekomendasi'];
  const RATIO_OPTIONS = ['1:1', '3:4', '16:9', '9:16'];

  // --- HANDLERS ---

  // Upload Room
  const handleRoomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon upload file gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setRoomImage({
        id: crypto.randomUUID(),
        data: ev.target?.result as string,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      });
      // Reset dependent states
      setResults([]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload Furniture (Multiple)
  const handleFurnitureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomFurnitureImages(prev => [...prev, {
          id: crypto.randomUUID(),
          data: ev.target?.result as string,
          mimeType: file.type,
          url: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeFurniture = (id: string) => {
    setCustomFurnitureImages(prev => prev.filter(img => img.id !== id));
  };

  // AI Generators
  const handleSuggestConcept = async () => {
    if (!roomImage) return;
    setLoadingText('Menganalisis ruangan...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestion = await generateInteriorConcept(roomImage);
      setCustomConcept(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSuggestFurniture = async () => {
    if (!roomImage) return;
    setLoadingText('Mencari furnitur yang cocok...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestion = await generateInteriorFurniture(roomImage);
      setFurnitureText(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleGenerateInstruction = async () => {
    if (!roomImage) return;
    setLoadingText('Membuat instruksi desain...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const finalConcept = concept === 'Rekomendasi' ? customConcept : concept;
      const prompt = await generateInteriorInstruction(
        roomImage, 
        finalConcept, 
        furnitureText, 
        customFurnitureImages.length > 0
      );
      setInstruction(prompt);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Main Generation
  const handleGenerateDesign = async () => {
    if (!roomImage) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Sedang mendesain ulang ruangan... (4 Variasi)');
    setResults([]);

    try {
      const finalConcept = concept === 'Rekomendasi' ? customConcept : concept;
      
      const promises = [1, 2, 3, 4].map(() => 
        generateInteriorDesign(
          roomImage,
          finalConcept,
          furnitureText,
          customFurnitureImages,
          instruction,
          aspectRatio
        )
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal mendesain ruangan. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `desain-interior-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Upload Room */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Interior</h3>
          </div>

          {!roomImage ? (
            <button 
              onClick={() => roomInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-3 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
            >
              <input 
                type="file" 
                ref={roomInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleRoomUpload}
              />
              <div className="w-12 h-12 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-brand-blue">
                 <Armchair size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload Foto Ruangan</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Max 1 Gambar Interior</span>
              </div>
            </button>
          ) : (
            <div className="relative aspect-video w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden group bg-gray-50 dark:bg-dark-card flex justify-center">
              <img src={roomImage.url} alt="Room" className="h-full object-contain" />
              <button 
                onClick={() => { setRoomImage(null); setResults([]); }}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Konsep */}
        <section className={!roomImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilih Konsep Ruangan</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CONCEPTS.map(c => (
              <button
                key={c}
                onClick={() => setConcept(c)}
                className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                  concept === c 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {concept === 'Rekomendasi' && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                placeholder="Konsep rekomendasi AI..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleSuggestConcept}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
          )}
        </section>

        {/* Step 3: Furnitur */}
        <section className={!roomImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Furnitur</h3>
          </div>

          {/* Text Input & Recommendation */}
          <div className="relative mb-3">
              <input
                type="text"
                value={furnitureText}
                onChange={(e) => setFurnitureText(e.target.value)}
                placeholder="Masukkan furnitur (contoh: Sofa kulit, Meja kayu)..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleSuggestFurniture}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Suggest
              </button>
          </div>

          {/* Upload Custom Furniture */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
               {customFurnitureImages.map(img => (
                 <div key={img.id} className="relative aspect-square border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-gray-50 dark:bg-dark-card">
                    <img src={img.url} alt="Furnitur" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeFurniture(img.id)}
                      className="absolute top-0.5 right-0.5 bg-white/90 p-1 rounded-full text-red-500 shadow-sm"
                    >
                      <X size={10} />
                    </button>
                 </div>
               ))}
               
               <button
                  onClick={() => furnInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-brand-blue dark:hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-blue text-gray-400 dark:text-gray-500 transition-colors"
               >
                  <input 
                    type="file" 
                    multiple
                    ref={furnInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFurnitureUpload}
                  />
                  <Sofa size={16} />
                  <span className="text-[9px]">Upload</span>
               </button>
            </div>
            {customFurnitureImages.length > 0 && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">*Furnitur yang diupload akan ditempatkan secara otomatis.</p>
            )}
          </div>
        </section>

        {/* Step 4: Perintah / Instruksi */}
        <section className={!roomImage ? 'opacity-50 pointer-events-none' : ''}>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Perintah / Instruksi</h3>
          </div>

          <div className="relative">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Instruksi tambahan untuk detail desain..."
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border dark:text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-sm min-h-[80px] resize-none placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleGenerateInstruction}
                className="absolute bottom-3 right-3 text-xs bg-white dark:bg-dark-sidebar border border-gray-200 dark:border-dark-border hover:border-brand-blue text-gray-600 dark:text-gray-300 hover:text-brand-blue px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
        </section>

        {/* Step 5: Rasio */}
        <section className={!roomImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">5</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilih Rasio</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {RATIO_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  aspectRatio === r 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleGenerateDesign}
          disabled={!roomImage || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-2
            ${!roomImage || loadingState === LoadingState.GENERATING
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-brand-blue to-blue-500 hover:shadow-xl hover:scale-[1.01]'}
          `}
        >
          {loadingState === LoadingState.GENERATING ? (
            <>
              <Loader2 className="animate-spin" />
              <span>{loadingText}</span>
            </>
          ) : (
            <>
              <Armchair size={20} />
              <span>Generate Interior / Ruangan</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Desain Interior</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((res, idx) => (
                <div key={idx} className="group relative aspect-square bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden flex items-center justify-center">
                  <img src={res} alt={`Result ${idx}`} className="w-full h-full object-cover" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setPreviewPopup(res)}
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                      title="Preview"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => downloadImage(res, idx)}
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center p-8 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                <Armchair size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Hasil desain interior yang realistis akan muncul di sini (4 variasi).
              </p>
            </div>
          )}
        </div>
      </div>

       {/* Preview Popup Modal */}
       {previewPopup && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setPreviewPopup(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={previewPopup} alt="Full Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl bg-white" />
            <button 
              onClick={() => setPreviewPopup(null)}
              className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesainInterior;
