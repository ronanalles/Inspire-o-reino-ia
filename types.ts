export interface Book {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface VerseType {
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface BibleChapterResponse {
    reference: string;
    verses: VerseType[];
    text: string;
    translation_id: string;
    translation_name: string;
    translation_note: string;
}

export interface Bookmark {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  note?: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor;
  // Note: For simplicity, this implementation re-highlights based on text search.
  // A more robust solution for academic use might use character offsets.
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface VerseOfTheDay {
  reference: string;
  text: string;
  reflection: string;
}

export interface ThematicStudyResult {
  summary: string;
  verses: {
    reference: string;
    book: string;
    chapter: number;
  }[];
}

export interface LastRead {
    bookName: string;
    chapter: number;
}

export interface SearchResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface CrossReferenceItem {
  term: string;
  explanation: string;
  crossReferences: {
    reference: string;
    book: string;
    chapter: number;
  }[];
  articles?: {
    title: string;
    url: string;
  }[];
}

export type ChapterCrossReferences = CrossReferenceItem[];