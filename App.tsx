
import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReadingView } from './components/ReadingView';
import { BookmarksPanel } from './components/BookmarksPanel';
import { HomeScreen } from './components/HomeScreen';
import { SearchModal } from './components/SearchModal';
import { QuickNavigationModal } from './components/QuickNavigationModal';
import { BottomNavBar } from './components/BottomNavBar';
import { ReadingSettingsPanel } from './components/ReadingSettingsPanel';
import { StudyPanel } from './components/SelectionActionPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { books } from './data/bibleData';
import { translations } from './data/translations';
import { Bookmark, LastRead, Theme, Translation, ReadingSettings, ModalType, StudyVerseState } from './types';
import { IconSpinner } from './components/IconComponents';

const ToolsModal = React.lazy(() => import('./components/ToolsScreen'));

const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]">
        <IconSpinner className="w-12 h-12 animate-spin text-white" />
    </div>
);

export default function App() {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [studyVerse, setStudyVerse] = useState<StudyVerseState | null>(null);

  const [readingSettings, setReadingSettings] = useLocalStorage<ReadingSettings>('bible_readingSettings', {
    fontSize: 'base',
    lineHeight: 'loose',
    fontFamily: 'serif',
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const validTranslationIds = translations.map(t => t.id);
    if (!validTranslationIds.includes(translation)) {
      setTranslation('acf');
    }
  }, [translation, setTranslation]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleCloseModals = () => {
    setActiveModal(null);
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
      setActiveModal(null);
    }
  }, [setLastRead]);

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
      if(lastRead) {
        handleSelectChapter(lastRead.bookName, lastRead.chapter);
      } else {
        handleSelectChapter(books[0].name, 1);
      }
  };
  
  const handleVerseLongPress = useCallback((verseInfo: StudyVerseState) => {
    setStudyVerse(verseInfo);
  }, []);

  const handleBottomNav = (navAction: 'home' | 'reading' | 'search' | 'bookmarks') => {
    switch(navAction) {
      case 'home':
        setView('home');
        break;
      case 'reading':
        handleStartReading();
        break;
      case 'search':
        setActiveModal('search');
        break;
      case 'bookmarks':
        setActiveModal('bookmarks');
        break;
    }
  }

  const renderContent = () => {
    switch(view) {
      case 'home':
        return <HomeScreen onContinueReading={handleContinueReading} onStartReading={handleStartReading} lastRead={lastRead} theme={theme} onToggleTheme={handleToggleTheme} />;
      case 'reading':
        return (
          <div className="flex h-full bg-background text-foreground">
            <Sidebar
              isOpen={isSidebarOpen}
              selectedBookName={selectedBook.name}
              selectedChapter={selectedChapter}
              onSelectChapter={handleSelectChapter}
              onClose={() => setIsSidebarOpen(false)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onNavigateHome={() => setView('home')}
                onOpenModal={setActiveModal}
                bookName={selectedBook.name}
                chapter={selectedChapter}
                selectedTranslation={translation}
                onTranslationChange={setTranslation}
              />
              <main className="flex-1 overflow-y-auto">
                  <ReadingView
                    book={selectedBook}
                    chapter={selectedChapter}
                    translation={translation}
                    onPrevChapter={() => changeChapter(-1)}
                    onNextChapter={() => changeChapter(1)}
                    isBookmarked={isBookmarked}
                    readingSettings={readingSettings}
                    onVerseLongPress={handleVerseLongPress}
                  />
              </main>
            </div>
          </div>
        )
      default:
        return null;
    }
  }

  return (
    <div className="h-screen flex flex-col font-sans bg-background">
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      
      {view !== 'home' && <BottomNavBar onNavigate={handleBottomNav} />}
      
      <QuickNavigationModal
        isOpen={activeModal === 'nav'}
        onClose={handleCloseModals}
        onNavigate={handleSelectChapter}
        currentBookName={selectedBook.name}
        currentChapter={selectedChapter}
      />

      <SearchModal 
        isOpen={activeModal === 'search'}
        onClose={handleCloseModals}
        onNavigateToVerse={handleSelectChapter}
      />
      
      <BookmarksPanel
        isOpen={activeModal === 'bookmarks'}
        onClose={handleCloseModals}
        bookmarks={bookmarks}
        onJumpToVerse={(book, chapter) => handleSelectChapter(book, chapter)}
        onUpdateBookmarkNote={handleUpdateBookmarkNote}
      />

      <ReadingSettingsPanel
        isOpen={activeModal === 'settings'}
        onClose={handleCloseModals}
        settings={readingSettings}
        onSettingsChange={setReadingSettings}
      />

      {studyVerse && <StudyPanel
        studyVerse={studyVerse}
        onClose={() => setStudyVerse(null)}
        onNavigateToVerse={handleSelectChapter}
        isBookmarked={isBookmarked(studyVerse.book, studyVerse.chapter, studyVerse.verse)}
        onToggleBookmark={() => toggleBookmark(studyVerse.book, studyVerse.chapter, studyVerse.verse, studyVerse.text)}
      />}
      
      <Suspense fallback={<LoadingSpinner />}>
        {activeModal === 'tools' && <ToolsModal 
            isOpen={activeModal === 'tools'} 
            onClose={handleCloseModals} 
            onNavigateToVerse={handleSelectChapter} 
        />}
      </Suspense>
    </div>
  );
}