
import React, { useState, useEffect, useRef } from 'react';
import { StudyVerseState, CrossReferenceResult } from '../types';
import { IconX, IconSpinner, IconBrain, IconLink, IconBookmark, IconCopy, IconCheck, IconChevronLeft, IconBookmarkSolid } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';
import { explainText, findCrossReferencesForText, MissingApiKeyError } from '../services/geminiService';

interface StudyPanelProps {
  studyVerse: StudyVerseState | null;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

type PanelView = 'actions' | 'explain' | 'crossRef';

export const StudyPanel: React.FC<StudyPanelProps> = ({ studyVerse, onClose, onNavigateToVerse, isBookmarked, onToggleBookmark }) => {
  const [view, setView] = useState<PanelView>('actions');
  const [content, setContent] = useState<string | CrossReferenceResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [editableText, setEditableText] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = studyVerse !== null;

  useEffect(() => {
    if (isOpen && studyVerse) {
      setView('actions');
      setContent(null);
      setError(null);
      setIsLoading(false);
      setIsCopied(false);
      setEditableText(studyVerse.text);
    }
  }, [isOpen, studyVerse]);

  useEffect(() => {
    // Auto-resize textarea height based on content
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editableText, view]);

  const handleAction = async (action: 'explain' | 'crossRef') => {
    if (!studyVerse) return;

    const textToAnalyze = editableText.trim();
    if (!textToAnalyze) return;


    setView(action);
    setIsLoading(true);
    setError(null);
    setContent(null);

    try {
      let result;
      if (action === 'explain') {
        result = await explainText(textToAnalyze);
        setContent(result?.explanation || null);
      } else { // crossRef
        result = await findCrossReferencesForText(textToAnalyze);
        setContent(result?.references || null);
      }

      if (!result) {
        setError('Não foi possível obter os resultados. Tente novamente.');
      }
    } catch (e) {
      console.error(e);
      const isApiError = e instanceof MissingApiKeyError;
      setError(isApiError ? 'api_key_missing' : 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!studyVerse) return;
    const textToCopy = editableText;
    const reference = `"${textToCopy}" (${studyVerse.book} ${studyVerse.chapter}:${studyVerse.verse})`;
    navigator.clipboard.writeText(reference);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-48"><IconSpinner className="w-8 h-8 animate-spin text-primary" /></div>;
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

  const panelHeight = view === 'actions' ? 'auto' : '80vh';
  const panelTransform = `translateY(${isOpen ? 0 : 100}%)`;

  return (
    <div className={`fixed inset-0 z-30 transition-colors duration-300 ${isOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={onClose}>
        <div 
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            style={{ transform: panelTransform, maxHeight: '90vh' }}
            className="fixed bottom-0 inset-x-0 bg-card border-t border-border rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.4)] flex flex-col transition-transform duration-300 ease-in-out"
        >
            <div className="flex items-center justify-center p-2 flex-shrink-0 border-b border-border relative">
                {view !== 'actions' && (
                    <button onClick={() => { setView('actions'); }} className="absolute left-2 p-2 rounded-full hover:bg-accent text-muted-foreground"><IconChevronLeft className="w-5 h-5" /></button>
                )}
                <div className="w-10 h-1.5 bg-border rounded-full cursor-grab" />
                <button onClick={onClose} className="absolute right-2 p-2 rounded-full hover:bg-accent text-muted-foreground"><IconX className="w-5 h-5" /></button>
            </div>
            
            {view === 'actions' ? (
                 <div className="p-4">
                    <p className="font-bold text-lg text-center mb-2">{studyVerse?.book} {studyVerse?.chapter}:{studyVerse?.verse}</p>
                    <div className="bg-muted p-2 rounded-lg mb-2">
                      <textarea
                        ref={textareaRef}
                        value={editableText}
                        onChange={(e) => setEditableText(e.target.value)}
                        className="w-full bg-transparent text-foreground/90 resize-none focus:outline-none focus:ring-0 border-none p-0 m-0 leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <p className="text-center text-xs text-muted-foreground mb-4">
                        Edite o texto acima para refinar a análise da IA.
                    </p>
                     <div className="grid grid-cols-4 gap-2 text-center">
                         <ActionButton icon={IconBrain} label="Explicar" onClick={() => handleAction('explain')} />
                         <ActionButton icon={IconLink} label="Referências" onClick={() => handleAction('crossRef')} />
                         <ActionButton icon={isBookmarked ? IconBookmarkSolid : IconBookmark} label={isBookmarked ? "Salvo" : "Salvar"} onClick={onToggleBookmark} className={isBookmarked ? 'text-primary' : ''}/>
                         <ActionButton icon={isCopied ? IconCheck : IconCopy} label={isCopied ? "Copiado" : "Copiar"} onClick={handleCopy} className={isCopied ? 'text-green-500' : ''}/>
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

const ActionButton: React.FC<{ icon: React.FC<any>, label: string, onClick: () => void, className?: string }> = ({ icon: Icon, label, onClick, className }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent space-y-1 transition-colors ${className}`}>
        <div className={`p-3 rounded-full bg-muted ${className}`}>
            <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </button>
);