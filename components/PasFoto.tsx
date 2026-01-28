
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Contact, Palette, Shirt, Maximize } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { generatePasFoto } from '../services/geminiService';

const PasFoto: React.FC = () => {
  // State
  const [faceImage, setFaceImage] = useState<ImageFile | null>(null);
  const [customClothing, setCustomClothing] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);

  // Settings State
  const [bgColor, setBgColor] = useState('Merah');
  const [customBgColor, setCustomBgColor] = useState('#FF0000');
  const [clothing, setClothing] = useState('Kemeja');
  const [size, setSize] = useState('3x4');

  const faceInputRef = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  const BG_COLORS = [
    { name: 'Merah', hex: '#FF0000' },
    { name: 'Biru', hex: '#0000FF' },
    { name: 'Putih', hex: '#FFFFFF' },
    { name: 'Hitam', hex: '#000000' },
    { name: 'Custom', hex: 'custom' },
  ];

  const CLOTHING_OPTIONS = ['Kemeja', 'Batik', 'Jas', 'Jas + Dasi', 'Blazer'];
  const SIZE_OPTIONS = ['2x3', '3x4', '4x6'];

  // Handlers
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon upload file gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const newImage = {
        id: crypto.randomUUID(),
        data: result,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      };

      setFaceImage(newImage);
      setResults([]);
      setLoadingState(LoadingState.IDLE);
    };
    reader.readAsDataURL(file);
    if (faceInputRef.current) faceInputRef.current.value = '';
  };

  const handleCustomClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomClothing({
        id: crypto.randomUUID(),
        data: ev.target?.result as string,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!faceImage) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Sedang membuat Pas Foto... (Membuat 4 variasi)');
    setResults([]);

    try {
      const finalColor = bgColor === 'Custom' ? customBgColor : bgColor;
      
      // Generate 4 variations
      const promises = [1, 2, 3, 4].map(() => 
        generatePasFoto(faceImage, finalColor, clothing, customClothing, size)
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat Pas Foto. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `pas-foto-${size}-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Upload Foto */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Foto</h3>
          </div>

          {!faceImage ? (
            <button 
              onClick={() => faceInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-3 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
            >
              <input 
                type="file" 
                ref={faceInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFaceUpload}
              />
              <div className="w-12 h-12 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-brand-blue">
                 <Contact size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload Foto</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Pilih foto orang atau subjek</span>
              </div>
            </button>
          ) : (
            <div className="relative aspect-video w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden group bg-gray-50 dark:bg-dark-card flex justify-center">
              <img src={faceImage.url} alt="Input" className="h-full object-contain" />
              <button 
                onClick={() => setFaceImage(null)}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Background Color */}
        <section className={!faceImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Warna Background</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {BG_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setBgColor(c.name)}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  bgColor === c.name 
                    ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                    : 'border-gray-100 dark:border-dark-border hover:border-brand-blue/30 dark:hover:border-brand-blue/30'
                }`}
              >
                <div 
                  className={`w-8 h-8 rounded-full border border-gray-200 dark:border-dark-border ${c.hex === 'custom' ? 'bg-gradient-to-tr from-red-500 via-green-500 to-blue-500' : ''}`}
                  style={c.hex !== 'custom' ? { backgroundColor: c.hex } : {}}
                />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{c.name}</span>
              </button>
            ))}
          </div>

          {bgColor === 'Custom' && (
             <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border animate-in fade-in slide-in-from-top-1">
                <Palette size={16} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pilih Warna:</span>
                <input 
                    type="color" 
                    value={customBgColor} 
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-10 h-10 border-none bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase">{customBgColor}</span>
             </div>
          )}
        </section>

        {/* Step 3: Pakaian */}
        <section className={!faceImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Mode Pakaian</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CLOTHING_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => { setClothing(opt); setCustomClothing(null); }}
                className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                  clothing === opt && !customClothing 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
            <button
                onClick={() => clothingInputRef.current?.click()}
                className={`py-2 px-1 rounded-lg text-[10px] font-medium border transition-all flex items-center justify-center gap-1.5 ${
                  customClothing 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border border-dashed hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
            >
                <input 
                  type="file" 
                  ref={clothingInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleCustomClothingUpload}
                />
                <Shirt size={12} />
                {customClothing ? 'Kustom Terpilih' : 'Unggah Sendiri'}
            </button>
          </div>

          {customClothing && (
            <div className="relative h-16 w-32 rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden bg-gray-50 dark:bg-dark-card mb-2">
                <img src={customClothing.url} alt="Custom Clothing" className="h-full w-full object-contain" />
                <button 
                  onClick={() => setCustomClothing(null)}
                  className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm"
                >
                  <X size={10} />
                </button>
            </div>
          )}
        </section>

        {/* Step 4: Ukuran */}
        <section className={!faceImage ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Ukuran Pas Foto</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {SIZE_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  size === s 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={!faceImage || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-2
            ${!faceImage || loadingState === LoadingState.GENERATING
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
              <Maximize size={20} />
              <span>Buat Pas Foto</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Pas Foto</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((res, idx) => (
                <div key={idx} className="group relative aspect-[3/4] bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden flex items-center justify-center">
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
                <Contact size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Pas Foto formal kamu akan muncul di sini (4 variasi).
              </p>
            </div>
          )}
        </div>
      </div>

       {/* Preview Popup Modal */}
       {previewPopup && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setPreviewPopup(null)}>
          <div className="relative max-w-lg max-h-full" onClick={e => e.stopPropagation()}>
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

export default PasFoto;
