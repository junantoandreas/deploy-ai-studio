
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Eye, Download, ImagePlus, Loader2, Eraser, RotateCcw } from 'lucide-react';
import { ImageFile, LoadingState } from '../types';
import { magicEraserWithGemini } from '../services/geminiService';

const MagicEraser: React.FC = () => {
  // State
  const [image, setImage] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [previewPopup, setPreviewPopup] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // Initialize Canvas when image loads
  useEffect(() => {
    if (image && containerRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      
      const img = new Image();
      img.src = image.url;
      img.onload = () => {
         // Reset canvas to match image dimensions
         canvas.width = img.width;
         canvas.height = img.height;
         const ctx = canvas.getContext('2d');
         if(ctx) {
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           ctx.lineCap = 'round';
           ctx.lineJoin = 'round';
         }
      };
    }
  }, [image]);

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
      setResult(null);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const removeImage = () => {
    setImage(null);
    setResult(null);
  };

  // Drawing Logic
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Map screen coordinates to canvas internal coordinates
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const { x, y } = getMousePos(e);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Semi-transparent green for UI
      ctx.lineWidth = brushSize * (canvasRef.current!.width / containerRef.current!.clientWidth); // Adjust brush size to scale
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    e.preventDefault(); // Prevent scrolling on touch
    
    const { x, y } = getMousePos(e);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.closePath();
  };

  const handleErase = async () => {
    if (!image || !canvasRef.current) return;
    
    setLoadingState(LoadingState.GENERATING);
    setResult(null);

    try {
      // Create a temporary canvas to generate a high-contrast mask for the AI
      const canvas = canvasRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) throw new Error("Could not create temp context");

      // Draw the user's strokes (which are semi-transparent green) onto the temp canvas
      tempCtx.drawImage(canvas, 0, 0);

      // Post-process the temp canvas: Turn any non-transparent pixel into SOLID RED
      // This gives the AI a very clear, binary-like mask signal
      const imgData = tempCtx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // If alpha > 0 (it has been drawn on)
        if (data[i + 3] > 0) {
           data[i] = 255;     // Red: 255
           data[i + 1] = 0;   // Green: 0
           data[i + 2] = 0;   // Blue: 0
           data[i + 3] = 255; // Alpha: 255 (Fully Opaque)
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
      
      const maskDataUrl = tempCanvas.toDataURL('image/png');
      
      const generatedImage = await magicEraserWithGemini(image, maskDataUrl);
      setResult(generatedImage);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus objek. Silakan coba lagi.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `magic-eraser-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Controls & Editor */}
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 pb-20">
        
        {/* Step 1: Upload */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upload Gambar</h3>
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
                <span className="text-sm font-medium block">Klik untuk Upload</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Max 1 Foto</span>
              </div>
            </button>
          ) : (
             <div className="relative w-full rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden bg-gray-900" ref={containerRef}>
                {/* Editor Area */}
                <div className="relative w-full">
                  <img src={image.url} alt="To Edit" className="w-full h-auto block" />
                  <canvas 
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                
                {/* Image Actions */}
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10"
                  title="Ganti Gambar"
                >
                  <X size={16} />
                </button>
                 <button 
                  onClick={resetCanvas}
                  className="absolute top-2 right-12 bg-white/90 p-2 rounded-full text-gray-600 hover:text-brand-blue transition-colors shadow-sm z-10"
                  title="Reset Brush"
                >
                  <RotateCcw size={16} />
                </button>
             </div>
          )}
        </section>

        {/* Step 2 & 3: Brush Controls & Action */}
        <section className={`${!image ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Tandai Objek</h3>
          </div>

          <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-dark-border mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Ukuran Brush</span>
              <span className="text-xs text-gray-400">{brushSize}px</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />
            <p className="text-xs text-gray-400 mt-2">
              Usapkan brush berwarna hijau pada area objek yang ingin dihapus.
            </p>
          </div>

          <button
            onClick={handleErase}
            disabled={!image || loadingState === LoadingState.GENERATING}
            className={`
              w-full py-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-3 transition-all
              ${!image || loadingState === LoadingState.GENERATING
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-brand-blue to-blue-500 hover:shadow-xl hover:scale-[1.01]'}
            `}
          >
            {loadingState === LoadingState.GENERATING ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Sedang Menghapus...</span>
              </>
            ) : (
              <>
                <Eraser size={20} />
                <span>Hapus Objek</span>
              </>
            )}
          </button>
        </section>
      </div>

      {/* RIGHT COLUMN: Result */}
      <div className="lg:w-[500px] xl:w-[600px] shrink-0 bg-gray-50 dark:bg-dark-sidebar rounded-3xl border border-gray-200 dark:border-dark-border p-6 flex flex-col transition-colors">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Hasil Magic Eraser</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {result ? (
            <div className="w-full h-full flex flex-col gap-4">
               <div className="relative w-full flex-1 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden flex items-center justify-center group">
                 <img src={result} alt="Result" className="max-w-full max-h-full object-contain" />
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setPreviewPopup(result)}
                      className="p-3 bg-white text-gray-800 rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                      title="Preview Fullscreen"
                    >
                      <Eye size={24} />
                    </button>
                  </div>
               </div>
               
               <button 
                  onClick={downloadResult}
                  className="w-full py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-blue dark:hover:text-brand-blue transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Hasil
                </button>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500 p-8 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl w-full">
              <div className="w-16 h-16 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-4 mx-auto text-gray-300 dark:text-gray-600">
                <Eraser size={32} />
              </div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Preview Hasil</h4>
              <p className="text-sm">
                Hasil gambar yang sudah dibersihkan akan muncul di sini.
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

export default MagicEraser;
