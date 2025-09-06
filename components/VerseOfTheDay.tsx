import React, { useState, useEffect, useCallback } from 'react';
import { getVerseOfTheDay } from '../services/geminiService';
import { VerseOfTheDay as VerseOfTheDayType } from '../types';
import { IconSpinner, IconRefresh } from './IconComponents';

export const VerseOfTheDay: React.FC = () => {
  const [verseData, setVerseData] = useState<VerseOfTheDayType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVerseOfTheDay();
      if (data) {
        setVerseData(data);
      } else {
        setError('Não foi possível carregar o versículo do dia.');
      }
    } catch (e) {
      setError('Ocorreu um erro ao buscar o versículo. Tente novamente mais tarde.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerse();
  }, [fetchVerse]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Versículo do Dia</h2>
        <button 
          onClick={fetchVerse} 
          disabled={isLoading}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait"
          aria-label="Gerar novo versículo"
        >
          <IconRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <IconSpinner className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : verseData ? (
        <div className="space-y-4">
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 italic">"{verseData.text}"</p>
            <p className="text-right font-semibold text-blue-600 dark:text-blue-400 mt-2">{verseData.reference}</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
             <p className="text-gray-600 dark:text-gray-400">{verseData.reflection}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};