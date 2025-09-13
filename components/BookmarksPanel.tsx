
import React, { useState } from 'react';
import { Bookmark } from '../types';
import { IconBookmark, IconX, IconPencil } from './IconComponents';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onJumpToVerse: (book: string, chapter: number) => void;
  onUpdateBookmarkNote: (bookmark: Bookmark, newNote: string) => void;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ 
    isOpen, 
    onClose, 
    bookmarks, 
    onJumpToVerse, 
    onUpdateBookmarkNote,
}) => {
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

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-[var(--shadow-xl)] transform transition-transform z-40 border-l border-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold flex items-center">
              <IconBookmark className="mr-2 w-5 h-5 flex-shrink-0" />
              Versículos Salvos
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
              <IconX className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <IconBookmark className="w-16 h-16 mb-4" />
                <p className="font-semibold">Você ainda não salvou nenhum versículo.</p>
                <p className="text-sm">Clique no ícone de marcador ao lado de um versículo.</p>
                </div>
            ) : (
                <ul>
                {bookmarks.sort((a,b) => a.book.localeCompare(b.book) || a.chapter - b.chapter || a.verse - b.verse).map((bm, index) => {
                    const bookmarkId = `${bm.book}-${bm.chapter}-${bm.verse}`;
                    const isEditing = editingBookmarkId === bookmarkId;

                    return (
                    <li key={index} className="border-b border-border p-4">
                        <div onClick={() => !isEditing && onJumpToVerse(bm.book, bm.chapter)} className="cursor-pointer">
                        <p className="font-semibold text-primary">{`${bm.book} ${bm.chapter}:${bm.verse}`}</p>
                        <p className="text-foreground/90 mt-1">"{bm.text}"</p>
                        </div>
                        {isEditing ? (
                        <div className="mt-2">
                            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Escreva sua anotação..." className="w-full p-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none bg-background" rows={3}/>
                            <div className="flex justify-end space-x-2 mt-2">
                                <button onClick={handleCancelEdit} className="px-3 py-1 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-muted">Cancelar</button>
                                <button onClick={() => handleSaveNote(bm)} className="px-3 py-1 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90">Salvar</button>
                            </div>
                        </div>
                        ) : (
                        <div className="mt-2 flex items-start justify-between">
                            {bm.note ? (
                                <p className="text-sm text-muted-foreground italic bg-muted p-2 rounded-md flex-1 break-words">{bm.note}</p>
                            ) : (<p className="text-sm text-muted-foreground italic">Sem anotações.</p>)}
                            <button onClick={() => handleEditClick(bm)} className="p-1.5 ml-2 rounded-full text-muted-foreground hover:bg-accent flex-shrink-0"><IconPencil className="w-4 h-4 flex-shrink-0" /></button>
                        </div>
                        )}
                    </li>
                    );
                })}
                </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
