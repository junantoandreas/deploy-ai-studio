
import React, { useState } from 'react';
import { 
  Camera, 
  Home, 
  Edit, 
  Layers, 
  Scissors, 
  Eraser, 
  Image, 
  Wand2, 
  ChevronDown, 
  ChevronRight, 
  ShoppingBag, 
  Users, 
  Box, 
  User, 
  Baby, 
  Smile, 
  Contact, 
  Palette, 
  Armchair, 
  TreePine, 
  Pencil, 
  Brush, 
  Heart, 
  HeartHandshake, 
  Zap, 
  Shirt, 
  RectangleHorizontal, 
  Minimize2, 
  Plus,
  Moon,
  Sun,
  X // Added X icon for closing
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isOpen?: boolean; // New prop for mobile state
  onClose?: () => void; // New prop for closing mobile menu
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeMenu, 
  setActiveMenu, 
  isDarkMode, 
  toggleDarkMode,
  isOpen = false, 
  onClose 
}) => {
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isKomersialMenuOpen, setIsKomersialMenuOpen] = useState(false);
  const [isFotograferMenuOpen, setIsFotograferMenuOpen] = useState(false);
  const [isDesainArtMenuOpen, setIsDesainArtMenuOpen] = useState(false);
  const [isWeddingMenuOpen, setIsWeddingMenuOpen] = useState(false);
  const [isUpdateMenuOpen, setIsUpdateMenuOpen] = useState(true);

  // Style classes based on requirements
  const activeStyle = "bg-brand-blue text-white shadow-md dark:bg-brand-blue dark:text-white"; 
  const inactiveStyle = "text-sidebar-text dark:text-dark-muted border border-transparent hover:bg-white dark:hover:bg-dark-card hover:border-t-brand-blue hover:border-t-[1px] hover:border-r-brand-blue hover:border-r-[1px] hover:border-b-brand-blue hover:border-b-[1px] hover:border-l-brand-blue hover:border-l-[3px] hover:shadow-sm dark:hover:border-none dark:hover:text-white";
  const baseMenuItemStyle = "flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-all duration-200 text-[14px] font-medium";

  const editFeatures = [
    { 
      name: 'Gabung Produk', 
      icon: Layers,
      badge: { text: 'Ai Otomatis', className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300' }
    },
    { 
      name: 'Hapus Latar', 
      icon: Scissors,
      badge: { text: 'Ai Presisi', className: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300' }
    },
    { name: 'Magic Eraser', icon: Eraser },
    { name: 'Edit Foto', icon: Image },
    { name: 'Perbaiki Foto', icon: Wand2 },
  ];

  const komersialFeatures = [
    { name: 'Foto Produk', icon: Camera },
    { 
      name: 'Model + Produk', 
      icon: Users,
      badge: { text: 'New', className: 'bg-red-500 text-white' }
    },
    { name: 'Buat Mockup', icon: Box },
  ];

  const fotograferFeatures = [
    { name: 'Pas Foto', icon: Contact },
    { name: 'Foto Anak', icon: Smile },
    { name: 'Foto Bayi', icon: Baby },
  ];

  const desainArtFeatures = [
    { name: 'Desain Interior', icon: Armchair },
    { name: 'Desain Eksterior', icon: TreePine },
    { name: 'Sketsa Gambar', icon: Pencil },
    { name: 'Seni Lukis', icon: Brush },
  ];

  const weddingFeatures = [
    { name: 'Prewedding', icon: HeartHandshake },
    { name: 'Wedding', icon: Heart },
  ];

  const updateFeatures = [
    { name: 'Foto Fashion', icon: Shirt },
    { name: 'Desain Banner', icon: RectangleHorizontal },
    { name: 'Foto Miniatur', icon: Minimize2 },
  ];

  // Helper to render sub-menu items with badges
  const renderSubMenuItems = (features: any[]) => {
    return features.map((feature) => {
      const Icon = feature.icon;
      const isActive = activeMenu === feature.name;
      return (
        <button
          key={feature.name}
          onClick={() => setActiveMenu(feature.name)}
          className={`
            ${baseMenuItemStyle} 
            ${isActive ? activeStyle : inactiveStyle}
            !py-2.5 !text-[13px] justify-between
          `}
        >
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Icon size={16} />
            <span>{feature.name}</span>
          </div>
          {feature.badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ml-2 shrink-0 ${feature.badge.className}`}>
              {feature.badge.text}
            </span>
          )}
        </button>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Main Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-full md:w-80 h-[100dvh] md:h-screen bg-sidebar dark:bg-dark-sidebar border-r border-transparent dark:border-dark-border 
          flex flex-col md:rounded-tr-[35px] md:rounded-br-[35px] shrink-0 shadow-xl md:shadow-sm 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          
          {/* Logo Section */}
          <div className="p-6 md:p-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-text dark:bg-brand-blue rounded-lg flex items-center justify-center text-white">
                <Camera size={18} />
              </div>
              <span className="font-semibold text-sidebar-text dark:text-white text-lg tracking-tight">
                Ruang Foto
              </span>
            </div>
            {/* Close Button Mobile Only */}
            <button 
              onClick={onClose} 
              className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-card text-gray-500 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Section */}
          <nav className="flex-1 px-4 flex flex-col gap-2 pb-4">
            
            {/* Upload Button */}
            <button
              onClick={() => setActiveMenu('Desain Banner')}
              className="flex items-center justify-between w-full bg-brand-blue text-white px-4 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-500 dark:hover:bg-blue-500 transition-all mb-6 group"
            >
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Plus size={18} strokeWidth={3} />
                </div>
                <span className="font-semibold text-sm tracking-wide">Upload Foto</span>
              </div>
              <ChevronRight size={18} className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Menu: Beranda */}
            <button
              onClick={() => setActiveMenu('Beranda')}
              className={`${baseMenuItemStyle} ${activeMenu === 'Beranda' ? activeStyle : inactiveStyle}`}
            >
              <Home size={18} />
              <span>Beranda</span>
            </button>

            {/* Menu: Edit Foto (Parent) */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsEditMenuOpen(!isEditMenuOpen)}
                className={`${baseMenuItemStyle} ${inactiveStyle} justify-between group`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Edit size={18} />
                  <span>Edit Foto</span>
                </div>
                {isEditMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isEditMenuOpen && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-200 dark:border-dark-border pl-2 animate-in slide-in-from-top-2 duration-200">
                  {renderSubMenuItems(editFeatures)}
                </div>
              )}
            </div>

            {/* Menu: Komersial (Parent) */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsKomersialMenuOpen(!isKomersialMenuOpen)}
                className={`${baseMenuItemStyle} ${inactiveStyle} justify-between group`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <ShoppingBag size={18} />
                  <span>Komersial</span>
                </div>
                {isKomersialMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isKomersialMenuOpen && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-200 dark:border-dark-border pl-2 animate-in slide-in-from-top-2 duration-200">
                  {renderSubMenuItems(komersialFeatures)}
                </div>
              )}
            </div>

            {/* Menu: Fotografer (Parent) */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsFotograferMenuOpen(!isFotograferMenuOpen)}
                className={`${baseMenuItemStyle} ${inactiveStyle} justify-between group`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <User size={18} />
                  <span>Fotografer</span>
                </div>
                {isFotograferMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isFotograferMenuOpen && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-200 dark:border-dark-border pl-2 animate-in slide-in-from-top-2 duration-200">
                  {renderSubMenuItems(fotograferFeatures)}
                </div>
              )}
            </div>

            {/* Menu: Desain & Art (Parent) */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsDesainArtMenuOpen(!isDesainArtMenuOpen)}
                className={`${baseMenuItemStyle} ${inactiveStyle} justify-between group`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Palette size={18} />
                  <span>Desain & Art</span>
                </div>
                {isDesainArtMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isDesainArtMenuOpen && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-200 dark:border-dark-border pl-2 animate-in slide-in-from-top-2 duration-200">
                  {renderSubMenuItems(desainArtFeatures)}
                </div>
              )}
            </div>

            {/* Menu: Wedding (Parent) */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsWeddingMenuOpen(!isWeddingMenuOpen)}
                className={`${baseMenuItemStyle} ${inactiveStyle} justify-between group`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Heart size={18} />
                  <span>Wedding</span>
                </div>
                {isWeddingMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isWeddingMenuOpen && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-200 dark:border-dark-border pl-2 animate-in slide-in-from-top-2 duration-200">
                  {renderSubMenuItems(weddingFeatures)}
                </div>
              )}
            </div>

            {/* Menu: Update (Parent) */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsUpdateMenuOpen(!isUpdateMenuOpen)}
                className={`${baseMenuItemStyle} ${inactiveStyle} justify-between group`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Zap size={18} />
                  <span>Update</span>
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 leading-none">New</span>
                </div>
                {isUpdateMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isUpdateMenuOpen && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-200 dark:border-dark-border pl-2 animate-in slide-in-from-top-2 duration-200">
                  {renderSubMenuItems(updateFeatures)}
                </div>
              )}
            </div>

          </nav>
        </div>

        {/* Footer / Theme Toggle */}
        <div className="p-4 mt-auto border-t border-gray-100 dark:border-dark-border shrink-0 bg-sidebar dark:bg-dark-sidebar transition-colors">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-[#2a2a2d] transition-all mb-3 group"
          >
            <div className="flex items-center gap-3">
               {isDarkMode ? (
                 <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-400">
                    <Moon size={16} />
                 </div>
               ) : (
                 <div className="p-1 rounded-full bg-orange-500/10 text-orange-400">
                    <Sun size={16} />
                 </div>
               )}
               <span className="text-sm font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-brand-blue' : 'bg-gray-300'}`}>
               <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          <div className="text-xs text-gray-400 text-center">
            v1.3.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
