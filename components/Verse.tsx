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

const VerseComponent: React.FC<VerseProps> = ({ 
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
    const selectedText = selection?.toString().trim();

    if (selection && !selection.isCollapsed && selectedText) {
      const range = selection.getRangeAt(0);
      if (verseRef.current && verseRef.current.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        const containerRect = verseRef.current.parentElement!.getBoundingClientRect();
        
        // Position the popover below the selection to avoid conflict with native OS/browser context menus.
        setPopoverState({
          top: rect.bottom - containerRect.top + 8, // 8px offset below
          left: rect.left - containerRect.left + rect.width / 2,
          text: selectedText,
        });
      }
    } else {
      setPopoverState(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the popover itself
      if (popoverState && !(event.target as Element).closest('.highlight-popover')) {
         setPopoverState(null);
      }
    };
    // Use `mousedown` to catch the click before `mouseup` might re-trigger the popover
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverState]);

  const handleHighlight = (color: HighlightColor) => {
    if (popoverState) {
      onAddHighlight(book, chapter, verseNumber, popoverState.text, color);
      setPopoverState(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const renderVerseContent = () => {
    let lastIndex = 0;
    const parts: (string | JSX.Element)[] = [];
  
    // Find all highlight occurrences and sort them by start index
    const sortedHighlights = highlights
      .flatMap(h => {
        const regex = new RegExp(h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        let match;
        const occurrences = [];
        while ((match = regex.exec(text)) !== null) {
          occurrences.push({
            start: match.index,
            end: match.index + h.text.length,
            color: h.color,
          });
        }
        return occurrences;
      })
      .sort((a, b) => a.start - b.start);
  
    // Process the text with the sorted highlights
    sortedHighlights.forEach(hl => {
      if (hl.start >= lastIndex) {
        // Add the text before the highlight
        if (hl.start > lastIndex) {
          parts.push(text.substring(lastIndex, hl.start));
        }
        // Add the highlighted text
        const highlightBgClasses: Record<HighlightColor, string> = {
            yellow: 'bg-yellow-200 dark:bg-yellow-700/70',
            green: 'bg-green-200 dark:bg-green-700/70',
            blue: 'bg-blue-200 dark:bg-blue-700/70',
            pink: 'bg-pink-200 dark:bg-pink-700/70',
        };
        parts.push(
          <mark key={`${hl.start}-${hl.end}`} className={`${highlightBgClasses[hl.color]} rounded`}>
            {text.substring(hl.start, hl.end)}
          </mark>
        );
        lastIndex = hl.end;
      }
    });
  
    // Add any remaining text after the last highlight
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // Process cross-references on the already-built parts
    if (crossReferences && crossReferences.length > 0) {
        const terms = crossReferences.map(cr => cr.term);
        const crossRefRegex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');

        return parts.flatMap((part, i) => {
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

    return parts.length > 0 ? parts : [text];
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

export const Verse = React.memo(VerseComponent);
