import React, { useState, useRef, useEffect } from 'react';
import { IconMenu, IconBookmark, IconSearch, IconSparkles, IconGlobe, IconHome, IconChevronDown } from './IconComponents';
import { Translation } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleBookmarks: () => void;
  onNavigateHome: () => void;
  onToggleSearch: () => void;
  onToggleNavModal: () => void;
  bookName: string;
  chapter: number;
  selectedTranslation: Translation;
  onTranslationChange: (translation: Translation) => void;
  isCrossRefEnabled: boolean;
  onToggleCrossRef: () => void;
  showCrossRefTooltip: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    onToggleSidebar, 
    onToggleBookmarks, 
    onNavigateHome, 
    onToggleSearch,
    onToggleNavModal,
    bookName, 
    chapter, 
    selectedTranslation, 
    onTranslationChange,
    isCrossRefEnabled,
    onToggleCrossRef,
    showCrossRefTooltip,
}) => {
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] = useState(false);
  const translationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (translationRef.current && !translationRef.current.contains(event.target as Node)) {
        setIsTranslationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTranslation = (translation: Translation) => {
    onTranslationChange(translation);
    setIsTranslationDropdownOpen(false);
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-20">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden mr-2">
          <IconMenu className="w-6 h-6" />
        </button>
        <button onClick={onToggleNavModal} className="flex items-center space-x-2 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <h1 className="text-xl md:text-2xl font-bold truncate">
                {bookName} <span className="font-normal">{chapter}</span>
            </h1>
            <IconChevronDown className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <div className="relative" ref={translationRef}>
            <button onClick={() => setIsTranslationDropdownOpen(!isTranslationDropdownOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Selecionar tradução">
                <IconGlobe className="w-6 h-6" />
            </button>
            {isTranslationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                    <div className="py-1">
                        {translations.map((trans) => (
                             <button
                                key={trans.id}
                                onClick={() => handleSelectTranslation(trans.id)}
                                className={`w-full text-left px-4 py-2 text-sm ${selectedTranslation === trans.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-600`}
                             >
                                {trans.name}
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <div className="relative">
          <button 
              onClick={onToggleCrossRef} 
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isCrossRefEnabled ? 'text-blue-500' : 'text-gray-500'}`} 
              aria-label="Ativar/Desativar Estudo Aprofundado"
          >
            <IconSparkles className="w-6 h-6" />
          </button>
          {showCrossRefTooltip && (
              <div className="absolute top-full right-0 mt-2 w-max max-w-xs bg-blue-600 text-white text-sm rounded-lg shadow-lg p-3 z-30 animate-pulse">
                  <p>Ative o 'Estudo Aprofundado' aqui!</p>
                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-blue-600"></div>
              </div>
          )}
        </div>
        <button onClick={onToggleSearch} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Buscar versículos">
          <IconSearch className="w-6 h-6" />
        </button>
        <button onClick={onToggleBookmarks} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Ver versículos salvos">
          <IconBookmark className="w-6 h-6" />
        </button>
        <button onClick={onNavigateHome} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hidden md:block" aria-label="Tela Inicial">
            <IconHome className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
