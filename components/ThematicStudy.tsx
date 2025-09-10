import React, { useState } from 'react';
import { getThematicStudy, ApiKeyError } from '../services/geminiService';
import { ThematicStudyResult } from '../types';
import { IconX, IconSpinner, IconSparkles } from './IconComponents';

interface ThematicStudyProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

const ThematicStudy: React.FC<ThematicStudyProps> = ({ isOpen, onClose, onNavigateToVerse }) => {
  const [theme, setTheme] = useState('');
  const [studyResult, setStudyResult] = useState<ThematicStudyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!theme.trim()) return;
    setIsLoading(true);
    setError(null);
    setStudyResult(null);

    try {
      const result = await getThematicStudy(theme);
      if (result) {
        setStudyResult(result);
      } else {
        setError('Não foi possível gerar o estudo. Tente um tema diferente ou verifique sua conexão.');
      }
    } catch (e) {
      if (e instanceof ApiKeyError) {
        setError("Erro de Configuração: A chave da API do Gemini não foi encontrada. O administrador precisa configurar a variável de ambiente.");
      } else {
        setError('Ocorreu um erro inesperado ao gerar o estudo. Tente novamente mais tarde.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setTheme('');
      setStudyResult(null);
      setError(null);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
            <IconSparkles className="mr-2 text-green-500" />
            Estudo Temático com IA
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <IconX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Digite um tema (ex: Fé, Perdão, Esperança)"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={isLoading}
                />
                <button onClick={handleSearch} disabled={isLoading || !theme.trim()} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed">
                    {isLoading ? <IconSpinner className="w-5 h-5 animate-spin" /> : 'Gerar'}
                </button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {!studyResult && !isLoading && !error && (
            <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Insira um tema para começar seu estudo bíblico personalizado.</p>
            </div>
          )}
          {isLoading && (
            <div className="flex justify-center items-center h-full">
                <IconSpinner className="w-12 h-12 animate-spin text-green-500" />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {studyResult && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Resumo sobre {theme}</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{studyResult.summary}</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Versículos Chave</h3>
                    <ul className="space-y-3">
                        {studyResult.verses.map((verse, index) => (
                            <li key={index} className="p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <button
                                 onClick={() => {
                                    onNavigateToVerse(verse.book, verse.chapter);
                                    handleClose();
                                 }}
                                 className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                                >
                                    {verse.reference}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThematicStudy;