
import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion } from '../types';
import { generateQuizQuestion, MissingApiKeyError } from '../services/geminiService';
import { IconX, IconSpinner, IconBrain } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

interface BibleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const BibleQuiz: React.FC<BibleQuizProps> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [animationClass, setAnimationClass] = useState({ backdrop: 'opacity-0', modal: 'opacity-0 scale-95' });

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimationClass({ backdrop: 'opacity-100', modal: 'opacity-100 scale-100' });
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationClass({ backdrop: 'opacity-0', modal: 'opacity-0 scale-95' });
    }
  }, [isOpen]);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(null);
    setError(null);
    setIsApiKeyError(false);
    try {
      const q = await generateQuizQuestion();
      if (q) {
        setQuestion(q);
      } else {
        setError("Não foi possível carregar a pergunta. Tente novamente.");
      }
    } catch (e) {
      if (e instanceof MissingApiKeyError) {
        setIsApiKeyError(true);
      } else {
        setError("Ocorreu um erro ao carregar o Quiz. Tente novamente mais tarde.");
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScore(0);
      fetchQuestion();
    }
  }, [isOpen, fetchQuestion]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === question?.correctAnswerIndex;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    }
  };
  
  if (!isOpen) return null;

  const getButtonClass = (index: number) => {
      if (selectedAnswer === null) {
          return 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600';
      }
      if (index === question?.correctAnswerIndex) {
          return 'bg-green-500 text-white';
      }
      if (index === selectedAnswer && !isCorrect) {
          return 'bg-red-500 text-white';
      }
      return 'bg-white dark:bg-gray-700 opacity-60';
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${animationClass.backdrop}`}>
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] transform transition-all duration-300 ease-in-out ${animationClass.modal}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
            <IconBrain className="mr-2 text-blue-500" />
            Quiz Bíblico
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <IconX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <IconSpinner className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          ) : isApiKeyError ? (
            <ApiKeyErrorDisplay context="Quiz Bíblico" />
          ) : error ? (
            <p className="text-center text-red-500 p-4">{error}</p>
          ) : question ? (
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">{question.question}</p>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 ${getButtonClass(index)}`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null }
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex items-center justify-between">
            <div className="font-bold text-lg text-gray-700 dark:text-gray-200">
                Pontuação: <span className="text-blue-600 dark:text-blue-400">{score}</span>
            </div>
            {selectedAnswer !== null && (
                <button
                    onClick={fetchQuestion}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Próxima Pergunta
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BibleQuiz;