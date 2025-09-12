import React, { useState } from 'react';
import { searchVerses, MissingApiKeyError } from '../services/geminiService';
import { SearchResult } from '../types';
import { IconX, IconSpinner, IconSearch } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigateToVerse }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setIsApiKeyError(false);
    setResults([]);
    setHasSearched(true);

    try {
      const searchResults = await searchVerses(query);
      if (searchResults) {
        setResults(searchResults);
      } else {
        setError('Não foi possível realizar a busca. Tente novamente.');
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
  };

  const handleResultClick = (result: SearchResult) => {
    onNavigateToVerse(result.book, result.chapter);
    onClose();
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-primary/20 text-primary-foreground font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh] transform transition-all duration-300 ease-in-out border border-border ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold flex items-center">
            <IconSearch className="mr-2" />
            Buscar na Bíblia
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Busque por palavra, tema ou referência (ex: João 3:16)"
              className="flex-1 p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none bg-background"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <IconSpinner className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <IconSpinner className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : isApiKeyError ? (
            <ApiKeyErrorDisplay context="Busca na Bíblia" />
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : null}

          {!isLoading && !isApiKeyError && hasSearched && results.length === 0 && !error && (
             <div className="text-center text-muted-foreground">
                <p>Nenhum resultado encontrado para "{query}".</p>
             </div>
          )}
           {!isLoading && !isApiKeyError && !hasSearched && (
             <div className="text-center text-muted-foreground">
                <p>Pesquise por palavras-chave, temas ou referências bíblicas.</p>
             </div>
          )}
          {results.length > 0 && (
            <ul className="space-y-4">
              {results.map((result, index) => (
                <li key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left"
                  >
                    <p className="font-bold text-primary mb-1">{result.reference}</p>
                    <p className="text-foreground/90">
                      {highlightQuery(result.text, query)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};