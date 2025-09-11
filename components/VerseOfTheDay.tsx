import React, { useState, useEffect, useCallback } from 'react';
import { getVerseOfTheDay, MissingApiKeyError } from '../services/geminiService';
import { VerseOfTheDay as VerseOfTheDayType, StoredVerseOfTheDay } from '../types';
import { IconSpinner, IconRefresh } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { books } from '../data/bibleData';

export const VerseOfTheDay: React.FC = () => {
  const [storedVerse, setStoredVerse] = useLocalStorage<StoredVerseOfTheDay | null>('verse_of_the_day', null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    const today = new Date().toDateString();

    if (!forceRefresh && storedVerse && storedVerse.date === today) {
        setIsLoading(false);
        return;
    }
    
    try {
      // 1. Pick a random book from the list
      const randomBookIndex = Math.floor(Math.random() * books.length);
      const randomBook = books[randomBookIndex];
      
      // 2. Pick a random chapter from that book
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;

      // 3. Call the AI service with the specific book and chapter
      const data = await getVerseOfTheDay(randomBook.name, randomChapter);

      if (data) {
        setStoredVerse({ verse: data, date: today });
      } else {
        setError('Não foi possível carregar o versículo do dia.');
        if (!storedVerse) { // Clear stored verse if API fails and there's nothing to show
          setStoredVerse(null);
        }
      }
    } catch (e) {
      if (e instanceof MissingApiKeyError) {
        setError("Chave de API não configurada. Por favor, configure a variável de ambiente API_KEY em suas configurações de implantação.");
      } else {
        setError('Ocorreu um erro ao buscar o versículo. Tente novamente mais tarde.');
      }
      console.error(e);
      if (!storedVerse) {
        setStoredVerse(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [storedVerse, setStoredVerse]);

  useEffect(() => {
    // On first load, check if a new verse is needed for the day.
    fetchVerse();
  }, []); // Run only once on mount to check for daily update

  const verseData = storedVerse?.verse;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Versículo do Dia</h2>
        <button 
          onClick={() => fetchVerse(true)} 
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
        <p className="text-center text-red-500 p-4">{error}</p>
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