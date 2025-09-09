import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReadingView } from './components/ReadingView';
import { AiStudyBuddy } from './components/AiStudyBuddy';
import { BookmarksPanel } from './components/BookmarksPanel';
import { BibleQuiz } from './components/BibleQuiz';
import { HomeScreen } from './components/HomeScreen';
import { ThematicStudy } from './components/ThematicStudy';
import { SearchModal } from './components/SearchModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { books } from './data/bibleData';
import { Bookmark, LastRead, Highlight, HighlightColor, Theme } from './types';
import { IconFeather, IconBrain, IconSparkles } from './components/IconComponents';
import { isApiKeyAvailable } from './services/geminiService';

const ApiKeyErrorScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900 p-4 font-sans">
    <div className="w-full max-w-2xl text-center bg-white p-8 rounded-lg shadow-lg border-2 border-red-200">
      <h1 className="text-3xl font-bold mb-4">Configuração Necessária</h1>
      <p className="text-lg mb-2">A chave de API do Google AI não foi encontrada no ambiente.</p>
      <p className="mb-6">Para fazer o aplicativo funcionar na Vercel, siga estes passos:</p>
      <ol className="text-left list-decimal list-inside bg-red-100 text-red-800 p-4 rounded-md space-y-2">
        <li>Vá para o painel do seu projeto na Vercel.</li>
        <li>Clique em <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
        <li>Crie uma nova variável com o nome exatamente <code className="bg-red-200 px-1.5 py-0.5 rounded">API_KEY</code>.</li>
        <li>Cole sua chave de API do Google AI Studio no campo "Value".</li>
        <li>Salve e faça o <strong>Redeploy</strong> do seu projeto.</li>
      </ol>
      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="mt-8 inline-block bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
        Obter Chave de API
      </a>
    </div>
  </div>
);

export type Translation = 'acf' | 'nvi' | 'kjv';

interface BottomNavigationProps {
  onThematicStudyClick: () => void;
  onQuizClick: () => void;
  onAiBuddyClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onThematicStudyClick,
  onQuizClick,
  onAiBuddyClick,
}) => {
  const navItems = [
    { label: 'Estudo', icon: IconSparkles, onClick: onThematicStudyClick },
    { label: 'Quiz', icon: IconBrain, onClick: onQuizClick },
    { label: 'Assistente', icon: IconFeather, onClick: onAiBuddyClick },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-30 md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full h-full pt-1"
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};


export default function App() {
  if (!isApiKeyAvailable()) {
    return <ApiKeyErrorScreen />;
  }
  
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
    // When the user enables the feature for the first time, mark the tooltip as seen.
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
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
      
      {/* Floating Action Buttons for Desktop */}
      <div className="fixed bottom-6 right-6 flex-col space-y-3 z-30 hidden md:flex">
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

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation
        onThematicStudyClick={() => setIsThematicStudyOpen(true)}
        onQuizClick={() => setIsQuizOpen(true)}
        onAiBuddyClick={() => setIsAiBuddyOpen(true)}
      />

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToVerse={handleSelectChapter}
      />

      <AiStudyBuddy
        isOpen={isAiBuddyOpen}
        onClose={() => setIsAiBuddyOpen(false)}
        context={{ book: selectedBook.name, chapter: selectedChapter }}
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