import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion } from '../types';
import { generateQuizQuestion } from '../services/geminiService';
import { IconX, IconSpinner, IconBrain } from './IconComponents';

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

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    const q = await generateQuizQuestion();
    setQuestion(q);
    setIsLoading(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
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
          ) : (
            <p className="text-center text-red-500">Não foi possível carregar a pergunta. Tente novamente.</p>
          )}
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