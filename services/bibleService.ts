import { BibleChapterResponse } from '../types';
import { Translation } from '../App';

const API_BASE_URL = 'https://bible-api.com';

const translationApiMap: Record<Translation, string> = {
    acf: 'almeida',
    nvi: 'nvi',
    kjv: 'kjv'
};

export const getChapterText = async (book: string, chapter: number, version: Translation = 'acf'): Promise<BibleChapterResponse | null> => {
  try {
    const apiVersion = translationApiMap[version] || 'almeida';
    // A API lida bem com nomes de livros em português, mas remover acentos pode ajudar na compatibilidade.
    const bookQuery = book.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(bookQuery)}+${chapter}?translation=${apiVersion}&verse_numbers=true`);
    
    if (!response.ok) {
      console.error('Bible API request failed:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return null;
    }
    const data = await response.json();
    return data as BibleChapterResponse;
  } catch (error) {
    console.error('Error fetching chapter text:', error);
    return null;
  }
};