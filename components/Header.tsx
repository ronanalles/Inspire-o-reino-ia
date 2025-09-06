import React, { useState, useRef, useEffect } from 'react';
import { IconMenu, IconBookmark, IconHome, IconGlobe } from './IconComponents';
import { Translation } from '../App';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleBookmarks: () => void;
  onNavigateHome: () => void;
  bookName: string;
  chapter: number;
  selectedTranslation: Translation;
  onTranslationChange: (translation: Translation) => void;
}

const translationMap: Record<Translation, string> = {
    acf: 'Almeida Corrigida Fiel',
    nvi: 'Nova Versão Internacional',
    kjv: 'King James Version',
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleBookmarks, onNavigateHome, bookName, chapter, selectedTranslation, onTranslationChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTranslation = (translation: Translation) => {
    onTranslationChange(translation);
    setIsDropdownOpen(false);
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-20">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden mr-2">
          <IconMenu className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold truncate">
          {bookName} <span className="font-normal">{chapter}</span>
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Selecionar tradução">
                <IconGlobe className="w-6 h-6" />
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                    <div className="py-1">
                        {(Object.keys(translationMap) as Translation[]).map((trans) => (
                             <button
                                key={trans}
                                onClick={() => handleSelectTranslation(trans)}
                                className={`w-full text-left px-4 py-2 text-sm ${selectedTranslation === trans ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-600`}
                             >
                                {translationMap[trans]}
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <button onClick={onNavigateHome} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Ir para a tela inicial">
          <IconHome className="w-6 h-6" />
        </button>
        <button onClick={onToggleBookmarks} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Ver versículos salvos">
          <IconBookmark className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};