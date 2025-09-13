
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

export type Theme = 'light' | 'dark';

export type ModalType = 'search' | 'nav' | 'settings' | 'bookmarks' | 'tools' | 'quiz' | 'thematic';

export interface StudyVerseState {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
// FIX: Added 'tight' to LineHeight to support more spacing options and resolve the type error in ReadingSettingsPanel.
export type LineHeight = 'tight' | 'normal' | 'loose';
export type FontFamily = 'sans' | 'serif';

export interface ReadingSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
  fontFamily: FontFamily;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type NavAction = 'home' | 'reading' | 'search' | 'bookmarks' | 'thematic';
