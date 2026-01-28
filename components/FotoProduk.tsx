
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Sparkles, Camera, Sun, Moon, Box, Users } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { generateProductInstruction, generateProductPhoto } from '../services/geminiService';

const FotoProduk: React.FC = () => {
  // State
  const [image, setImage] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);
  
  // Settings State
  const [lighting, setLighting] = useState<'Light' | 'Dark'>('Light');
  const [mood, setMood] = useState<'Clean' | 'Crowd'>('Clean');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const RATIO_OPTIONS = ['1:1', '9:16', '16:9', '3:4'];

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
      setPrompt('');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setImage(null);
    setResults([]);
    setPrompt('');
  };

  const handleGenerateInstruction = async () => {
    if (!image) return;
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Menganalisis produk...');
    try {
      const suggestion = await generateProductInstruction(image);
      setPrompt(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Sedang membuat foto produk... (Membuat 4 variasi)');
    setResults([]);

    try {
      const settings = {
        lighting,
        mood,
        aspectRatio,
        userPrompt: prompt
      };

      // Generate 4 variations
      const promises = [1, 2, 3, 4].map(() => 
        generateProductPhoto(image, settings)
      );

      const generatedImages = await Promise.all(promises);
      setResults(generatedImages);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat foto produk. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `foto-produk-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-auto md:h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="w-full lg:flex-1 flex flex-col gap-6 md:overflow-y-auto md:pr-2 pb-4 md:pb-20">
        
        {/* Step 1: Upload */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Foto Produk</h3>
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
                 <Camera size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Klik untuk Upload</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Max 1 Foto Produk</span>
              </div>
            </button>
          ) : (
            <div className="relative aspect-video w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden group bg-gray-50 dark:bg-dark-card flex justify-center">
              <img src={image.url} alt="Product" className="h-full object-contain" />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Settings */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pengaturan Visual</h3>
          </div>
          
          <div className="space-y-4">
            {/* Lighting */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Pencahayaan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLighting('Light')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all ${
                    lighting === 'Light' 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                      : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                  }`}
                >
                  <Sun size={16} /> Light
                </button>
                <button
                  onClick={() => setLighting('Dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all ${
                    lighting === 'Dark' 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                      : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                  }`}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Suasana (Mood)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMood('Clean')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all ${
                    mood === 'Clean' 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                      : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                  }`}
                >
                  <Box size={16} /> Clean
                </button>
                <button
                  onClick={() => setMood('Crowd')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all ${
                    mood === 'Crowd' 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                      : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                  }`}
                >
                  <Users size={16} /> Crowd
                </button>
              </div>
            </div>

             {/* Ratio */}
             <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Aspek Rasio</label>
              <div className="grid grid-cols-4 gap-2">
                {RATIO_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                      aspectRatio === r 
                        ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                        : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Instruction */}
        <section className={!image ? 'opacity-50 pointer-events-none' : ''}>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Instruksi Tambahan (Opsional)</h3>
          </div>

          <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Tambahkan background marmer putih, buat terlihat mewah..."
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border dark:text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-sm min-h-[100px] resize-none placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleGenerateInstruction}
                disabled={!image || (loadingState === LoadingState.GENERATING)}
                className="absolute bottom-3 right-3 text-xs bg-white dark:bg-dark-sidebar border border-gray-200 dark:border-dark-border hover:border-brand-blue text-gray-600 dark:text-gray-300 hover:text-brand-blue px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <Sparkles size={12} />
                {loadingState === LoadingState.GENERATING && loadingText.includes('Menganalisis') ? 'Thinking...' : 'AI Generate Instruksi'}
              </button>
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
              <Sparkles size={20} />
              <span>Generate Foto Produk</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="w-full lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors min-h-[400px]">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Foto Produk</h3>
        
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
                <Camera size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Hasil foto produk komersial akan muncul di sini (4 variasi).
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

export default FotoProduk;
