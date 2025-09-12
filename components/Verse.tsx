import React, { useRef } from 'react';
import { IconBookmark, IconBookmarkSolid } from './IconComponents';
import { CrossReferenceItem, ChapterCrossReferences, Highlight, HighlightColor, SelectionState } from '../types';

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
  onSelectText: (selection: SelectionState | null) => void;
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
  onSelectText,
}) => {
  const verseRef = useRef<HTMLParagraphElement>(null);

  const handleMouseUp = (event: React.MouseEvent<HTMLParagraphElement>) => {
    event.stopPropagation(); // Prevent ReadingView's mouseup from firing immediately
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selection && !selection.isCollapsed && selectedText) {
      const range = selection.getRangeAt(0);
      if (verseRef.current && verseRef.current.contains(range.commonAncestorContainer)) {
        onSelectText({
          text: selectedText,
          verseInfo: { book, chapter, verse: verseNumber },
        });
      }
    }
  };

  const renderVerseContent = () => {
    let lastIndex = 0;
    const parts: (string | JSX.Element)[] = [];
  
    const sortedHighlights = highlights
      .map(h => {
        const textToSearch = h.text;
        const start = text.indexOf(textToSearch);
        if (start === -1) return null;
        return {
          start,
          end: start + textToSearch.length,
          color: h.color,
        };
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => a.start - b.start);
  
    let mergedHighlights = [];
    if(sortedHighlights.length > 0) {
        mergedHighlights.push(sortedHighlights[0]);
        for(let i = 1; i < sortedHighlights.length; i++){
            let last = mergedHighlights[mergedHighlights.length - 1];
            let current = sortedHighlights[i];
            if(current.start < last.end){
                last.end = Math.max(last.end, current.end);
            } else {
                mergedHighlights.push(current);
            }
        }
    }
    
    mergedHighlights.forEach(hl => {
      if (hl.start > lastIndex) {
        parts.push(text.substring(lastIndex, hl.start));
      }
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
    });
  
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
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
