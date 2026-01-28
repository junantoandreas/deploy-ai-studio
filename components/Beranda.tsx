
import React, { useState } from 'react';
import { 
  Search, 
  Scissors, 
  Camera, 
  Eraser, 
  Contact, 
  Armchair, 
  Baby, 
  Brush, 
  Shirt, 
  RectangleHorizontal,
  Layers,
  Image,
  Wand2,
  Users,
  Box,
  Smile,
  TreePine,
  Pencil,
  HeartHandshake,
  Heart,
  Minimize2,
  Info
} from 'lucide-react';

interface BerandaProps {
  setActiveMenu: (menu: string) => void;
}

const Beranda: React.FC<BerandaProps> = ({ setActiveMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // List of all available features
  const allFeatures = [
    { name: 'Gabung Produk', icon: Layers, desc: 'Gabungkan beberapa produk' },
    { name: 'Hapus Latar', icon: Scissors, desc: 'Hapus background otomatis' },
    { name: 'Magic Eraser', icon: Eraser, desc: 'Hapus objek yang tidak diinginkan' },
    { name: 'Edit Foto', icon: Image, desc: 'Edit foto dengan instruksi AI' },
    { name: 'Perbaiki Foto', icon: Wand2, desc: 'Perjelas foto buram/lama' },
    { name: 'Foto Produk', icon: Camera, desc: 'Foto produk profesional' },
    { name: 'Model + Produk', icon: Users, desc: 'Pasang produk ke model AI' },
    { name: 'Buat Mockup', icon: Box, desc: 'Buat mockup produk realistik' },
    { name: 'Pas Foto', icon: Contact, desc: 'Buat pas foto formal' },
    { name: 'Foto Anak', icon: Smile, desc: 'Foto anak kreatif' },
    { name: 'Foto Bayi', icon: Baby, desc: 'Foto bayi tema lucu' },
    { name: 'Desain Interior', icon: Armchair, desc: 'Desain ulang ruangan' },
    { name: 'Desain Eksterior', icon: TreePine, desc: 'Renovasi bangunan luar' },
    { name: 'Sketsa Gambar', icon: Pencil, desc: 'Ubah sketsa jadi gambar' },
    { name: 'Seni Lukis', icon: Brush, desc: 'Ubah foto jadi lukisan' },
    { name: 'Prewedding', icon: HeartHandshake, desc: 'Foto prewedding AI' },
    { name: 'Wedding', icon: Heart, desc: 'Foto pernikahan impian' },
    { name: 'Foto Fashion', icon: Shirt, desc: 'Foto fashion & outfit' },
    { name: 'Desain Banner', icon: RectangleHorizontal, desc: 'Buat banner promosi' },
    { name: 'Foto Miniatur', icon: Minimize2, desc: 'Efek miniatur tilt-shift' },
  ];

  // Top 9 Quick Features
  const quickFeatures = [
    { name: 'Hapus Latar', icon: Scissors, desc: 'Hapus background instan', color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400' },
    { name: 'Foto Produk', icon: Camera, desc: 'Studio foto virtual', color: 'bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400' },
    { name: 'Magic Eraser', icon: Eraser, desc: 'Hapus objek pengganggu', color: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' },
    { name: 'Pas Foto', icon: Contact, desc: 'Formal & Rapi', color: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400' },
    { name: 'Desain Interior', icon: Armchair, desc: 'Inspirasi ruangan', color: 'bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400' },
    { name: 'Foto Bayi', icon: Baby, desc: 'Tema lucu & imut', color: 'bg-pink-50 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400' },
    { name: 'Seni Lukis', icon: Brush, desc: 'Artistike & estetik', color: 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { name: 'Foto Fashion', icon: Shirt, desc: 'Katalog fashion', color: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400' },
    { name: 'Desain Banner', icon: RectangleHorizontal, desc: 'Promosi jualan', color: 'bg-teal-50 text-teal-500 dark:bg-teal-900/20 dark:text-teal-400' },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = allFeatures.filter(feature => 
        feature.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const navigateTo = (featureName: string) => {
    setActiveMenu(featureName);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-dark-bg transition-colors duration-300">
      
      {/* 1. Header Beranda */}
      <div className="pt-12 pb-8 px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Selamat datang di Ruang Foto!</h1>
        <p className="text-gray-500 dark:text-dark-muted font-light">Mulai edit foto dengan berbagai fitur AI</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        
        {/* 2. Fitur Pencarian */}
        <div className="relative mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-dark-border rounded-2xl leading-5 bg-white dark:bg-dark-card dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue shadow-sm transition-all"
              placeholder="Cari fitur (contoh: edit, hapus latar, bayi)"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.length > 0 && (
            <div className="absolute z-20 mt-2 w-full bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((feature, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateTo(feature.name)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-dark-border last:border-none"
                  >
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-brand-blue rounded-lg">
                      <feature.icon size={16} />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200 block text-sm">{feature.name}</span>
                      <span className="text-xs text-gray-400">{feature.desc}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Fitur tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Box Fitur Cepat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {quickFeatures.map((feature, idx) => (
            <button
              key={idx}
              onClick={() => navigateTo(feature.name)}
              className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-all group text-left flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl shrink-0 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 group-hover:text-brand-blue transition-colors">
                  {feature.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 4. Alert Informasi */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-center justify-center gap-3 text-blue-700 dark:text-blue-300 text-sm">
          <Info size={18} />
          <span className="font-medium">
            Tools hanya dapat digunakan selama kebijakan AI Google tidak berubah.
          </span>
        </div>

      </div>
    </div>
  );
};

export default Beranda;
