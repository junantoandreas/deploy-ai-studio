import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Loader2, Heart, Sparkles, Image as ImageIcon, Camera, MapPin, User } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { 
  generateWeddingStyleSuggestion, 
  generateWeddingCameraSuggestion, 
  generateWeddingLocationSuggestion, 
  generateWeddingPhoto 
} from '../services/geminiService';

const Wedding: React.FC = () => {
  // --- STATE ---
  const [groomImage, setGroomImage] = useState<ImageFile | null>(null);
  const [brideImage, setBrideImage] = useState<ImageFile | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingText, setLoadingText] = useState('');
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);

  // Settings
  const [style, setStyle] = useState('Modern');
  const [customStyle, setCustomStyle] = useState('');
  
  const [camera, setCamera] = useState('Wide Shot');
  const [customCamera, setCustomCamera] = useState('');
  
  const [location, setLocation] = useState('Ballroom');
  const [customLocation, setCustomLocation] = useState('');

  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Refs
  const groomInputRef = useRef<HTMLInputElement>(null);
  const brideInputRef = useRef<HTMLInputElement>(null);

  // Options
  const STYLE_OPTIONS = ['Modern', 'Klasik', 'Rustic', 'Glamour', 'Kustom'];
  const CAMERA_OPTIONS = ['Wide Shot', 'Close Up', 'Medium Shot', 'Kustom'];
  const LOCATION_OPTIONS = ['Ballroom', 'Garden', 'Beach', 'Church', 'Kustom'];
  const RATIO_OPTIONS = ['1:1', '16:9', '9:16', '3:4'];

  // --- HANDLERS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'groom' | 'bride') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon upload file gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img: ImageFile = {
        id: crypto.randomUUID(),
        data: ev.target?.result as string,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      };
      
      if (type === 'groom') setGroomImage(img);
      else setBrideImage(img);
      
      setResults([]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // AI Suggestion Handlers
  const handleSuggestStyle = async () => {
    if (!groomImage || !brideImage) return;
    setLoadingText('Menganalisis gaya...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const suggestion = await generateWeddingStyleSuggestion(groomImage, brideImage);
      setCustomStyle(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSuggestCamera = async () => {
    if (!groomImage || !brideImage) return;
    setLoadingText('Menganalisis kamera...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const styleToUse = style === 'Kustom' ? customStyle : style;
      const suggestion = await generateWeddingCameraSuggestion(groomImage, brideImage, styleToUse);
      setCustomCamera(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSuggestLocation = async () => {
    if (!groomImage || !brideImage) return;
    setLoadingText('Mencari lokasi...');
    setLoadingState(LoadingState.GENERATING);
    try {
      const styleToUse = style === 'Kustom' ? customStyle : style;
      const suggestion = await generateWeddingLocationSuggestion(groomImage, brideImage, styleToUse);
      setCustomLocation(suggestion);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Main Generation
  const handleGenerate = async () => {
    if (!groomImage || !brideImage) return;
    
    setLoadingState(LoadingState.GENERATING);
    setLoadingText('Membuat foto pernikahan... (4 Variasi)');
    setResults([]);

    try {
      const finalStyle = style === 'Kustom' ? customStyle : style;
      const finalCamera = camera === 'Kustom' ? customCamera : camera;
      const finalLocation = location === 'Kustom' ? customLocation : location;

      const promises = [1, 2, 3, 4].map(() => 
        generateWeddingPhoto(
          groomImage,
          brideImage,
          finalStyle,
          finalCamera,
          finalLocation,
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
    link.download = `wedding-${index + 1}-${Date.now()}.png`;
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
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Foto Mempelai</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Groom Upload */}
            <div>
               <label className="text-xs font-medium text-gray-500 mb-2 block">Pria (Groom)</label>
               {!groomImage ? (
                <button 
                  onClick={() => groomInputRef.current?.click()}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-2 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
                >
                  <input 
                    type="file" 
                    ref={groomInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'groom')}
                  />
                  <User size={20} />
                  <span className="text-[10px]">Upload</span>
                </button>
               ) : (
                <div className="relative aspect-square w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden bg-gray-50 dark:bg-dark-card">
                  <img src={groomImage.url} alt="Groom" className="h-full w-full object-cover" />
                  <button 
                    onClick={() => { setGroomImage(null); setResults([]); }}
                    className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
               )}
            </div>

            {/* Bride Upload */}
            <div>
               <label className="text-xs font-medium text-gray-500 mb-2 block">Wanita (Bride)</label>
               {!brideImage ? (
                <button 
                  onClick={() => brideInputRef.current?.click()}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center gap-2 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-dark-card/50 transition-colors text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue"
                >
                  <input 
                    type="file" 
                    ref={brideInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'bride')}
                  />
                  <User size={20} />
                  <span className="text-[10px]">Upload</span>
                </button>
               ) : (
                <div className="relative aspect-square w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden bg-gray-50 dark:bg-dark-card">
                  <img src={brideImage.url} alt="Bride" className="h-full w-full object-cover" />
                  <button 
                    onClick={() => { setBrideImage(null); setResults([]); }}
                    className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
               )}
            </div>
          </div>
        </section>

        {/* Step 2: Pilih Gaya */}
        <section className={(!groomImage || !brideImage) ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Gaya Pernikahan</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setStyle(opt)}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium border transition-all truncate ${
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
                placeholder="Gaya kustom (misal: Garden Party)..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
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

        {/* Step 3: Pengaturan Kamera */}
        <section className={(!groomImage || !brideImage) ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pengaturan Kamera</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            {CAMERA_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setCamera(opt)}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium border transition-all truncate ${
                  camera === opt 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {camera === 'Kustom' && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={customCamera}
                onChange={(e) => setCustomCamera(e.target.value)}
                placeholder="Setting kamera manual..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleSuggestCamera}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Camera size={12} />
                AI Generate
              </button>
            </div>
          )}
        </section>

        {/* Step 4: Pilih Lokasi */}
        <section className={(!groomImage || !brideImage) ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilih Lokasi</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {LOCATION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setLocation(opt)}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium border transition-all truncate ${
                  location === opt 
                    ? 'bg-brand-blue dark:bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-brand-blue/50 dark:hover:border-brand-blue/50 dark:hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {location === 'Kustom' && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Lokasi manual..."
                className="w-full p-3 pr-24 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button
                onClick={handleSuggestLocation}
                className="absolute top-1.5 right-1.5 text-xs bg-brand-blue text-white hover:bg-blue-600 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <MapPin size={12} />
                AI Generate
              </button>
            </div>
          )}
        </section>

        {/* Step 5: Rasio */}
        <section className={(!groomImage || !brideImage) ? 'opacity-50 pointer-events-none' : ''}>
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
          onClick={handleGenerate}
          disabled={!groomImage || !brideImage || loadingState === LoadingState.GENERATING}
          className={`
            w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all mt-2
            ${!groomImage || !brideImage || loadingState === LoadingState.GENERATING
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
              <Heart size={20} />
              <span>Buat Foto Wedding</span>
            </>
          )}
        </button>

      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Wedding</h3>
        
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
                <Heart size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Belum Ada Hasil</h4>
              <p className="text-sm max-w-[250px]">
                Hasil foto wedding yang estetik akan muncul di sini (4 variasi).
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

export default Wedding;