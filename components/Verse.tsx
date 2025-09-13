import React, { useRef } from 'react';
import { IconBookmark, IconBookmarkSolid } from './IconComponents';
import { SelectionState } from '../types';

interface VerseProps {
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSelectText: (selection: SelectionState | null) => void;
}

const VerseComponent: React.FC<VerseProps> = ({ 
  book,
  chapter,
  verseNumber, 
  text, 
  isBookmarked, 
  onToggleBookmark, 
  onSelectText,
}) => {
  const verseRef = useRef<HTMLParagraphElement>(null);

  const handleMouseUp = (event: React.MouseEvent<HTMLParagraphElement>) => {
    event.stopPropagation(); // Impede que o mouseup da ReadingView dispare imediatamente
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selection && !selection.isCollapsed && selectedText) {
      const range = selection.getRangeAt(0);
      if (verseRef.current && verseRef.current.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        onSelectText({
          text: selectedText,
          verseInfo: { book, chapter, verse: verseNumber },
          rect: rect,
        });
      }
    }
  };
  
  return (
    <div className="flex group relative">
      <div className="flex items-start pt-1">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 w-8 text-right select-none">{verseNumber}</span>
      </div>
      <p ref={verseRef} className="flex-1" onMouseUp={handleMouseUp}>
        {text}
      </p>
      <button 
        onClick={onToggleBookmark} 
        className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 self-start"
        aria-label={isBookmarked ? "Remover marcador" : "Adicionar marcador"}
      >
        {isBookmarked ? <IconBookmarkSolid className="w-5 h-5"/> : <IconBookmark className="w-5 h-5"/>}
      </button>
    </div>
  );
};

export const Verse = React.memo(VerseComponent);