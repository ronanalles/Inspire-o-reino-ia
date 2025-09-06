import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReadingView } from './components/ReadingView';
import { AiStudyBuddy } from './components/AiStudyBuddy';
import { BookmarksPanel } from './components/BookmarksPanel';
import { BibleQuiz } from './components/BibleQuiz';
import { HomeScreen } from './components/HomeScreen';
import { ThematicStudy } from './components/ThematicStudy';
import { useLocalStorage } from './hooks/useLocalStorage';
import { books } from './data/bibleData';
import { Bookmark, LastRead } from './types';
import { IconFeather, IconBrain, IconSparkles } from './components/IconComponents';

export type Translation = 'acf' | 'nvi' | 'kjv';

export default function App() {
  const [view, setView] = useState<'home' | 'reading'>('home');
  const [lastRead, setLastRead] = useLocalStorage<LastRead | null>('bible_last_read', null);
  const [translation, setTranslation] = useLocalStorage<Translation>('bible_translation', 'acf');
  
  const initialBook = books.find(b => b.name === lastRead?.bookName) || books[0];
  const initialChapter = lastRead?.chapter || 1;

  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('bible_bookmarks', []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAiBuddyOpen, setIsAiBuddyOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isThematicStudyOpen, setIsThematicStudyOpen] = useState(false);
  
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
    return <HomeScreen onContinueReading={handleContinueReading} onStartReading={handleStartReading} lastRead={lastRead} />;
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
          bookName={selectedBook.name}
          chapter={selectedChapter}
          selectedTranslation={translation}
          onTranslationChange={setTranslation}
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
            />
        </main>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-30">
        <button
            onClick={() => setIsThematicStudyOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"
            aria-label="Estudo Temático com IA"
          >
            <IconSparkles className="w-6 h-6" />
        </button>
        <button
            onClick={() => setIsQuizOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"
            aria-label="Quiz Bíblico"
          >
            <IconBrain className="w-6 h-6" />
          </button>
        <button
            onClick={() => setIsAiBuddyOpen(!isAiBuddyOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"
            aria-label="Assistente de Estudo"
          >
            <IconFeather className="w-6 h-6" />
          </button>
      </div>

      <AiStudyBuddy
        isOpen={isAiBuddyOpen}
        onClose={() => setIsAiBuddyOpen(false)}
        context={{ book: selectedBook.name, chapter: selectedChapter }}
      />
      
      <BookmarksPanel
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onJumpToVerse={(book, chapter) => handleSelectChapter(book, chapter)}
        onUpdateBookmarkNote={handleUpdateBookmarkNote}
      />

      <BibleQuiz 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      <ThematicStudy
        isOpen={isThematicStudyOpen}
        onClose={() => setIsThematicStudyOpen(false)}
        onNavigateToVerse={handleSelectChapter}
      />
    </div>
  );
}