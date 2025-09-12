import React, { useState, useEffect } from 'react';
import { getThematicStudy, MissingApiKeyError } from '../services/geminiService';
import { ThematicStudyResult } from '../types';
import { IconX, IconSpinner, IconSparkles } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface ThematicStudyProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

const ThematicStudy: React.FC<ThematicStudyProps> = ({ isOpen, onClose, onNavigateToVerse }) => {
  const [theme, setTheme] = useState('');
  const [studyResult, setStudyResult] = useState<ThematicStudyResult | null>(null);
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

  const handleSearch = async () => {
    if (!theme.trim()) return;
    setIsLoading(true);
    setError(null);
    setIsApiKeyError(false);
    setStudyResult(null);

    try {
      const result = await getThematicStudy(theme);
      if (result) {
        setStudyResult(result);
      } else {
        setError('Não foi possível gerar o estudo. Tente um tema diferente ou verifique sua conexão.');
      }
    } catch (e) {
      if (e instanceof MissingApiKeyError) {
        setIsApiKeyError(true);
      } else {
        setError('Ocorreu um erro inesperado ao gerar o estudo. Tente novamente mais tarde.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setTheme('');
      setStudyResult(null);
      setError(null);
      setIsApiKeyError(false);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-in-out ${animationClass.backdrop}`}>
      <div className={`bg-card text-card-foreground rounded-none md:rounded-xl shadow-[var(--shadow-xl)] w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out border-none md:border border-border ${animationClass.modal}`}>
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center">
            <IconSparkles className="mr-2 text-emerald-500" />
            Estudo Temático com IA
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Digite um tema (ex: Fé, Perdão, Esperança)"
                    className="flex-1 p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none bg-background"
                    disabled={isLoading}
                />
                <button onClick={handleSearch} disabled={isLoading || !theme.trim()} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <IconSpinner className="w-5 h-5 animate-spin" /> : 'Gerar'}
                </button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isApiKeyError ? (
            <ApiKeyErrorDisplay context="Estudo Temático" />
          ) : !studyResult && !isLoading && !error ? (
            <div className="text-center text-muted-foreground pt-8">
                <p>Insira um tema para começar seu estudo bíblico personalizado.</p>
            </div>
          ) : null}
          {isLoading && (
            <div className="flex justify-center items-center h-full">
                <IconSpinner className="w-12 h-12 animate-spin text-emerald-500" />
            </div>
          )}
          {error && <p className="text-center text-destructive">{error}</p>}
          {studyResult && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold mb-2">Resumo sobre {theme}</h3>
                    <p className="text-muted-foreground leading-relaxed">{studyResult.summary}</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">Versículos Chave</h3>
                    <ul className="space-y-3">
                        {studyResult.verses.map((verse, index) => (
                            <li key={index} className="p-3 bg-muted/50 rounded-lg border border-border">
                                <button
                                 onClick={() => {
                                    onNavigateToVerse(verse.book, verse.chapter);
                                    handleClose();
                                 }}
                                 className="font-semibold text-primary hover:underline text-left"
                                >
                                    {verse.reference}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThematicStudy;