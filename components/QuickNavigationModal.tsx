
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
      className={`fixed inset-0 bg-black z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-card text-card-foreground rounded-none md:rounded-xl shadow-[var(--shadow-xl)] w-full h-full md:w-full md:max-w-3xl md:h-[80vh] md:max-h-[700px] flex flex-col transform transition-all duration-300 ease-in-out border-none md:border border-border ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
           <div className="w-10">
              {view === 'chapter' && (
                <button onClick={() => setView('book')} className="p-2 -ml-2 rounded-full hover:bg-accent text-muted-foreground">
                  <IconChevronLeft className="w-5 h-5 flex-shrink-0" />
                </button>
              )}
           </div>
          <h2 className="text-xl font-bold text-center truncate px-2">
            {view === 'book' ? 'Navegação Rápida' : selectedBook?.name}
          </h2>
          <div className="w-10 flex justify-end">
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-accent text-muted-foreground">
              <IconX className="w-5 h-5 flex-shrink-0" />
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
                    className="w-full p-2 pl-10 border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none bg-background"
                  />
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredBooks.map(book => (
                  <button
                    key={book.name}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full text-left px-4 py-3 text-lg transition-colors ${selectedBook?.name === book.name ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-accent'}`}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selection View */}
            <div className="w-full h-full flex-shrink-0 p-4 overflow-y-auto">
              {selectedBook && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => handleSelectChapter(chapter)}
                      className={`flex items-center justify-center aspect-square rounded-full transition-colors font-medium text-base ${
                        selectedBook.name === currentBookName && chapter === currentChapter
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
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