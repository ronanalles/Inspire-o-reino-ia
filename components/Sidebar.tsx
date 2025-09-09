import React, { useState } from 'react';
import { books } from '../data/bibleData';
import { IconX } from './IconComponents';

interface SidebarProps {
  isOpen: boolean;
  selectedBookName: string;
  selectedChapter: number;
  onSelectChapter: (book: string, chapter: number) => void;
  onClose: () => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({ isOpen, selectedBookName, selectedChapter, onSelectChapter, onClose }) => {
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBookName);

  const oldTestamentBooks = books.filter(b => b.testament === 'old');
  const newTestamentBooks = books.filter(b => b.testament === 'new');

  const renderBook = (book: typeof books[0]) => (
    <div key={book.name}>
      <button
        onClick={() => setExpandedBook(expandedBook === book.name ? null : book.name)}
        className={`w-full text-left p-3 text-lg font-semibold transition-colors ${selectedBookName === book.name ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
      >
        {book.name}
      </button>
      {expandedBook === book.name && (
        <div className="grid grid-cols-5 gap-1 p-2 bg-gray-50 dark:bg-gray-800">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => (
            <button
              key={chapter}
              onClick={() => onSelectChapter(book.name, chapter)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                selectedBookName === book.name && selectedChapter === chapter
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
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
            className={`absolute md:relative z-20 w-80 bg-white dark:bg-gray-900 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold">Livros</h2>
                <button onClick={onClose} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <IconX className="w-6 h-6"/>
                </button>
            </div>
            <div className="overflow-y-auto">
                <div>
                    <h3 className="p-3 text-lg font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Antigo Testamento</h3>
                    {oldTestamentBooks.map(renderBook)}
                </div>
                <div>
                    <h3 className="p-3 text-lg font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Novo Testamento</h3>
                    {newTestamentBooks.map(renderBook)}
                </div>
            </div>
        </aside>
        {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"></div>}
    </>
  );
};

export const Sidebar = React.memo(SidebarComponent);