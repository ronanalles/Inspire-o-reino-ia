import React, { useState, useEffect, useRef } from 'react';
import { PanelState, CrossReferenceResult } from '../types';
import { IconX, IconSpinner } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface SelectionActionPanelProps {
  panelState: PanelState;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

export const SelectionActionPanel: React.FC<SelectionActionPanelProps> = ({ panelState, onClose, onNavigateToVerse }) => {
  const { view, content, isLoading, error } = panelState;
  
  const [translateY, setTranslateY] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; initialTranslate: number } | null>(null);

  const isOpen = view !== null;

  useEffect(() => {
    if (isOpen) {
      setTranslateY(0);
    }
  }, [isOpen]);

  const handleDragStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragStartRef.current = { y: e.touches[0].clientY, initialTranslate: translateY };
    if (panelRef.current) panelRef.current.style.transition = 'none';
  };

  const handleDragMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const newTranslateY = dragStartRef.current.initialTranslate + deltaY;
    if (newTranslateY > 0) { // Only allow dragging down
      setTranslateY(newTranslateY);
    }
  };

  const handleDragEnd = () => {
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.3s ease-in-out, max-height 0.3s ease-in-out';
      if (translateY > 100) { // Threshold to close
        onClose();
      } else {
        setTranslateY(0); // Snap back
      }
    }
    dragStartRef.current = null;
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-40"><IconSpinner className="w-8 h-8 animate-spin text-primary" /></div>;
    if (error) {
      if (error === 'api_key_missing') {
        return <div className="p-4"><ApiKeyErrorDisplay context={view === 'explain' ? 'Explicação com IA' : 'Referências Cruzadas'} /></div>;
      }
      return <p className="text-center text-destructive p-4">{error}</p>;
    }

    if (view === 'explain' && typeof content === 'string') {
      return <div className="prose prose-base dark:prose-invert max-w-none p-4" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />;
    }
    
    if (view === 'crossRef' && Array.isArray(content)) {
        if(content.length === 0) return <p className="text-center text-muted-foreground p-4">Nenhuma referência encontrada.</p>;
        return (
            <ul className="space-y-3 p-4">
                {content.map((ref, index) => (
                    <li key={index} className="p-3 bg-muted/50 rounded-lg border border-border">
                        <button onClick={() => { onNavigateToVerse(ref.book, ref.chapter); onClose(); }} className="font-bold text-primary mb-1 hover:underline text-left">
                            {ref.reference}
                        </button>
                        <p className="text-foreground/90 text-sm">"{ref.text}"</p>
                    </li>
                ))}
            </ul>
        );
    }
    return null;
  };

  const panelMaxHeight = '80vh';
  const panelTransform = `translateY(${isOpen ? 0 : 100}%) translateY(${translateY}px)`;

  return (
    <div className={`fixed inset-0 z-20 transition-colors duration-300 ${isOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={onClose}>
        <div 
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            style={{ transform: panelTransform, maxHeight: panelMaxHeight }}
            className="fixed bottom-0 inset-x-0 bg-card border-t border-border rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.4)] flex flex-col transition-transform duration-300 ease-in-out"
        >
            <div
                className="flex items-center p-2 cursor-grab flex-shrink-0"
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <div className="flex-1 flex justify-center">
                    <div className="w-10 h-1.5 bg-border rounded-full" />
                </div>
                <button onClick={onClose} className="absolute right-2 p-2 rounded-full hover:bg-accent text-muted-foreground"><IconX className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto flex-1">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};