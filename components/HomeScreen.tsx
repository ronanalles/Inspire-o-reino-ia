import React from 'react';
import { VerseOfTheDay } from './VerseOfTheDay';
import { IconAppLogo, IconChevronRight, IconSun, IconMoon } from './IconComponents';
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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 font-sans overflow-hidden">
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
      
      <header className="text-center mb-10">
        <IconAppLogo className="w-20 h-20 mx-auto text-primary" />
        <h1 className="text-4xl sm:text-5xl font-bold mt-4 text-foreground">Inspire o Reino</h1>
        <p className="text-lg text-muted-foreground mt-2">Seu companheiro diário de estudo da Palavra.</p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <VerseOfTheDay />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
                onClick={onContinueReading}
                disabled={!lastRead}
                className="group flex items-center justify-between w-full p-6 bg-card rounded-xl shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-border"
            >
                <div>
                    <h2 className="font-bold text-lg text-left text-primary">Continuar Leitura</h2>
                    <p className="text-sm text-muted-foreground text-left">
                        {lastRead ? `${lastRead.bookName} ${lastRead.chapter}` : 'Nenhuma leitura recente'}
                    </p>
                </div>
                <IconChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button 
                onClick={onStartReading}
                className="group flex items-center justify-between w-full p-6 bg-card rounded-xl shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 ease-in-out border border-border"
            >
                <div>
                    <h2 className="font-bold text-lg text-left text-emerald-600 dark:text-emerald-400">Explorar a Bíblia</h2>
                    <p className="text-sm text-muted-foreground text-left">
                        Navegue por todos os livros
                    </p>
                </div>
                <IconChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </button>
        </div>
      </main>
    </div>
  );
};