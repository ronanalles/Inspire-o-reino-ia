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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 font-sans">
       <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 bg-[radial-gradient(theme(colors.gray.100)_1px,transparent_1px)] dark:bg-[radial-gradient(theme(colors.gray.800)_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="fixed top-4 right-4 z-10">
        <button 
          onClick={onToggleTheme} 
          className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <IconSun className="w-6 h-6" /> : <IconMoon className="w-6 h-6" />}
        </button>
      </div>
      
      <header className="text-center mb-10">
        <IconAppLogo className="w-20 h-20 mx-auto text-blue-500" />
        <h1 className="text-4xl sm:text-5xl font-bold mt-4">Inspire o Reino</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Seu companheiro diário de estudo da Palavra.</p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <VerseOfTheDay />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
                onClick={onContinueReading}
                disabled={!lastRead}
                className="group flex items-center justify-between w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-gray-200 dark:border-gray-700"
            >
                <div>
                    <h2 className="font-bold text-lg text-left text-blue-600 dark:text-blue-400">Continuar Leitura</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                        {lastRead ? `${lastRead.bookName} ${lastRead.chapter}` : 'Nenhuma leitura recente'}
                    </p>
                </div>
                <IconChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
            <button 
                onClick={onStartReading}
                className="group flex items-center justify-between w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700"
            >
                <div>
                    <h2 className="font-bold text-lg text-left text-green-600 dark:text-green-400">Explorar a Bíblia</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                        Navegue por todos os livros
                    </p>
                </div>
                <IconChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
            </button>
        </div>
      </main>
    </div>
  );
};
