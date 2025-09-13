
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Book, VerseType, Translation, ReadingSettings, StudyVerseState, ActiveVerse } from '../types';
import { Verse } from './Verse';
import { IconChevronLeft, IconChevronRight, IconSpinner } from './IconComponents';
import { getChapterText } from '../services/bibleService';
import { books } from '../data/bibleData';

interface ReadingViewProps {
  book: Book;
  chapter: number;
  translation: Translation;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  isBookmarked: (book: string, chapter: number, verse: number) => boolean;
  onVerseClick: (verseInfo: StudyVerseState) => void;
  readingSettings: ReadingSettings;
  activeVerse: ActiveVerse | null;
}

export const ReadingView: React.FC<ReadingViewProps> = ({ 
  book, 
  chapter, 
  translation, 
  onPrevChapter, 
  onNextChapter, 
  isBookmarked, 
  onVerseClick,
  readingSettings,
  activeVerse
}) => {
  const [verses, setVerses] = useState<VerseType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      setIsLoading(true);
      setError(null);
      setVerses([]);

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

  const readingTextClasses = useMemo(() => {
    const fontSizeMap = { sm: 'text-base', base: 'text-lg', lg: 'text-xl', xl: 'text-2xl' };
    const lineHeightMap = { tight: 'leading-snug', normal: 'leading-relaxed', loose: 'leading-loose' };
    const fontFamilyMap = { sans: 'font-sans', serif: 'font-serif' };

    return `${fontSizeMap[readingSettings.fontSize]} ${lineHeightMap[readingSettings.lineHeight]} ${fontFamilyMap[readingSettings.fontFamily]}`;
  }, [readingSettings]);

  return (
    <div ref={viewRef} className="px-4 md:px-0">
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
                onClick={onVerseClick}
                isActive={activeVerse?.book === book.name && activeVerse?.chapter === chapter && activeVerse?.verse === verseData.verse}
              />
            ))}
            {verses.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground">Texto não disponível para este capítulo.</p>
            )}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 z-10 md:relative md:bottom-auto md:mt-8 bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none p-2 md:p-0 flex justify-between items-center max-w-4xl mx-auto shadow-[0_-1px_4px_rgba(0,0,0,0.05)] md:shadow-none dark:shadow-[0_-1px_4px_rgba(0,0,0,0.2)]">
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