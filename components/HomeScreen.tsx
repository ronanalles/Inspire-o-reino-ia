import React from 'react';
import { VerseOfTheDay } from './VerseOfTheDay';
import { IconLionLogo, IconChevronRight } from './IconComponents';
import { LastRead } from '../types';

interface HomeScreenProps {
  onContinueReading: () => void;
  onStartReading: () => void;
  lastRead: LastRead | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onContinueReading, onStartReading, lastRead }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 font-sans">
      <header className="text-center mb-8">
        <IconLionLogo className="w-20 h-20 mx-auto text-blue-500" />
        <h1 className="text-4xl font-bold mt-4">Inspire o Reino</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Seu companheiro diário de estudo da Palavra.</p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <VerseOfTheDay />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={onContinueReading}
                disabled={!lastRead}
                className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
            >
                <div>
                    <h2 className="font-bold text-lg text-left">Continuar Leitura</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                        {lastRead ? `${lastRead.bookName} ${lastRead.chapter}` : 'Nenhuma leitura recente'}
                    </p>
                </div>
                <IconChevronRight className="w-6 h-6 text-gray-400" />
            </button>
            <button 
                onClick={onStartReading}
                className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
                <div>
                    <h2 className="font-bold text-lg text-left">Explorar a Bíblia</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                        Navegue por todos os livros
                    </p>
                </div>
                <IconChevronRight className="w-6 h-6 text-gray-400" />
            </button>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Inspire o Reino. Todos os direitos reservados.</p>
        <p className="mt-2 opacity-75">
          Desenvolvido com <span role="img" aria-label="coração" className="text-red-500">❤</span> por Ronan Luiz
        </p>
      </footer>
    </div>
  );
};