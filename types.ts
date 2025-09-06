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
