
import React, { useState } from 'react';
import { StudyVerseState } from '../types';

interface VerseProps {
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  isBookmarked: boolean;
  onClick: (verseInfo: StudyVerseState) => void;
}

const VerseComponent: React.FC<VerseProps> = ({ 
  book,
  chapter,
  verseNumber, 
  text, 
  isBookmarked,
  onClick,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    onClick({ book, chapter, verse: verseNumber, text });
    setIsActive(true);
    // De-activate after a short delay to allow panel to open smoothly
    setTimeout(() => setIsActive(false), 300);
  };

  return (
    <div 
      className={`verse-container flex group relative p-1 -m-1 rounded-lg transition-colors duration-300 cursor-pointer select-none ${isActive ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
      onClick={handleClick}
    >
      <div className="flex items-start pt-1">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 w-8 text-right">{verseNumber}</span>
      </div>
      <p className="flex-1">
        {text}
        {isBookmarked && <span className="text-primary ml-1" aria-label="Versículo salvo">●</span>}
      </p>
    </div>
  );
};

export const Verse = React.memo(VerseComponent);
