import React, { useState } from 'react';
import { books } from '../data/bibleData';
import { IconX, IconSun, IconMoon } from './IconComponents';
import { Theme } from '../types';

interface SidebarProps {
  isOpen: boolean;
  selectedBookName: string;
  selectedChapter: number;
  onSelectChapter: (book: string, chapter: number) => void;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({ isOpen, selectedBookName, selectedChapter, onSelectChapter, onClose, theme, onToggleTheme }) => {
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBookName);

  const oldTestamentBooks = books.filter(b => b.testament === 'old');
  const newTestamentBooks = books.filter(b => b.testament === 'new');

  const renderBook = (book: typeof books[0]) => (
    <div key={book.name}>
      <button
        onClick={() => setExpandedBook(expandedBook === book.name ? null : book.name)}
        className={`w-full text-left p-3 text-lg font-semibold transition-colors ${selectedBookName === book.name ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}`}
      >
        {book.name}
      </button>
      {expandedBook === book.name && (
        <div className="grid grid-cols-5 gap-2 p-3 bg-background">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => (
            <button
              key={chapter}
              onClick={() => onSelectChapter(book.name, chapter)}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors text-base ${
                selectedBookName === book.name && selectedChapter === chapter
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'hover:bg-accent'
              }`}
            >
              {chapter}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
        <aside
            className={`absolute md:relative z-20 w-80 bg-card h-full border-r border-border flex flex-col transition-transform transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
        >
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-2xl font-bold">Livros</h2>
                <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-accent">
                    <IconX className="w-6 h-6"/>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div>
                    <h3 className="p-3 text-lg font-bold bg-muted text-muted-foreground">Antigo Testamento</h3>
                    {oldTestamentBooks.map(renderBook)}
                </div>
                <div>
                    <h3 className="p-3 text-lg font-bold bg-muted text-muted-foreground">Novo Testamento</h3>
                    {newTestamentBooks.map(renderBook)}
                </div>
            </div>
             <div className="p-2 border-t border-border">
                <button onClick={onToggleTheme} className="w-full flex items-center justify-center p-3 text-sm rounded-lg hover:bg-accent text-muted-foreground">
                    {theme === 'dark' ? <IconSun className="w-5 h-5 mr-3" /> : <IconMoon className="w-5 h-5 mr-3" />}
                    Mudar para tema {theme === 'dark' ? 'Claro' : 'Escuro'}
                </button>
            </div>
        </aside>
        {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"></div>}
    </>
  );
};

export const Sidebar = React.memo(SidebarComponent);