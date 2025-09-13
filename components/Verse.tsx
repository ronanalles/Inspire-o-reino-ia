
import React, { useRef, useState } from 'react';
import { StudyVerseState } from '../types';

interface VerseProps {
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  isBookmarked: boolean;
  onLongPress: (verseInfo: StudyVerseState) => void;
}

const VerseComponent: React.FC<VerseProps> = ({ 
  book,
  chapter,
  verseNumber, 
  text, 
  isBookmarked,
  onLongPress,
}) => {
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(false);

  const handlePressStart = () => {
    longPressTimeout.current = setTimeout(() => {
      onLongPress({ book, chapter, verse: verseNumber, text });
      setIsActive(true); // Visually indicate activation
    }, 500); // 500ms for a long press
  };

  const handlePressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    // De-activate after a short delay to allow panel to open smoothly
    setTimeout(() => setIsActive(false), 300);
  };

  // Prevent context menu on desktop right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  return (
    <div 
      className={`verse-container flex group relative p-1 -m-1 rounded-lg transition-colors duration-300 ${isActive ? 'bg-primary/10' : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd} // Cancel if mouse leaves
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchMove={handlePressEnd} // Cancel if finger moves
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-start pt-1">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 w-8 text-right select-none">{verseNumber}</span>
      </div>
      <p className="flex-1">
        {text}
        {isBookmarked && <span className="text-primary ml-1" aria-label="Versículo salvo">●</span>}
      </p>
    </div>
  );
};

export const Verse = React.memo(VerseComponent);
