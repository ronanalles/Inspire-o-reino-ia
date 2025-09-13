import React, { useState, useRef, useEffect } from 'react';
// FIX: Replaced deprecated IconSparkles with IconStudy for consistency and to address deprecation comment.
import { IconMenu, IconBookmark, IconSearch, IconGlobe, IconHome, IconChevronDown, IconTypography, IconDotsVertical, IconStudy } from './IconComponents';
import { Translation, ModalType } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome: () => void;
  onOpenModal: (modal: ModalType) => void;
  bookName: string;
  chapter: number;
  selectedTranslation: Translation;
  onTranslationChange: (translation: Translation) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onToggleSidebar, 
    onNavigateHome, 
    onOpenModal,
    bookName, 
    chapter, 
    selectedTranslation, 
    onTranslationChange,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTranslation = (translation: Translation) => {
    onTranslationChange(translation);
    setIsMoreMenuOpen(false);
  }

  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm sticky top-0 z-20">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="p-2 rounded-full hover:bg-accent text-muted-foreground md:hidden mr-2">
          <IconMenu className="w-6 h-6" />
        </button>
        <button onClick={() => onOpenModal('nav')} className="flex items-center space-x-2 p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
            <h1 className="text-xl md:text-2xl font-bold truncate text-foreground">
                {bookName} <span className="font-normal text-muted-foreground">{chapter}</span>
            </h1>
            <IconChevronDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground">
        <button onClick={onNavigateHome} className="p-2 rounded-full hover:bg-accent" aria-label="Tela Inicial">
            <IconHome className="w-5 h-5" />
        </button>
        <button onClick={() => onOpenModal('search')} className="p-2 rounded-full hover:bg-accent" aria-label="Buscar versículos">
          <IconSearch className="w-5 h-5" />
        </button>
        <button onClick={() => onOpenModal('bookmarks')} className="p-2 rounded-full hover:bg-accent" aria-label="Ver versículos salvos">
          <IconBookmark className="w-5 h-5" />
        </button>
        
        <div className="relative" ref={moreMenuRef}>
            <button onClick={() => setIsMoreMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-accent" aria-label="Mais Opções">
                <IconDotsVertical className="w-5 h-5" />
            </button>
            {isMoreMenuOpen && (
                 <div className="absolute right-0 mt-2 w-64 bg-popover rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 border border-border p-1">
                    {/* FIX: Changed onOpenModal argument from 'tools' to 'thematic' to match a valid ModalType. Updated icon and text for clarity. */}
                    <button onClick={() => { onOpenModal('thematic'); setIsMoreMenuOpen(false); }} className="w-full text-left flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md">
                        <IconStudy className="w-5 h-5 mr-3" /> Estudo Temático
                    </button>
                    <button onClick={() => { onOpenModal('settings'); setIsMoreMenuOpen(false); }} className="w-full text-left flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md">
                      <IconTypography className="w-5 h-5 mr-3" /> Opções de Leitura
                    </button>
                    <div className="my-1 border-t border-border -mx-1"></div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Tradução</div>
                     {translations.map((trans) => (
                         <button
                            key={trans.id}
                            onClick={() => handleSelectTranslation(trans.id)}
                            className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md ${selectedTranslation === trans.id ? 'font-bold text-primary' : 'text-popover-foreground'} hover:bg-accent`}
                         >
                            <IconGlobe className="w-5 h-5 mr-3" /> {trans.name}
                         </button>
                    ))}
                 </div>
            )}
        </div>
      </div>
    </header>
  );
};