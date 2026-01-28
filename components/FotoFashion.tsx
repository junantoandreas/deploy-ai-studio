
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Shirt, Sparkles, User, MapPin } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { 
  generateFashionStyleSuggestion, 
  generateFashionInstructionSuggestion, 
  generateFashionPhoto 
} from '../services/geminiService';

const FotoFashion: React.FC = () => {
  // --- STATE ---
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);

  // Settings
  const [modelType, setModelType] = useState('Manusia');
  const [location, setLocation] = useState('Indoor');
  const [style, setStyle] = useState('Minimalis');
  const [customStyle, setCustomStyle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');

  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // Options
  const MODEL_OPTIONS = ['Manusia', 'Manekin', 'Kustom'];
  const LOCATION_OPTIONS = ['Indoor', 'Outdoor'];
  const STYLE_OPTIONS = ['Minimalis', 'Natural', 'Urban', 'Kustom'];
  const RATIO_OPTIONS = ['3:4', '1:1', '9:16', '16:9'];

  // --- HANDLERS ---

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon upload file gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setProductImage({
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

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setModelImage({
        id: crypto.randomUUID(),
        data: ev.target?.result as string,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // AI Suggestion Handlers
  const handleSuggestStyle = async () => {
    if (!productImage) return;
    setLoadingText('Menganalisis gaya...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestion = await generateFashionStyleSuggestion(productImage, modelType, location);
      setCustomStyle(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSuggestInstruction = async () => {
    if (!productImage) return;
    setLoadingText('Membuat instruksi...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const styleToUse = style === 'Kustom' ? customStyle : style;
      const suggestion = await generateFashionInstructionSuggestion(productImage, modelType, location, styleToUse);
      setInstruction(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Main Generation
  const handleGenerate = async () => {
    if (!productImage) return;
    if (modelType === 'Kustom' && !modelImage) {
        alert("Mohon upload foto model untuk opsi Kustom.");
        return;
    }
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Membuat foto fashion... (4 Variasi)');
    setResults([]);

    try {
      const finalStyle = style === 'Kustom' ? customStyle : style;

      const promises = [1, 2, 3, 4].map(() => 
        generateFashionPhoto(
          productImage,
          modelImage,
          modelType,
          location,
          finalStyle,
          instruction,
          aspectRatio
        )
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat foto. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `foto-fashion-${index + 1}-${Date.now()}.png`;
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
            <h3 className="font-semibold text-gray-800">Upload Produk Fashion</h3>
          </div>

          {!productImage ? (
            <button 
              onClick={() => productInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-brand-blue hover:bg-blue-50/50 transition-colors text-gray-400 hover:text-brand-blue"
            >
              <input 
                type="file" 
                ref={productInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleProductUpload}
              />
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-brand-blue">
                 <Shirt size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload Produk</span>
                <span className="text-xs text-gray-400">Max 1 Foto (Baju, Celana, dll)</span>
              </div>
            </button>
          ) : (
            <div className="relative aspect-video w-full rounded-xl border border-gray-200 overflow-hidden group bg-gray-50 flex justify-center">
              <img src={productImage.url} alt="Product" className="h-full object-contain" />
              <button 
                onClick={() => { setProductImage(null); setResults([]); }}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Pilihan Model */}
        <section className={!productImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800">Pilihan Model</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {MODEL_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => { setModelType(opt); if(opt !== 'Kustom') setModelImage(null); }}
                className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${modelType === opt ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {modelType === 'Kustom' && (
             <div className="mt-2 animate-in fade-in slide-in-from-top-2">
               {!modelImage ? (
                <button 
                  onClick={() => modelInputRef.current?.click()}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-brand-blue hover:text-brand-blue text-gray-400"
                >
                  <input 
                    type="file" 
                    ref={modelInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleModelUpload}
                  />
                  <User size={20} />
                  <span className="text-xs">Upload Foto Model</span>
                </button>
               ) : (
                <div className="relative h-24 w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex justify-center">
                  <img src={modelImage.url} alt="Model" className="h-full object-contain" />
                  <button 
                    onClick={() => setModelImage(null)}
                    className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
               )}
             </div>
          )}
        </section>

        {/* Step 3: Lokasi */}
        <section className={!productImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800">Pilihan Lokasi</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {LOCATION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setLocation(opt)}
                className={`py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-2 ${location === opt ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'}`}
              >
                <MapPin size={14} /> {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Step 4: Gaya Tampilan */}
        <section className={!productImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="font-semibold text-gray-800">Gaya Tampilan</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setStyle(opt)}
                className={`py-2 rounded-lg text-[11px] font-medium border transition-all truncate ${style === opt ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'}`}
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
                placeholder="Gaya manual (misal: Retro)..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm"
              />
              <button
                onClick={handleSuggestStyle}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
          )}
        </section>

        {/* Step 5: Instruksi */}
        <section className={!productImage ? 'opacity-50 pointer-events-none' : ''}>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">5</div>
            <h3 className="font-semibold text-gray-800">Instruksi Tambahan (Opsional)</h3>
          </div>

          <div className="relative">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Detail tambahan (misal: Pose berjalan, close up produk)..."
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-sm min-h-[80px] resize-none"
              />
              <button
                onClick={handleSuggestInstruction}
                className="absolute bottom-3 right-3 text-xs bg-white border border-gray-200 hover:border-brand-blue text-gray-600 hover:text-brand-blue px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
        </section>

        {/* Step 6: Rasio */}
        <section className={!productImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">6</div>
            <h3 className="font-semibold text-gray-800">Pilih Rasio</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
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
          disabled={!productImage || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-2
            ${!productImage || loadingState === LoadingState.GENERATING
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
              <Shirt size={20} />
              <span>Buat Foto Fashion</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 rounded-3xl border border-gray-200 p-6 flex flex-col">
        <h3 className="font-semibold text-gray-700 mb-6">Hasil Foto Fashion</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((res, idx) => (
                <div key={idx} className="group relative aspect-square bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <Shirt size={32} />
              </div>
              <h4 className="font-medium text-gray-500 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Foto fashion yang menarik akan muncul di sini (4 variasi).
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

export default FotoFashion;
