import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageFile) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file gambar yang valid (PNG/JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const url = URL.createObjectURL(file);
      
      const newImage: ImageFile = {
        id: crypto.randomUUID(),
        data: result,
        mimeType: file.type,
        url: url
      };

      onImageSelected(newImage);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={`
        cursor-pointer group relative overflow-hidden rounded-2xl 
        border-2 border-dashed border-gray-300 bg-white
        hover:border-brand-blue hover:bg-blue-50/30 transition-all duration-300
        flex flex-col items-center justify-center p-10 text-center
        ${className}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      
      <div className="w-16 h-16 mb-4 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Upload size={28} />
      </div>
      
      <h3 className="text-gray-700 font-semibold mb-1">Unggah Foto</h3>
      <p className="text-gray-400 text-sm max-w-xs">
        Klik untuk memilih foto yang ingin diedit
      </p>
    </div>
  );
};

export default ImageUploader;