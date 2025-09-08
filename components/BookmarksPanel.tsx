
import React, { useState } from 'react';
import { Bookmark, Highlight } from '../types';
import { IconBookmark, IconX, IconPencil, IconTrash } from './IconComponents';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  onJumpToVerse: (book: string, chapter: number) => void;
  onUpdateBookmarkNote: (bookmark: Bookmark, newNote: string) => void;
  onRemoveHighlight: (id: string) => void;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ 
    isOpen, 
    onClose, 
    bookmarks, 
    highlights, 
    onJumpToVerse, 
    onUpdateBookmarkNote,
    onRemoveHighlight
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'highlights'>('bookmarks');
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleEditClick = (bookmark: Bookmark) => {
    const bookmarkId = `${bookmark.book}-${bookmark.chapter}-${bookmark.verse}`;
    setEditingBookmarkId(bookmarkId);
    setNoteText(bookmark.note || '');
  };
  
  const handleSaveNote = (bookmark: Bookmark) => {
    onUpdateBookmarkNote(bookmark, noteText);
    setEditingBookmarkId(null);
    setNoteText('');
  };

  const handleCancelEdit = () => {
    setEditingBookmarkId(null);
    setNoteText('');
  };

  const highlightBgClasses: Record<string, string> = {
    yellow: 'bg-yellow-200 dark:bg-yellow-800/50',
    green: 'bg-green-200 dark:bg-green-800/50',
    blue: 'bg-blue-200 dark:bg-blue-800/50',
    pink: 'bg-pink-200 dark:bg-pink-800/50',
  };

  const BookmarksList = () => (
    <>
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <IconBookmark className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Você ainda não salvou nenhum versículo.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Clique no ícone de marcador ao lado de um versículo.</p>
        </div>
      ) : (
        <ul>
          {bookmarks.sort((a,b) => a.book.localeCompare(b.book) || a.chapter - b.chapter || a.verse - b.verse).map((bm, index) => {
            const bookmarkId = `${bm.book}-${bm.chapter}-${bm.verse}`;
            const isEditing = editingBookmarkId === bookmarkId;

            return (
              <li key={index} className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div onClick={() => !isEditing && onJumpToVerse(bm.book, bm.chapter)} className="cursor-pointer">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{`${bm.book} ${bm.chapter}:${bm.verse}`}</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">"{bm.text}"</p>
                </div>
                {isEditing ? (
                  <div className="mt-2">
                     <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Escreva sua anotação..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows={3}/>
                     <div className="flex justify-end space-x-2 mt-2">
                        <button onClick={handleCancelEdit} className="px-3 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button onClick={() => handleSaveNote(bm)} className="px-3 py-1 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600">Salvar</button>
                     </div>
                  </div>
                ) : (
                   <div className="mt-2 flex items-start justify-between">
                      {bm.note ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-100 dark:bg-gray-700 p-2 rounded-md flex-1 break-words">{bm.note}</p>
                      ) : (<p className="text-sm text-gray-500 italic">Sem anotações.</p>)}
                      <button onClick={() => handleEditClick(bm)} className="p-1.5 ml-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"><IconPencil className="w-4 h-4" /></button>
                   </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  const HighlightsList = () => (
    <>
        {highlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <IconPencil className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Você ainda não grifou nenhum texto.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Selecione um texto na leitura para grifá-lo.</p>
            </div>
        ) : (
            <ul>
                {highlights.map((hl) => (
                    <li key={hl.id} className="border-b border-gray-200 dark:border-gray-700 p-4 group">
                        <div onClick={() => onJumpToVerse(hl.book, hl.chapter)} className="cursor-pointer">
                            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{`${hl.book} ${hl.chapter}:${hl.verse}`}</p>
                            <p className={`p-2 rounded-md ${highlightBgClasses[hl.color]}`}>"{hl.text}"</p>
                        </div>
                        <div className="text-right mt-2">
                             <button 
                                onClick={() => onRemoveHighlight(hl.id)} 
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remover grifado"
                              >
                                <IconTrash className="w-4 h-4" />
                             </button>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </>
  );

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold flex items-center">
              <IconBookmark className="mr-2" />
              Itens Salvos
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <IconX className="w-6 h-6" />
            </button>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
                <button onClick={() => setActiveTab('bookmarks')} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'bookmarks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Versículos Salvos
                </button>
                <button onClick={() => setActiveTab('highlights')} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'highlights' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Textos Grifados
                </button>
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'bookmarks' ? <BookmarksList /> : <HighlightsList />}
          </div>
        </div>
      </div>
    </>
  );
};