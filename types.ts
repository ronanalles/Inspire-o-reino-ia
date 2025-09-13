

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

// FIX: Add missing type CrossReferenceItem used in CrossReferencePanel.
export interface CrossReferenceItem {
  term: string;
  explanation: string;
  crossReferences: CrossReferenceResult[];
  articles?: {
    url: string;
    title: string;
  }[];
}

export type Theme = 'light' | 'dark';

export type ModalType = 'search' | 'nav' | 'settings' | 'bookmarks' | 'tools' | 'quiz' | 'thematic';

export interface StudyVerseState {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type LineHeight = 'tight' | 'normal' | 'loose';
export type FontFamily = 'sans' | 'serif';

export interface ReadingSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
  fontFamily: FontFamily;
}

// FIX: Add missing type HighlightColor used in HighlightPopover and SelectionToolbar.
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

// FIX: Add missing type SelectionState used in SelectionToolbar.
export interface SelectionState {
  text: string;
  top: number;
  left: number;
}
