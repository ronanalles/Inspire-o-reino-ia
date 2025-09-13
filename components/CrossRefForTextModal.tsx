import React, { useState, useEffect } from 'react';
import { findCrossReferencesForText, MissingApiKeyError } from '../services/geminiService';
import { CrossReferenceResult } from '../types';
import { IconX, IconSpinner, IconSparkles } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface CrossRefForTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  textForCrossRef: string;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

const CrossRefForTextModal: React.FC<CrossRefForTextModalProps> = ({ isOpen, onClose, textForCrossRef, onNavigateToVerse }) => {
  const [references, setReferences] = useState<CrossReferenceResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [animationClass, setAnimationClass] = useState({ backdrop: 'opacity-0', modal: 'opacity-0 scale-95' });

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimationClass({ backdrop: 'opacity-100', modal: 'opacity-100 scale-100' });
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationClass({ backdrop: 'opacity-0', modal: 'opacity-0 scale-95' });
    }
  }, [isOpen]);

  useEffect(() => {
    const getReferences = async () => {
        if (isOpen && textForCrossRef) {
            setIsLoading(true);
            setError(null);
            setReferences(null);
            setIsApiKeyError(false);
            try {
                const result = await findCrossReferencesForText(textForCrossRef);
                if (result && result.references) {
                    setReferences(result.references);
                } else {
                    setError('Não foi possível encontrar referências. Tente novamente.');
                }
            } catch (e) {
                if (e instanceof MissingApiKeyError) {
                    setIsApiKeyError(true);
                } else {
                    setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
                }
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
    };
    getReferences();
  }, [isOpen, textForCrossRef]);
  
  const handleNavigate = (book: string, chapter: number) => {
    onNavigateToVerse(book, chapter);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-in-out ${animationClass.backdrop}`}>
      <div className={`bg-card text-card-foreground rounded-none md:rounded-xl shadow-[var(--shadow-xl)] w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out border-none md:border border-border ${animationClass.modal}`}>
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center">
            <IconSparkles className="mr-2 text-primary" />
            Referências Cruzadas
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="font-semibold text-card-foreground">Trecho selecionado:</p>
                <p className="italic text-muted-foreground mt-1">"{textForCrossRef}"</p>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <IconSpinner className="w-12 h-12 animate-spin text-primary" />
                </div>
            )}

            {isApiKeyError && <ApiKeyErrorDisplay context="Referências Cruzadas" />}
            
            {error && <p className="text-center text-destructive">{error}</p>}

            {references && references.length === 0 && !isLoading && (
                 <div className="text-center text-muted-foreground pt-8">
                    <p>Nenhuma referência cruzada encontrada para este trecho.</p>
                 </div>
            )}
            
            {references && references.length > 0 && (
                <ul className="space-y-4">
                    {references.map((ref, index) => (
                        <li key={index} className="p-4 bg-card rounded-lg border border-border">
                             <button onClick={() => handleNavigate(ref.book, ref.chapter)} className="font-bold text-primary mb-1 hover:underline text-left">
                                {ref.reference}
                            </button>
                            <p className="text-foreground/90">"{ref.text}"</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default CrossRefForTextModal;