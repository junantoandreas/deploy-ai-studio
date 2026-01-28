
import React from 'react';
import GabungProduk from './GabungProduk';
import HapusLatar from './HapusLatar';
import MagicEraser from './MagicEraser';
import EditFoto from './EditFoto';
import PerbaikiFoto from './PerbaikiFoto';
import FotoProduk from './FotoProduk';
import ModelProduk from './ModelProduk';
import BuatMockup from './BuatMockup';
import PasFoto from './PasFoto';
import FotoAnak from './FotoAnak';
import FotoBayi from './FotoBayi';
import DesainInterior from './DesainInterior';
import DesainEksterior from './DesainEksterior';
import SketsaGambar from './SketsaGambar';
import SeniLukis from './SeniLukis';
import Prewedding from './Prewedding';
import Wedding from './Wedding';
import FotoFashion from './FotoFashion';
import DesainBanner from './DesainBanner';
import FotoMiniatur from './FotoMiniatur';
import Beranda from './Beranda';
import { Heart, Zap } from 'lucide-react';

interface WorkspaceProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ activeMenu, setActiveMenu }) => {
  
  const renderContent = () => {
    switch(activeMenu) {
      // Beranda
      case 'Beranda':
        return <Beranda setActiveMenu={setActiveMenu} />;

      // Edit Foto
      case 'Gabung Produk':
        return <GabungProduk />;
      case 'Hapus Latar':
      case 'HapusLatar':
        return <HapusLatar />;
      case 'Magic Eraser':
        return <MagicEraser />;
      case 'Edit Foto':
        return <EditFoto />;
      case 'Perbaiki Foto':
        return <PerbaikiFoto />;
      
      // Komersial
      case 'Foto Produk':
        return <FotoProduk />;
      case 'Model + Produk':
        return <ModelProduk />;
      case 'Buat Mockup':
        return <BuatMockup />;
      
      // Fotografer
      case 'Pas Foto':
        return <PasFoto />;
      case 'Foto Anak':
        return <FotoAnak />;
      case 'Foto Bayi':
        return <FotoBayi />;

      // Desain & Art
      case 'Desain Interior':
        return <DesainInterior />;
      case 'Desain Eksterior':
        return <DesainEksterior />;
      case 'Sketsa Gambar':
        return <SketsaGambar />;
      case 'Seni Lukis':
        return <SeniLukis />;

      // Wedding
      case 'Prewedding':
        return <Prewedding />;
      case 'Wedding':
        return <Wedding />;

      // Update
      case 'Foto Fashion':
        return <FotoFashion />;
      case 'Desain Banner':
        return <DesainBanner />;
      case 'Foto Miniatur':
        return <FotoMiniatur />;
      case 'Update':
        return (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-dark-muted">
             <div className="w-20 h-20 bg-blue-50 dark:bg-dark-card text-brand-blue rounded-full flex items-center justify-center mb-6 relative">
               <Zap size={40} />
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">New</span>
             </div>
             <h2 className="text-2xl font-light mb-2 text-gray-700 dark:text-white">Fitur {activeMenu}</h2>
             <p className="max-w-md text-center text-sm">
               Fitur ini adalah bagian dari update terbaru kami dan sedang dalam tahap akhir pengembangan. Segera hadir untuk Anda!
             </p>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-dark-muted">
            <p>Fitur <strong>{activeMenu}</strong> akan segera hadir.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 h-[100dvh] md:h-screen overflow-hidden bg-white dark:bg-dark-bg relative flex flex-col transition-colors duration-300">
      {/* Top Bar */}
      {activeMenu !== 'Beranda' && (
        <header className="h-16 border-b border-gray-100 dark:border-dark-border flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md z-10 shrink-0 transition-colors">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">{activeMenu}</h1>
        </header>
      )}

      {/* Main Content Area */}
      {/* 
          Mobile: p-4 padding, overflow-y-auto (scroll whole page)
          Desktop: p-8 padding, overflow-hidden (scroll per column inside component) 
      */}
      <div className={`flex-1 relative ${activeMenu === 'Beranda' ? 'p-0' : 'p-4 md:p-8'} overflow-y-auto md:overflow-hidden`}>
        {renderContent()}
      </div>
    </main>
  );
};

export default Workspace;
