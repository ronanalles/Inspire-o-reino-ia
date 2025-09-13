import React, { useState, useEffect } from 'react';
import { explainText, MissingApiKeyError } from '../services/geminiService';
import { IconX, IconSpinner, IconBrain } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface ExplainWithAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  textToExplain: string;
}

const ExplainWithAiModal: React.FC<ExplainWithAiModalProps> = ({ isOpen, onClose, textToExplain }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
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
    const getExplanation = async () => {
        if (isOpen && textToExplain) {
            setIsLoading(true);
            setError(null);
            setExplanation(null);
            setIsApiKeyError(false);

            try {
                const result = await explainText(textToExplain);
                if (result) {
                    setExplanation(result.explanation);
                } else {
                    setError('Não foi possível gerar a explicação. Tente novamente.');
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
    getExplanation();
  }, [isOpen, textToExplain]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-in-out ${animationClass.backdrop}`}>
      <div className={`bg-card text-card-foreground rounded-none md:rounded-xl shadow-[var(--shadow-xl)] w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out border-none md:border border-border ${animationClass.modal}`}>
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center">
            <IconBrain className="mr-2 text-primary" />
            Explicando com IA
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="font-semibold text-card-foreground">Trecho selecionado:</p>
                <p className="italic text-muted-foreground mt-1">"{textToExplain}"</p>
            </div>
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <IconSpinner className="w-12 h-12 animate-spin text-primary" />
                </div>
            )}
            {isApiKeyError && <ApiKeyErrorDisplay context="Explicação com IA" />}
            {error && <p className="text-center text-destructive">{error}</p>}
            {explanation && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                   <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
        <div className="p-2 bg-muted/50 border-t border-border rounded-b-none md:rounded-b-xl flex-shrink-0 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainWithAiModal;