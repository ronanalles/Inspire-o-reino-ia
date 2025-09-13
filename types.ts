export type Translation = 'acf' | 'kjv';

export interface TranslationInfo {
  id: Translation;
  name: string;
  apiId: 'almeida' | 'kjv';
}

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

export type StoredVerseOfTheDay = {
  verse: VerseOfTheDay;
  date: string;
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

export interface CrossReferenceResult {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
}

// FIX: Add missing CrossReferenceItem type used by CrossReferencePanel.
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

export type Theme = 'light' | 'dark';

export type ModalType = 'search' | 'nav' | 'quiz' | 'thematic' | 'settings' | 'bookmarks' | 'aiBuddy';

export interface SelectionState {
  text: string;
  verseInfo: {
    book: string;
    chapter: number;
    verse: number;
  };
  rect?: DOMRect;
}

// FIX: Add missing HighlightColor type used by HighlightPopover and SelectionToolbar.
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type LineHeight = 'tight' | 'normal' | 'loose';
export type FontFamily = 'sans' | 'serif';

export interface ReadingSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
  fontFamily: FontFamily;
}