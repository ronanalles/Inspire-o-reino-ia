import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Book, VerseType, ChapterCrossReferences, CrossReferenceItem, Highlight, Translation, ReadingSettings, SelectionState } from '../types';
import { Verse } from './Verse';
import { CrossReferencePanel } from './CrossReferencePanel';
import { IconChevronLeft, IconChevronRight, IconSpinner } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';
import { getChapterText } from '../services/bibleService';
import { getCrossReferences, MissingApiKeyError } from '../services/geminiService';
import { books } from '../data/bibleData';

interface ReadingViewProps {
  book: Book;
  chapter: number;
  translation: Translation;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  toggleBookmark: (book: string, chapter: number, verse: number, text: string) => void;
  isBookmarked: (book: string, chapter: number, verse: number) => boolean;
  onNavigateToVerse: (book: string, chapter: number) => void;
  isCrossRefEnabled: boolean;
  highlights: Highlight[];
  onSelectText: (selection: SelectionState | null) => void;
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
  onNavigateToVerse,
  isCrossRefEnabled,
  highlights,
  onSelectText,
  readingSettings
}) => {
  const [verses, setVerses] = useState<VerseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crossReferences, setCrossReferences] = useState<ChapterCrossReferences | null>(null);
  const [selectedCrossRef, setSelectedCrossRef] = useState<CrossReferenceItem | null>(null);
  const [isApiKeyErrorForCrossRef, setIsApiKeyErrorForCrossRef] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      setIsLoading(true);
      setError(null);
      setVerses([]);
      setCrossReferences(null);
      setSelectedCrossRef(null);
      setIsApiKeyErrorForCrossRef(false);
      onSelectText(null);

      if (viewRef.current) {
          viewRef.current.parentElement?.scrollTo(0, 0);
      }

      try {
        const data = await getChapterText(book.name, chapter, translation);
        if (data && data.verses) {
          setVerses(data.verses);
          
          if (isCrossRefEnabled) {
            try {
              const chapterText = data.verses.map(v => v.text).join(' ');
              const crData = await getCrossReferences(chapterText);
              setCrossReferences(crData);
            } catch (crError) {
              if (crError instanceof MissingApiKeyError) {
                setIsApiKeyErrorForCrossRef(true);
              }
              console.error("Failed to load cross-references:", crError);
              setCrossReferences(null);
            }
          } else {
            setCrossReferences(null);
          }

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
  }, [book, chapter, translation, isCrossRefEnabled, onSelectText]);
  
  const handleTermClick = (term: CrossReferenceItem) => {
    setSelectedCrossRef(term);
  };
  
  const chapterHighlights = useMemo(() => {
    return highlights.filter(h => h.book === book.name && h.chapter === chapter);
  }, [highlights, book.name, chapter]);

  const readingTextClasses = useMemo(() => {
    const fontSizeMap = { sm: 'text-base', base: 'text-lg', lg: 'text-xl', xl: 'text-2xl' };
    const lineHeightMap = { tight: 'leading-normal', normal: 'leading-relaxed', loose: 'leading-loose' };
    const fontFamilyMap = { sans: 'font-sans', serif: 'font-serif' };

    return `${fontSizeMap[readingSettings.fontSize]} ${lineHeightMap[readingSettings.lineHeight]} ${fontFamilyMap[readingSettings.fontFamily]}`;
  }, [readingSettings]);

  const handleContainerMouseUp = () => {
    // A slight delay to allow the verse's mouseup to fire first
    setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.isCollapsed) {
            onSelectText(null);
        }
    }, 100);
  };

  return (
    <div ref={viewRef}>
      <div className="max-w-4xl mx-auto" onMouseUp={handleContainerMouseUp}>
        {isApiKeyErrorForCrossRef && <ApiKeyErrorDisplay context="Estudo Aprofundado" />}
      </div>
      <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-md p-6 md:p-8 min-h-[60vh] pb-24 md:pb-8">
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
                crossReferences={crossReferences}
                onTermClick={handleTermClick}
                highlights={chapterHighlights.filter(h => h.verse === verseData.verse)}
                onSelectText={onSelectText}
              />
            ))}
            {verses.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground">Texto não disponível para este capítulo.</p>
            )}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-10 md:relative md:bottom-auto md:mt-8 bg-background/80 backdrop-blur-sm border-t border-border md:border-none md:bg-transparent md:backdrop-blur-none p-2 md:p-0 flex justify-between items-center max-w-4xl mx-auto">
        <button
          onClick={onPrevChapter}
          className="flex items-center px-4 py-2 bg-card border border-border rounded-lg shadow-sm hover:bg-accent transition-colors disabled:opacity-50 text-foreground"
          disabled={book.name === books[0].name && chapter === 1}
        >
          <IconChevronLeft className="w-5 h-5 mr-2" />
          Anterior
        </button>
        <button
          onClick={onNextChapter}
          className="flex items-center px-4 py-2 bg-card border border-border rounded-lg shadow-sm hover:bg-accent transition-colors disabled:opacity-50 text-foreground"
          disabled={book.name === books[books.length - 1].name && chapter === book.chapters}
       >
          Próximo
          <IconChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <CrossReferencePanel 
        item={selectedCrossRef}
        onClose={() => setSelectedCrossRef(null)}
        onNavigateToVerse={onNavigateToVerse}
      />
    </div>
  );
};