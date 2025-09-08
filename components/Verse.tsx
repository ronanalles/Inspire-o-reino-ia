
import React, { useState, useRef, useEffect } from 'react';
import { IconBookmark, IconBookmarkSolid } from './IconComponents';
import { CrossReferenceItem, ChapterCrossReferences, Highlight, HighlightColor } from '../types';
import { HighlightPopover } from './HighlightPopover';

interface VerseProps {
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  crossReferences: ChapterCrossReferences | null;
  onTermClick: (term: CrossReferenceItem) => void;
  highlights: Highlight[];
  onAddHighlight: (book: string, chapter: number, verse: number, text: string, color: HighlightColor) => void;
}

export const Verse: React.FC<VerseProps> = ({ 
  book,
  chapter,
  verseNumber, 
  text, 
  isBookmarked, 
  onToggleBookmark, 
  crossReferences, 
  onTermClick,
  highlights,
  onAddHighlight
}) => {
  const verseRef = useRef<HTMLParagraphElement>(null);
  const [popoverState, setPopoverState] = useState<{ top: number, left: number, text: string } | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      // Check if the selection is within the current verse element
      if (verseRef.current && verseRef.current.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        const containerRect = verseRef.current.parentElement!.getBoundingClientRect();
        
        setPopoverState({
          top: rect.top - containerRect.top - 45, // Position above selection
          left: rect.left - containerRect.left + rect.width / 2,
          text: selection.toString(),
        });
      }
    } else {
      setPopoverState(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close popover if clicking outside of it
      if (popoverState && !(event.target as Element).closest('.highlight-popover')) {
        setPopoverState(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverState]);

  const handleHighlight = (color: HighlightColor) => {
    if (popoverState) {
      onAddHighlight(book, chapter, verseNumber, popoverState.text, color);
      setPopoverState(null);
      window.getSelection()?.removeAllRanges(); // Clear selection
    }
  };

  const renderVerseContent = () => {
    let content: (string | JSX.Element)[] = [text];

    // Apply highlights first
    if (highlights.length > 0) {
      const highlightMap = new Map(highlights.map(h => [h.text, h.color]));
      const highlightTexts = highlights.map(h => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const highlightRegex = new RegExp(`(${highlightTexts.join('|')})`, 'g');

      content = content.flatMap(part => {
        if (typeof part !== 'string') return [part];
        const highlightBgClasses: Record<HighlightColor, string> = {
            yellow: 'bg-yellow-200 dark:bg-yellow-700/70',
            green: 'bg-green-200 dark:bg-green-700/70',
            blue: 'bg-blue-200 dark:bg-blue-700/70',
            pink: 'bg-pink-200 dark:bg-pink-700/70',
        };
        const splitText = part.split(highlightRegex);
        return splitText.map((chunk, i) => {
            const color = highlightMap.get(chunk);
            return color ? <mark key={i} className={`${highlightBgClasses[color]} rounded px-0.5 py-0.5`}>{chunk}</mark> : chunk;
        });
      });
    }

    // Apply cross-references
    if (crossReferences && crossReferences.length > 0) {
      const terms = crossReferences.map(cr => cr.term);
      const crossRefRegex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');

      content = content.flatMap((part, i) => {
        if (typeof part !== 'string') return [part];
        const splitText = part.split(crossRefRegex);
        return splitText.map((chunk, j) => {
          const matchingRef = crossReferences.find(cr => cr.term.toLowerCase() === chunk.toLowerCase());
          if (matchingRef) {
            return (
              <button 
                key={`${i}-${j}`}
                onClick={() => onTermClick(matchingRef)}
                className="text-blue-600 dark:text-blue-400 font-semibold underline decoration-dotted decoration-blue-600/50 dark:decoration-blue-400/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-sm px-0.5 transition-colors"
              >
                {chunk}
              </button>
            );
          }
          return chunk;
        });
      });
    }

    return content;
  };
  

  return (
    <div className="flex group relative">
      {popoverState && (
        <HighlightPopover
          top={popoverState.top}
          left={popoverState.left}
          onSelectColor={handleHighlight}
        />
      )}
      <div className="flex items-start pt-1">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 w-8 text-right select-none">{verseNumber}</span>
      </div>
      <p ref={verseRef} className="flex-1" onMouseUp={handleMouseUp}>
        {renderVerseContent()}
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