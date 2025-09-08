import React from 'react';
import { IconBookmark, IconBookmarkSolid } from './IconComponents';
import { CrossReferenceItem, ChapterCrossReferences } from '../types';

interface VerseProps {
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  crossReferences: ChapterCrossReferences | null;
  onTermClick: (term: CrossReferenceItem) => void;
}

export const Verse: React.FC<VerseProps> = ({ verseNumber, text, isBookmarked, onToggleBookmark, crossReferences, onTermClick }) => {
  
  const renderTextWithCrossRefs = () => {
    if (!crossReferences || crossReferences.length === 0) {
      return text;
    }

    const terms = crossReferences.map(cr => cr.term);
    // Cria uma regex que encontra qualquer um dos termos, garantindo que não faça parte de uma palavra maior (word boundaries \b)
    const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
    
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const matchingRef = crossReferences.find(cr => cr.term.toLowerCase() === part.toLowerCase());
      if (matchingRef) {
        return (
          <button 
            key={index}
            onClick={() => onTermClick(matchingRef)}
            className="text-blue-600 dark:text-blue-400 font-semibold underline decoration-dotted decoration-blue-600/50 dark:decoration-blue-400/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-sm px-0.5 transition-colors"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex group">
      <div className="flex items-start pt-1">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 w-8 text-right">{verseNumber}</span>
      </div>
      <p className="flex-1">
        {renderTextWithCrossRefs()}
      </p>
      <button 
        onClick={onToggleBookmark} 
        className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
        aria-label={isBookmarked ? "Remover marcador" : "Adicionar marcador"}
      >
        {isBookmarked ? <IconBookmarkSolid className="w-5 h-5"/> : <IconBookmark className="w-5 h-5"/>}
      </button>
    </div>
  );
};