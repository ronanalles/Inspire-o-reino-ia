
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Book, VerseType, ChapterCrossReferences, CrossReferenceItem, Highlight, HighlightColor, Translation } from '../types';
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
  onAddHighlight: (book: string, chapter: number, verse: number, text: string, color: HighlightColor) => void;
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
  onAddHighlight,
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
  }, [book, chapter, translation, isCrossRefEnabled]);
  
  const handleTermClick = (term: CrossReferenceItem) => {
    setSelectedCrossRef(term);
  };
  
  const chapterHighlights = useMemo(() => {
    return highlights.filter(h => h.book === book.name && h.chapter === chapter);
  }, [highlights, book.name, chapter]);

  return (
    <div ref={viewRef}>
      <div className="max-w-4xl mx-auto">
        {isApiKeyErrorForCrossRef && <ApiKeyErrorDisplay context="Estudo Aprofundado" />}
      </div>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">{book.name} {chapter}</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <IconSpinner className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="space-y-4 font-serif text-xl leading-loose text-gray-700 dark:text-gray-300">
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
                onAddHighlight={onAddHighlight}
              />
            ))}
            {verses.length === 0 && !isLoading && (
              <p className="text-center text-gray-500">Texto não disponível para este capítulo.</p>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
        <button
          onClick={onPrevChapter}
          className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          disabled={book.name === books[0].name && chapter === 1}
        >
          <IconChevronLeft className="w-5 h-5 mr-2" />
          Anterior
        </button>
        <button
          onClick={onNextChapter}
          className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
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