import React, { useState } from 'react';
import { searchVerses } from '../services/geminiService';
import { SearchResult } from '../types';
import { IconX, IconSpinner, IconSearch } from './IconComponents';

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

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    const searchResults = await searchVerses(query);
    if (searchResults) {
      setResults(searchResults);
    } else {
      setError('Não foi possível realizar a busca. Tente novamente.');
    }
    setIsLoading(false);
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
            <span key={i} className="bg-yellow-200 dark:bg-yellow-600 font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
            <IconSearch className="mr-2" />
            Buscar na Bíblia
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <IconX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Busque por palavra, tema ou referência (ex: João 3:16)"
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              {isLoading ? <IconSpinner className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <IconSpinner className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!isLoading && hasSearched && results.length === 0 && !error && (
             <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Nenhum resultado encontrado para "{query}".</p>
             </div>
          )}
           {!isLoading && !hasSearched && (
             <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Pesquise por palavras-chave, temas ou referências bíblicas.</p>
             </div>
          )}
          {results.length > 0 && (
            <ul className="space-y-4">
              {results.map((result, index) => (
                <li key={index} className="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left"
                  >
                    <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">{result.reference}</p>
                    <p className="text-gray-700 dark:text-gray-300">
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
