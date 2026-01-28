
import React, { useState, useRef } from 'react';
import { Upload, X, Wand2, Eye, Download, ImagePlus, Loader2 } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { generateMergeInstruction, generateMergedImage } from '../services/geminiService';

const GabungProduk: React.FC = () => {
  // State
  const [images, setImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('Auto');
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const RATIO_OPTIONS = ['Auto', '1:1', '16:9', '9:16'];
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 6;

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      alert(`Maksimal ${MAX_IMAGES} gambar.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];
    
    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages(prev => [...prev, {
          id: crypto.randomUUID(),
          data: result,
          mimeType: file.type,
          url: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleGenerateInstruction = async () => {
    if (images.length === 0) return;
    setLoadingText('Menganalisis produk...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestedPrompt = await generateMergeInstruction(images);
      setPrompt(suggestedPrompt);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleMergeStart = async () => {
    if (images.length < MIN_IMAGES) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Sedang menggabungkan produk... (Membuat 4 variasi)');
    setResults([]);

    try {
      // Generate 4 variations in parallel
      const promises = [1, 2, 3, 4].map(() => 
        generateMergedImage(images, prompt, aspectRatio)
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat gambar. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `gabung-produk-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Bahan Gambar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Bahan Gambar</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden group">
                <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {images.length < MAX_IMAGES && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-2 hover:border-brand-blue dark:hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
              >
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <ImagePlus size={24} />
                <span className="text-[10px] font-medium">Min {MIN_IMAGES} - Max {MAX_IMAGES}</span>
              </button>
            )}
          </div>
        </section>

        {/* Step 2: Instruksi */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Instruksi Penggabungan</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Gabungkan foto dengan background podium marmer mewah dengan pencahayaan studio..."
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-sm min-h-[100px] resize-none placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleGenerateInstruction}
                disabled={images.length === 0 || loadingState === LoadingState.GENERATING}
                className="absolute bottom-3 right-3 text-xs bg-white dark:bg-dark-sidebar border border-gray-200 dark:border-dark-border hover:border-brand-blue text-gray-600 dark:text-gray-300 hover:text-brand-blue px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <Wand2 size={12} />
                {loadingState === LoadingState.GENERATING && loadingText.includes('Menganalisis') ? 'Thinking...' : 'AI Generate'}
              </button>
            </div>
          </div>
        </section>

        {/* Step 3: Format */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Format Gambar</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {RATIO_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`
                  py-2 rounded-lg text-sm font-medium border transition-all
                  ${aspectRatio === r 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'}
                `}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* CTA Button */}
        <button
          onClick={handleMergeStart}
          disabled={images.length < MIN_IMAGES || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-4
            ${images.length < MIN_IMAGES || loadingState === LoadingState.GENERATING
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
              <Wand2 size={20} />
              <span>Mulai Penggabungan</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Preview Area */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Generate</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((res, idx) => (
                <div key={idx} className="group relative aspect-square bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
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
                <ImagePlus size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Pilih gambar, atur rasio, dan klik tombol untuk melihat keajaiban AI di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Popup Modal */}
      {previewPopup && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setPreviewPopup(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={previewPopup} alt="Full Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
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

export default GabungProduk;
