import React, { useState, useEffect, useRef } from 'react';
import { SelectionState, CrossReferenceResult } from '../types';
import { IconX, IconSparkles, IconBrain, IconSearch, IconCopy, IconCheck, IconSpinner, IconChevronLeft } from './IconComponents';
import { explainText, findCrossReferencesForText, MissingApiKeyError } from '../services/geminiService';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface SelectionActionPanelProps {
  selection: SelectionState | null;
  onClose: () => void;
  onSearch: (text: string) => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

type PanelView = 'actions' | 'explain' | 'crossRef';

export const SelectionActionPanel: React.FC<SelectionActionPanelProps> = ({ selection, onClose, onSearch, onNavigateToVerse }) => {
  const [view, setView] = useState<PanelView>('actions');
  const [content, setContent] = useState<string | CrossReferenceResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const [translateY, setTranslateY] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; initialTranslate: number } | null>(null);

  const isOpen = selection !== null;

  useEffect(() => {
    if (isOpen) {
      setTranslateY(0);
    } else {
      // Reset state on close
      const timer = setTimeout(() => {
        setView('actions');
        setContent(null);
        setIsLoading(false);
        setError(null);
        setIsApiKeyError(false);
        setIsCopied(false);
      }, 300); // after animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleActionClick = async (action: PanelView) => {
    if (!selection) return;
    setView(action);
    setIsLoading(true);
    setContent(null);
    setError(null);
    setIsApiKeyError(false);

    try {
      let result;
      if (action === 'explain') {
        result = await explainText(selection.text);
        if (result) setContent(result.explanation);
      } else if (action === 'crossRef') {
        result = await findCrossReferencesForText(selection.text);
        if (result) setContent(result.references);
      }
      if (!result) {
        setError('Não foi possível obter os resultados. Tente novamente.');
      }
    } catch (e) {
      if (e instanceof MissingApiKeyError) setIsApiKeyError(true);
      else setError('Ocorreu um erro inesperado.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (selection) {
      navigator.clipboard.writeText(selection.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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
      panelRef.current.style.transition = 'transform 0.3s ease-in-out, height 0.3s ease-in-out';
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
    if (isApiKeyError) return <div className="p-4"><ApiKeyErrorDisplay context={view === 'explain' ? 'Explicação com IA' : 'Referências Cruzadas'} /></div>;
    if (error) return <p className="text-center text-destructive p-4">{error}</p>;

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

  const panelMaxHeight = view === 'actions' ? 'auto' : '80vh';
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
                className="flex items-center p-2 cursor-grab"
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <div className="w-10">
                    {view !== 'actions' && (
                        <button onClick={() => setView('actions')} className="p-2 -ml-1 rounded-full hover:bg-accent text-muted-foreground"><IconChevronLeft className="w-6 h-6"/></button>
                    )}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="w-10 h-1.5 bg-border rounded-full" />
                </div>
                <div className="w-10 flex justify-end">
                    <button onClick={onClose} className="p-2 -mr-1 rounded-full hover:bg-accent text-muted-foreground"><IconX className="w-5 h-5" /></button>
                </div>
            </div>

            {view === 'actions' ? (
                <div className="p-3 pt-0">
                    <p className="text-sm text-muted-foreground italic line-clamp-2 px-2 mb-2">
                        {selection?.text}
                    </p>
                    <div className="flex items-center justify-around">
                        <ActionButton icon={IconBrain} label="Explicar" onClick={() => handleActionClick('explain')} />
                        <ActionButton icon={IconSparkles} label="Referências" onClick={() => handleActionClick('crossRef')} />
                        <ActionButton icon={IconSearch} label="Buscar" onClick={() => selection && onSearch(selection.text)} />
                        <button onClick={handleCopy} className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors w-20">
                            {isCopied ? <IconCheck className="w-6 h-6 text-green-500" /> : <IconCopy className="w-6 h-6" />}
                            <span className="text-xs text-center">{isCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-y-auto flex-1">
                    {renderContent()}
                </div>
            )}
        </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors w-20">
        <Icon className="w-6 h-6" />
        <span className="text-xs text-center">{label}</span>
    </button>
);