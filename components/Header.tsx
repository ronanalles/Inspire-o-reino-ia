import React, { useState, useRef, useEffect } from 'react';
import { IconMenu, IconBookmark, IconSearch, IconSparkles, IconGlobe, IconHome, IconChevronDown, IconTypography } from './IconComponents';
import { ReadingSettingsPanel } from './ReadingSettingsPanel';
import { Translation, ReadingSettings } from '../types';
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
  readingSettings: ReadingSettings;
  onReadingSettingsChange: (settings: ReadingSettings) => void;
  isReadingSettingsOpen: boolean;
  onToggleReadingSettings: () => void;
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
    readingSettings,
    onReadingSettingsChange,
    isReadingSettingsOpen,
    onToggleReadingSettings,
}) => {
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] = useState(false);
  const translationRef = useRef<HTMLDivElement>(null);
  const readingSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (translationRef.current && !translationRef.current.contains(event.target as Node)) {
        setIsTranslationDropdownOpen(false);
      }
      if (readingSettingsRef.current && !readingSettingsRef.current.contains(event.target as Node)) {
        if (isReadingSettingsOpen) {
          onToggleReadingSettings();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReadingSettingsOpen, onToggleReadingSettings]);

  const handleSelectTranslation = (translation: Translation) => {
    onTranslationChange(translation);
    setIsTranslationDropdownOpen(false);
  }

  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm sticky top-0 z-20">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="p-2 rounded-full hover:bg-accent text-muted-foreground md:hidden mr-2">
          <IconMenu className="w-6 h-6" />
        </button>
        <button onClick={onToggleNavModal} className="flex items-center space-x-2 p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
            <h1 className="text-xl md:text-2xl font-bold truncate text-foreground">
                {bookName} <span className="font-normal text-muted-foreground">{chapter}</span>
            </h1>
            <IconChevronDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground">
        <div className="relative" ref={readingSettingsRef}>
            <button onClick={onToggleReadingSettings} className="p-2 rounded-full hover:bg-accent" aria-label="Opções de Leitura">
                <IconTypography className="w-5 h-5" />
            </button>
            <ReadingSettingsPanel 
              isOpen={isReadingSettingsOpen}
              settings={readingSettings}
              onSettingsChange={onReadingSettingsChange}
            />
        </div>
        <div className="relative" ref={translationRef}>
            <button onClick={() => setIsTranslationDropdownOpen(!isTranslationDropdownOpen)} className="p-2 rounded-full hover:bg-accent" aria-label="Selecionar tradução">
                <IconGlobe className="w-5 h-5" />
            </button>
            {isTranslationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 border border-border">
                    <div className="py-1">
                        {translations.map((trans) => (
                             <button
                                key={trans.id}
                                onClick={() => handleSelectTranslation(trans.id)}
                                className={`w-full text-left px-4 py-2 text-sm ${selectedTranslation === trans.id ? 'font-bold text-primary' : 'text-popover-foreground'} hover:bg-accent`}
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
              className={`p-2 rounded-full hover:bg-accent transition-colors ${isCrossRefEnabled ? 'text-primary' : ''}`} 
              aria-label="Ativar/Desativar Estudo Aprofundado"
          >
            <IconSparkles className="w-5 h-5" />
          </button>
          {showCrossRefTooltip && (
              <div className="absolute top-full right-0 mt-2 w-max max-w-xs bg-primary text-primary-foreground text-sm rounded-lg shadow-lg p-3 z-30 animate-pulse">
                  <p>Ative o 'Estudo Aprofundado' aqui!</p>
                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-primary"></div>
              </div>
          )}
        </div>
        <button onClick={onToggleSearch} className="p-2 rounded-full hover:bg-accent" aria-label="Buscar versículos">
          <IconSearch className="w-5 h-5" />
        </button>
        <button onClick={onToggleBookmarks} className="p-2 rounded-full hover:bg-accent" aria-label="Ver versículos salvos">
          <IconBookmark className="w-5 h-5" />
        </button>
        <button onClick={onNavigateHome} className="p-2 rounded-full hover:bg-accent hidden md:block" aria-label="Tela Inicial">
            <IconHome className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
