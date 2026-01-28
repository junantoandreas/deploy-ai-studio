
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, RectangleHorizontal, Sparkles, Image as ImageIcon, Type } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { 
  generateBannerTextSuggestion, 
  generateBannerStyleSuggestion, 
  generateBannerDesign 
} from '../services/geminiService';

const DesainBanner: React.FC = () => {
  // --- STATE ---
  const [image, setImage] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);

  // Settings
  const [bannerText, setBannerText] = useState('');
  const [style, setStyle] = useState('Minimalis');
  const [customStyle, setCustomStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options
  const STYLE_OPTIONS = ['Minimalis', 'Modern', 'Ilustrative', 'Colorful', 'Elegant', 'Kustom'];
  const RATIO_OPTIONS = ['1:1', '16:9', '9:16'];

  // --- HANDLERS ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon upload file gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage({
        id: crypto.randomUUID(),
        data: ev.target?.result as string,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      });
      setResults([]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // AI Suggestion Handlers
  const handleSuggestText = async () => {
    if (!image) return;
    setLoadingText('Membuat teks banner...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestion = await generateBannerTextSuggestion(image);
      setBannerText(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSuggestStyle = async () => {
    if (!image) return;
    setLoadingText('Menganalisis gaya desain...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestion = await generateBannerStyleSuggestion(image, bannerText);
      setCustomStyle(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Main Generation
  const handleGenerate = async () => {
    if (!image) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Membuat desain banner... (4 Variasi)');
    setResults([]);

    try {
      const finalStyle = style === 'Kustom' ? customStyle : style;

      const promises = [1, 2, 3, 4].map(() => 
        generateBannerDesign(
          image,
          bannerText,
          finalStyle,
          aspectRatio
        )
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat banner. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `desain-banner-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Upload Produk */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800">Upload Produk</h3>
          </div>

          {!image ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-brand-blue hover:bg-blue-50/50 transition-colors text-gray-400 hover:text-brand-blue"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-brand-blue">
                 <ImageIcon size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload Produk</span>
                <span className="text-xs text-gray-400">Max 1 Foto Produk</span>
              </div>
            </button>
          ) : (
            <div className="relative aspect-video w-full rounded-xl border border-gray-200 overflow-hidden group bg-gray-50 flex justify-center">
              <img src={image.url} alt="Product" className="h-full object-contain" />
              <button 
                onClick={() => { setImage(null); setResults([]); }}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Teks Banner */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800">Teks Banner</h3>
          </div>

          <div className="relative">
              <textarea
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Masukkan teks untuk banner (misal: Diskon 50% Hari Ini)..."
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-sm min-h-[80px] resize-none pr-28"
              />
              <button
                onClick={handleSuggestText}
                className="absolute top-3 right-3 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
        </section>

        {/* Step 3: Gaya Banner */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800">Gaya Desain</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setStyle(opt)}
                className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all truncate ${style === opt ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {style === 'Kustom' && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                placeholder="Gaya manual (misal: Neon Cyberpunk)..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm"
              />
              <button
                onClick={handleSuggestStyle}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generated
              </button>
            </div>
          )}
        </section>

        {/* Step 4: Rasio */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="font-semibold text-gray-800">Pilih Rasio</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {RATIO_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${aspectRatio === r ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={!image || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-2
            ${!image || loadingState === LoadingState.GENERATING
              ? 'bg-gray-300 cursor-not-allowed' 
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
              <RectangleHorizontal size={20} />
              <span>Buat Desain Banner</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 rounded-3xl border border-gray-200 p-6 flex flex-col">
        <h3 className="font-semibold text-gray-700 mb-6">Hasil Desain Banner</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((res, idx) => (
                <div key={idx} className="group relative w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                  <img src={res} alt={`Result ${idx}`} className="w-full h-auto object-contain" />
                  
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <RectangleHorizontal size={32} />
              </div>
              <h4 className="font-medium text-gray-500 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Desain banner yang profesional akan muncul di sini (4 variasi).
              </p>
            </div>
          )}
        </div>
      </div>

       {/* Preview Popup Modal */}
       {previewPopup && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setPreviewPopup(null)}>
          <div className="relative max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
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

export default DesainBanner;
