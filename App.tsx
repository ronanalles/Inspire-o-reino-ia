import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReadingView } from './components/ReadingView';
import { BookmarksPanel } from './components/BookmarksPanel';
import { HomeScreen } from './components/HomeScreen';
import { SearchModal } from './components/SearchModal';
import { FloatingActionButtons } from './components/FloatingActionButtons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { books } from './data/bibleData';
import { Bookmark, LastRead, Highlight, HighlightColor, Theme, Translation } from './types';
import { IconSpinner } from './components/IconComponents';
// FIX: Per @google/genai guidelines, the app must not check for or prompt for an API key. This is handled externally.
// import { isApiKeyAvailable } from './services/geminiService';

const AiStudyBuddy = React.lazy(() => import('./components/AiStudyBuddy'));
const BibleQuiz = React.lazy(() => import('./components/BibleQuiz'));
const ThematicStudy = React.lazy(() => import('./components/ThematicStudy'));

const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <IconSpinner className="w-12 h-12 animate-spin text-white" />
    </div>
);

export default function App() {
  // FIX: Per @google/genai guidelines, the app must not check for or prompt for an API key. This is handled externally.
  // if (!isApiKeyAvailable()) {
  //   return <ApiKeyErrorScreen />;
  // }
  
  const [view, setView] = useState<'home' | 'reading'>('home');
  const [lastRead, setLastRead] = useLocalStorage<LastRead | null>('bible_last_read', null);
  const [translation, setTranslation] = useLocalStorage<Translation>('bible_translation', 'acf');
  const [theme, setTheme] = useLocalStorage<Theme>('bible_theme', 
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  
  const initialBook = books.find(b => b.name === lastRead?.bookName) || books[0];
  const initialChapter = lastRead?.chapter || 1;

  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('bible_bookmarks', []);
  const [highlights, setHighlights] = useLocalStorage<Highlight[]>('bible_highlights', []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAiBuddyOpen, setIsAiBuddyOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isThematicStudyOpen, setIsThematicStudyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCrossRefEnabled, setIsCrossRefEnabled] = useLocalStorage<boolean>('bible_crossRefEnabled', false);
  const [hasSeenCrossRefTooltip, setHasSeenCrossRefTooltip] = useLocalStorage<boolean>('bible_hasSeenCrossRefTooltip', false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleCrossRef = () => {
    if (!isCrossRefEnabled && !hasSeenCrossRefTooltip) {
      setHasSeenCrossRefTooltip(true);
    }
    setIsCrossRefEnabled(prev => !prev);
  };

  const updateLastRead = (bookName: string, chapter: number) => {
    setLastRead({ bookName, chapter });
  };

  const handleSelectChapter = useCallback((bookName: string, chapter: number) => {
    const book = books.find(b => b.name === bookName);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(chapter);
      updateLastRead(bookName, chapter);
      setView('reading');
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  }, []);

  const changeChapter = (offset: number) => {
    let currentBookIndex = books.findIndex(b => b.name === selectedBook.name);
    if (currentBookIndex === -1) return;

    let newChapter = selectedChapter + offset;
    let newBook = selectedBook;
    let newBookIndex = currentBookIndex;

    if (newChapter > selectedBook.chapters) {
      if (currentBookIndex < books.length - 1) {
        newBookIndex++;
        newBook = books[newBookIndex];
        newChapter = 1;
      } else {
        return; 
      }
    } else if (newChapter < 1) {
      if (currentBookIndex > 0) {
        newBookIndex--;
        newBook = books[newBookIndex];
        newChapter = newBook.chapters;
      } else {
        return; 
      }
    }
    
    setSelectedBook(newBook);
    setSelectedChapter(newChapter);
    updateLastRead(newBook.name, newChapter);
  };

  const toggleBookmark = useCallback((book: string, chapter: number, verse: number, text: string) => {
    setBookmarks(prev => {
      const existingIndex = prev.findIndex(bm => bm.book === book && bm.chapter === chapter && bm.verse === verse);
      if (existingIndex > -1) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        return [...prev, { book, chapter, verse, text, note: '' }];
      }
    });
  }, [setBookmarks]);

  const handleUpdateBookmarkNote = useCallback((bookmarkToUpdate: Bookmark, newNote: string) => {
      setBookmarks(prev => prev.map(bm => 
          (bm.book === bookmarkToUpdate.book && bm.chapter === bookmarkToUpdate.chapter && bm.verse === bookmarkToUpdate.verse)
          ? { ...bm, note: newNote }
          : bm
      ));
  }, [setBookmarks]);

  const addHighlight = useCallback((book: string, chapter: number, verse: number, text: string, color: HighlightColor) => {
    const newHighlight: Highlight = {
      id: `${Date.now()}-${text.slice(0, 10)}`,
      book,
      chapter,
      verse,
      text,
      color,
    };
    setHighlights(prev => [...prev, newHighlight]);
  }, [setHighlights]);

  const removeHighlight = useCallback((highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  }, [setHighlights]);


  const isBookmarked = useMemo(() => {
    return (book: string, chapter: number, verse: number) => 
      bookmarks.some(bm => bm.book === book && bm.chapter === chapter && bm.verse === verse);
  }, [bookmarks]);

  const handleContinueReading = () => {
    if (lastRead) {
      handleSelectChapter(lastRead.bookName, lastRead.chapter);
    } else {
      handleSelectChapter(books[0].name, 1);
    }
  };

  const handleStartReading = () => {
      setView('reading');
  }

  if (view === 'home') {
    return <HomeScreen onContinueReading={handleContinueReading} onStartReading={handleStartReading} lastRead={lastRead} theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        selectedBookName={selectedBook.name}
        selectedChapter={selectedChapter}
        onSelectChapter={handleSelectChapter}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleBookmarks={() => setIsBookmarksOpen(!isBookmarksOpen)}
          onNavigateHome={() => setView('home')}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
          bookName={selectedBook.name}
          chapter={selectedChapter}
          selectedTranslation={translation}
          onTranslationChange={setTranslation}
          isCrossRefEnabled={isCrossRefEnabled}
          onToggleCrossRef={handleToggleCrossRef}
          showCrossRefTooltip={!isCrossRefEnabled && !hasSeenCrossRefTooltip}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <ReadingView
              book={selectedBook}
              chapter={selectedChapter}
              translation={translation}
              onPrevChapter={() => changeChapter(-1)}
              onNextChapter={() => changeChapter(1)}
              toggleBookmark={toggleBookmark}
              isBookmarked={isBookmarked}
              onNavigateToVerse={handleSelectChapter}
              isCrossRefEnabled={isCrossRefEnabled}
              highlights={highlights}
              onAddHighlight={addHighlight}
            />
        </main>
      </div>
      
      <FloatingActionButtons
        onThematicStudyClick={() => setIsThematicStudyOpen(true)}
        onQuizClick={() => setIsQuizOpen(true)}
        onAiBuddyClick={() => setIsAiBuddyOpen(true)}
      />

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToVerse={handleSelectChapter}
      />
      
      <BookmarksPanel
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        highlights={highlights}
        onJumpToVerse={(book, chapter) => handleSelectChapter(book, chapter)}
        onUpdateBookmarkNote={handleUpdateBookmarkNote}
        onRemoveHighlight={removeHighlight}
      />
      
      <Suspense fallback={<LoadingSpinner />}>
        {isAiBuddyOpen && <AiStudyBuddy
          isOpen={isAiBuddyOpen}
          onClose={() => setIsAiBuddyOpen(false)}
          context={{ book: selectedBook.name, chapter: selectedChapter }}
        />}
        
        {isQuizOpen && <BibleQuiz 
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
        />}

        {isThematicStudyOpen && <ThematicStudy
          isOpen={isThematicStudyOpen}
          onClose={() => setIsThematicStudyOpen(false)}
          onNavigateToVerse={handleSelectChapter}
        />}
      </Suspense>
    </div>
  );
}
