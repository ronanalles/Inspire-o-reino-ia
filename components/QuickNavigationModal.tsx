
import React, { useState, useMemo, useEffect } from 'react';
import { Book } from '../types';
import { books } from '../data/bibleData';
import { IconX, IconSearch, IconChevronLeft } from './IconComponents';

interface QuickNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (bookName: string, chapter: number) => void;
  currentBookName: string;
  currentChapter: number;
}

export const QuickNavigationModal: React.FC<QuickNavigationModalProps> = ({ isOpen, onClose, onNavigate, currentBookName, currentChapter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'book' | 'chapter'>('book');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentBook = books.find(b => b.name === currentBookName) || books[0];
      setSelectedBook(currentBook);
      setView('book');
      setSearchTerm('');
    }
  }, [isOpen, currentBookName]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return books;
    return books.filter(book => book.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setView('chapter');
  };
  
  const handleSelectChapter = (chapter: number) => {
    if (selectedBook) {
      onNavigate(selectedBook.name, chapter);
    }
  };

  const containerClasses = `relative w-full h-full flex transition-transform duration-300 ease-in-out`;
  const viewTransformClass = view === 'book' ? 'translate-x-0' : '-translate-x-full';
  
  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-none md:rounded-xl shadow-2xl w-full h-full md:w-full md:max-w-3xl md:h-[80vh] md:max-h-[700px] flex flex-col transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
           <div className="w-10">
              {view === 'chapter' && (
                <button onClick={() => setView('book')} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <IconChevronLeft className="w-6 h-6" />
                </button>
              )}
           </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center truncate px-2">
            {view === 'book' ? 'Navegação Rápida' : selectedBook?.name}
          </h2>
          <div className="w-10 flex justify-end">
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <IconX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className={`${containerClasses} ${viewTransformClass}`}>
            {/* Book Selection View */}
            <div className="w-full h-full flex-shrink-0 flex flex-col">
              <div className="p-2 flex-shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar livro..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-700"
                  />
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredBooks.map(book => (
                  <button
                    key={book.name}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full text-left px-4 py-3 text-lg transition-colors ${selectedBook?.name === book.name ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selection View */}
            <div className="w-full h-full flex-shrink-0 p-3 overflow-y-auto">
              {selectedBook && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => handleSelectChapter(chapter)}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors font-medium text-lg ${
                        selectedBook.name === currentBookName && chapter === currentChapter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
