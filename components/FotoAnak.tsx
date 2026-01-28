
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Smile, Sparkles, User, Scissors, Wand2, Type } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { generateChildPhoto, generateChildPhotoSuggestion } from '../services/geminiService';

const FotoAnak: React.FC = () => {
  // State
  const [image, setImage] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);

  // Settings State
  const [gender, setGender] = useState('Laki-laki');
  const [style, setStyle] = useState('Sekolah');
  const [customStyle, setCustomStyle] = useState('');
  const [expression, setExpression] = useState('Tersenyum');
  const [customExpression, setCustomExpression] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const STYLE_OPTIONS = ['Sekolah', 'Ulang Tahun', 'Kustom'];
  const EXPRESSION_OPTIONS = ['Marah', 'Tersenyum', 'Melambai', 'Kustom'];
  const RATIO_OPTIONS = ['1:1', '9:16', '16:9'];

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
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setImage(null);
    setResults([]);
  };

  const handleAISuggest = async (type: 'style' | 'expression') => {
    if (!image) return;
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('AI sedang menganalisis foto...');
    try {
      const suggestion = await generateChildPhotoSuggestion(image, type);
      if (type === 'style') setCustomStyle(suggestion);
      else setCustomExpression(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Sedang membuat foto anak kreatif... (4 variasi)');
    setResults([]);

    try {
      const promises = [1, 2, 3, 4].map(() => 
        generateChildPhoto(image, gender, style, customStyle, expression, customExpression, aspectRatio)
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
    link.download = `foto-anak-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Upload */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Foto Anak</h3>
          </div>

          {!image ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-3 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-brand-blue">
                 <Upload size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload Foto</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Max 1 Foto Anak</span>
              </div>
            </button>
          ) : (
            <div className="relative aspect-video w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden group bg-gray-50 dark:bg-dark-card flex justify-center">
              <img src={image.url} alt="Child" className="h-full object-contain" />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-4 flex gap-4">
            {['Laki-laki', 'Perempuan'].map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                  gender === g 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                <User size={14} /> {g}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Gaya */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilihan Gaya</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setStyle(opt)}
                className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                  style === opt 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
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
                placeholder="Masukkan gaya manual (misal: Bertema Hutan)..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={() => handleAISuggest('style')}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
          )}
        </section>

        {/* Step 3: Ekspresi */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilihan Ekspresi</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {EXPRESSION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setExpression(opt)}
                className={`py-2 rounded-lg text-[11px] font-medium border transition-all ${
                  expression === opt 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {expression === 'Kustom' && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={customExpression}
                onChange={(e) => setCustomExpression(e.target.value)}
                placeholder="Instruksi ekspresi (misal: Tertawa bahagia)..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={() => handleAISuggest('expression')}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles size={12} />
                AI Generate
              </button>
            </div>
          )}
        </section>

        {/* Step 4: Rasio */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilihan Rasio</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
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
              <Smile size={20} />
              <span>Buat Foto Anak/Kids</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Foto Kreatif</h3>
        
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
                <Smile size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Hasil foto anak kreatif akan muncul di sini (4 variasi).
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

export default FotoAnak;
