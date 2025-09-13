import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Book, VerseType, Translation, ReadingSettings, SelectionState } from '../types';
import { Verse } from './Verse';
import { IconChevronLeft, IconChevronRight, IconSpinner } from './IconComponents';
import { getChapterText } from '../services/bibleService';
import { books } from '../data/bibleData';
import { SelectionPopover } from './SelectionPopover';

type PopoverAction = 'explain' | 'crossRef' | 'search' | 'copy';

interface ReadingViewProps {
  book: Book;
  chapter: number;
  translation: Translation;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  toggleBookmark: (book: string, chapter: number, verse: number, text: string) => void;
  isBookmarked: (book: string, chapter: number, verse: number) => boolean;
  onActionRequest: (action: 'explain' | 'crossRef' | 'search', text: string) => void;
  readingSettings: ReadingSettings;
}

export const ReadingView: React.FC<ReadingViewProps> = ({ 
  book, 
  chapter, 
  translation, 
  onPrevChapter, 
  onNextChapter, 
  toggleBookmark, 
  isBookmarked, 
  onActionRequest,
  readingSettings
}) => {
  const [verses, setVerses] = useState<VerseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      setIsLoading(true);
      setError(null);
      setVerses([]);
      setSelection(null);

      if (viewRef.current) {
          viewRef.current.parentElement?.scrollTo(0, 0);
      }

      try {
        const data = await getChapterText(book.name, chapter, translation);
        if (data && data.verses) {
          setVerses(data.verses);
        } else {
          setError("Não foi possível carregar o texto deste capítulo. Verifique sua conexão ou tente outra tradução.");
        }
      } catch (e) {
        console.error("Failed to fetch chapter:", e);
        setError("Ocorreu um erro inesperado ao carregar o capítulo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [book, chapter, translation]);

  useEffect(() => {
    const handleSelectionEnd = () => {
      const currentSelection = window.getSelection();

      if (!currentSelection) return;

      // Ignore interactions within our custom UI
      const isInteractingWithUI = currentSelection.anchorNode?.parentElement?.closest('.selection-popover, .selection-action-panel');
      if (isInteractingWithUI) return;
      
      const selectedText = currentSelection.toString().trim();

      // If text is selected, proceed to show the popover
      if (selectedText.length > 0 && currentSelection.rangeCount > 0) {
        const range = currentSelection.getRangeAt(0);
        
        let container = range.commonAncestorContainer;
        if (container.nodeType !== Node.ELEMENT_NODE) {
          container = container.parentElement!;
        }
        const verseElement = (container as HTMLElement).closest('.verse-container');

        if (verseElement) {
          const verseBook = verseElement.getAttribute('data-book');
          const verseChapter = verseElement.getAttribute('data-chapter');
          const verseNumber = verseElement.getAttribute('data-verse');
          
          if (verseBook && verseChapter && verseNumber) {
            // Step 1: Capture selection data BEFORE clearing it
            const rect = range.getBoundingClientRect();
            const selectionData = {
              text: selectedText,
              verseInfo: {
                book: verseBook,
                chapter: parseInt(verseChapter, 10),
                verse: parseInt(verseNumber, 10),
              },
              rect,
            };
            
            // Step 2: Clear the browser's selection. This is the crucial part
            // that prevents the native mobile context menu from appearing.
            currentSelection.removeAllRanges();
            
            // Step 3: Show our custom popover with the captured data
            setSelection(selectionData);
            return;
          }
        }
      }

      // If the selection is collapsed (i.e., a click), hide the popover
      if (currentSelection.isCollapsed) {
          const isClickOutside = !currentSelection.anchorNode?.parentElement?.closest('.selection-popover');
          if (isClickOutside) {
            setSelection(null);
          }
      }
    };

    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleSelectionEnd);
      document.removeEventListener('touchend', handleSelectionEnd);
    };
  }, []);

  const handlePopoverAction = (action: PopoverAction, text: string) => {
    if (action === 'copy') {
      // Handled inside popover
    } else {
      onActionRequest(action, text);
    }
    setSelection(null);
  };


  const readingTextClasses = useMemo(() => {
    const fontSizeMap = { sm: 'text-base', base: 'text-lg', lg: 'text-xl', xl: 'text-2xl' };
    const lineHeightMap = { tight: 'leading-snug', normal: 'leading-relaxed', loose: 'leading-loose' };
    const fontFamilyMap = { sans: 'font-sans', serif: 'font-serif' };

    return `${fontSizeMap[readingSettings.fontSize]} ${lineHeightMap[readingSettings.lineHeight]} ${fontFamilyMap[readingSettings.fontFamily]}`;
  }, [readingSettings]);

  return (
    <div ref={viewRef} className="px-4 md:px-0">
      {selection && <SelectionPopover selectionState={selection} onAction={handlePopoverAction} onClose={() => setSelection(null)} />}
      <div className="max-w-4xl mx-auto">
        {/* Placeholder for potential future top-level notices */}
      </div>
      <div className="max-w-4xl mx-auto bg-card rounded-lg p-6 md:p-8 min-h-[60vh] pb-24 md:pb-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-foreground">{book.name} {chapter}</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <IconSpinner className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : (
          <div className={`space-y-4 text-foreground/90 ${readingTextClasses}`}>
            {verses.map((verseData) => (
              <Verse
                key={verseData.verse}
                book={book.name}
                chapter={chapter}
                verseNumber={verseData.verse}
                text={verseData.text}
                isBookmarked={isBookmarked(book.name, chapter, verseData.verse)}
                onToggleBookmark={() => toggleBookmark(book.name, chapter, verseData.verse, verseData.text)}
              />
            ))}
            {verses.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground">Texto não disponível para este capítulo.</p>
            )}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-10 md:relative md:bottom-auto md:mt-8 bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none p-2 md:p-0 flex justify-between items-center max-w-4xl mx-auto shadow-[0_-1px_4px_rgba(0,0,0,0.05)] md:shadow-none dark:shadow-[0_-1px_4px_rgba(0,0,0,0.2)]">
        <button
          onClick={onPrevChapter}
          className="flex items-center px-4 py-2 bg-card border border-border rounded-lg shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 text-foreground"
          disabled={book.name === books[0].name && chapter === 1}
        >
          <IconChevronLeft className="w-5 h-5 mr-2" />
          Anterior
        </button>
        <button
          onClick={onNextChapter}
          className="flex items-center px-4 py-2 bg-card border border-border rounded-lg shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 text-foreground"
          disabled={book.name === books[books.length - 1].name && chapter === book.chapters}
       >
          Próximo
          <IconChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};