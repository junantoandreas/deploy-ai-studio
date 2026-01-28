import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import { Camera, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Initialize Dark Mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Dark Mode class to the document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle Dark Mode Handler
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Close mobile menu when a menu item is selected
  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-white dark:bg-dark-bg font-sans overflow-hidden transition-colors duration-300">
      
      {/* Mobile Header - Visible only on mobile */}
      <header className="md:hidden h-16 bg-white dark:bg-dark-sidebar border-b border-gray-100 dark:border-dark-border flex items-center justify-between px-4 shrink-0 transition-colors z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
            <Camera size={18} />
          </div>
          <span className="font-semibold text-gray-800 dark:text-white text-lg tracking-tight">
            Ruang Foto
          </span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar - Responsive logic handled inside component */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={handleMenuSelect} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Workspace - Fluid Right */}
      <Workspace activeMenu={activeMenu} setActiveMenu={handleMenuSelect} />
    </div>
  );
};

export default App;