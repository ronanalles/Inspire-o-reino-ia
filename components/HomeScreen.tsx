import React from 'react';
import { VerseOfTheDay } from './VerseOfTheDay';
import { IconAppLogo, IconBookOpen, IconSun, IconMoon } from './IconComponents';
import { LastRead, Theme } from '../types';

interface HomeScreenProps {
  onContinueReading: () => void;
  onStartReading: () => void;
  lastRead: LastRead | null;
  theme: Theme;
  onToggleTheme: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onContinueReading, onStartReading, lastRead, theme, onToggleTheme }) => {
  return (
    <div className="relative flex flex-col h-full bg-background text-foreground p-4 font-sans">
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(59,130,246,0.15)_0%,_rgba(255,255,255,0)_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(37,99,235,0.2)_0%,_rgba(0,0,0,0)_100%)]"></div>
      </div>
      
      <div className="fixed top-4 right-4 z-10">
        <button 
          onClick={onToggleTheme} 
          className="p-2 rounded-full bg-card/50 backdrop-blur-sm text-muted-foreground hover:bg-accent"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <IconSun className="w-6 h-6" /> : <IconMoon className="w-6 h-6" />}
        </button>
      </div>
      
      <header className="text-center pt-8 sm:pt-12 flex-shrink-0">
        <IconAppLogo className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-4xl sm:text-5xl font-bold mt-4 text-foreground">Inspire o Reino</h1>
        <p className="text-lg text-muted-foreground mt-2">Seu companheiro diário de estudo da Palavra.</p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        <div className="w-full flex flex-col items-center space-y-4">
            <button 
                onClick={onStartReading}
                className="group flex items-center justify-center w-full p-5 bg-primary text-primary-foreground rounded-xl shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 ease-in-out border border-primary/20"
            >
                <IconBookOpen className="w-6 h-6 mr-3" />
                <span className="font-bold text-lg">Ler a Bíblia</span>
            </button>
            
            {lastRead && (
                 <button 
                    onClick={onContinueReading}
                    className="text-primary hover:underline text-sm font-medium transition-colors"
                >
                    Continuar lendo: {lastRead.bookName} {lastRead.chapter}
                </button>
            )}
        </div>
      </main>
      
      <footer className="w-full max-w-2xl mx-auto pb-4 flex-shrink-0">
        <VerseOfTheDay />
      </footer>
    </div>
  );
};