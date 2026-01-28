
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Sparkles, Box, Smartphone, Package, Edit3, Image as ImageIcon } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { generateMockupCategory, generateMockup } from '../services/geminiService';

const BuatMockup: React.FC = () => {
  // State
  const [image, setImage] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);
  
  // Settings State
  const [category, setCategory] = useState<'Produk' | 'Kemasan' | 'Digital' | 'Kustom'>('Produk');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const RATIO_OPTIONS = ['1:1', '16:9', '9:16'];

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon upload file gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImage({
        id: crypto.randomUUID(),
        data: result,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      });
      setResults([]);
      setCustomPrompt('');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setImage(null);
    setResults([]);
    setCustomPrompt('');
  };

  const handleSuggestCategory = async () => {
    if (!image) return;
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Menganalisis desain...');
    try {
      const suggestion = await generateMockupCategory(image);
      setCustomPrompt(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Sedang membuat mockup... (Membuat 4 variasi)');
    setResults([]);

    try {
      // Generate 4 variations
      const promises = [1, 2, 3, 4].map(() => 
        generateMockup(image, category, customPrompt, aspectRatio)
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat mockup. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mockup-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get placeholder based on category
  const getPlaceholder = () => {
    switch (category) {
      case 'Produk': return "Contoh: Di atas meja kayu rustic, pencahayaan alami...";
      case 'Kemasan': return "Contoh: Di rak supermarket mewah, latar belakang blur...";
      case 'Digital': return "Contoh: Dipegang oleh tangan di cafe yang estetik...";
      default: return "Contoh: Billboard di pinggir jalan raya kota...";
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Upload */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Desain</h3>
          </div>

          {!image ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-3 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-brand-blue">
                 <ImageIcon size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload Desain</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Max 1 Gambar (Label, UI, Poster)</span>
              </div>
            </button>
          ) : (
            <div className="relative h-40 w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden group bg-gray-50 dark:bg-dark-card flex justify-center">
              <img src={image.url} alt="Design" className="h-full object-contain" />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Category */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Kategori & Detail Mockup</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {['Produk', 'Kemasan', 'Digital', 'Kustom'].map(opt => (
              <button
                key={opt}
                onClick={() => setCategory(opt as any)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  category === opt 
                    ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20 text-brand-blue' 
                    : 'border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 text-gray-600 dark:text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category === opt ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-dark-card text-gray-500'}`}>
                    {opt === 'Produk' && <Box size={16} />}
                    {opt === 'Kemasan' && <Package size={16} />}
                    {opt === 'Digital' && <Smartphone size={16} />}
                    {opt === 'Kustom' && <Edit3 size={16} />}
                </div>
                <span className="text-sm font-medium">{opt}</span>
              </button>
            ))}
          </div>

          <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleSuggestCategory}
                disabled={!image || loadingState === LoadingState.GENERATING}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <Sparkles size={12} />
                {loadingState === LoadingState.GENERATING && loadingText.includes('Menganalisis') ? '...' : 'AI Suggest'}
              </button>
          </div>
        </section>

        {/* Step 3: Ratio */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Rasio Output</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {RATIO_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
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
          onClick={handleGenerate}
          disabled={!image || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-2
            ${!image || loadingState === LoadingState.GENERATING
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
              <Box size={20} />
              <span>Buat Mockup</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Mockup</h3>
        
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
                <Box size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Mockup akan muncul di sini (4 variasi).
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

export default BuatMockup;
