
import React, { useState, useEffect, useCallback } from 'react';
import { getVerseOfTheDay, MissingApiKeyError } from '../services/geminiService';
import { VerseOfTheDay as VerseOfTheDayType, StoredVerseOfTheDay } from '../types';
import { IconSpinner, IconRefresh, IconChevronDown } from './IconComponents';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { books } from '../data/bibleData';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

export const VerseOfTheDay: React.FC = () => {
  const [storedVerse, setStoredVerse] = useLocalStorage<StoredVerseOfTheDay | null>('verse_of_the_day', null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [isReflectionExpanded, setIsReflectionExpanded] = useState(false);

  const fetchVerse = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setIsApiKeyError(false);
    setIsReflectionExpanded(false);
    const today = new Date().toDateString();

    if (!forceRefresh && storedVerse && storedVerse.date === today) {
        setIsLoading(false);
        return;
    }
    
    try {
      const randomBookIndex = Math.floor(Math.random() * books.length);
      const randomBook = books[randomBookIndex];
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
      const data = await getVerseOfTheDay(randomBook.name, randomChapter);

      if (data) {
        setStoredVerse({ verse: data, date: today });
      } else {
        setError('Não foi possível carregar o versículo do dia.');
        if (!storedVerse) {
          setStoredVerse(null);
        }
      }
    } catch (e) {
      if (e instanceof MissingApiKeyError) {
        setIsApiKeyError(true);
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
    fetchVerse();
  }, []);

  const verseData = storedVerse?.verse;

  return (
    <div className="bg-card/70 dark:bg-card/50 backdrop-blur-lg rounded-xl shadow-[var(--shadow-lg)] p-6 w-full border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-card-foreground">Versículo do Dia</h2>
        <button 
          onClick={() => fetchVerse(true)} 
          disabled={isLoading}
          className="p-2 rounded-full text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-wait transition-colors"
          aria-label="Gerar novo versículo"
        >
          <IconRefresh className={`w-5 h-5 flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <IconSpinner className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isApiKeyError ? (
        <ApiKeyErrorDisplay context="Versículo do Dia" />
      ) : error ? (
        <p className="text-center text-destructive p-4">{error}</p>
      ) : verseData ? (
        <div className="space-y-4">
          <div>
            <p className="text-lg text-foreground/90 italic">"{verseData.text}"</p>
            <p className="text-right font-semibold text-primary mt-2">{verseData.reference}</p>
          </div>
          <div className="border-t border-border pt-4">
            <button
                onClick={() => setIsReflectionExpanded(!isReflectionExpanded)}
                className="flex justify-between items-center w-full text-left font-semibold text-muted-foreground hover:text-foreground transition-colors"
                aria-expanded={isReflectionExpanded}
            >
                <span>Reflexão</span>
                <IconChevronDown className={`w-5 h-5 transition-transform duration-300 ${isReflectionExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isReflectionExpanded ? 'max-h-96 mt-2 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}
            >
                <p className="text-muted-foreground pt-2 leading-relaxed">{verseData.reflection}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
