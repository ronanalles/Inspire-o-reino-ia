import React, { useState } from 'react';
import { IconPlus, IconX, IconSparkles, IconBrain, IconFeather } from './IconComponents';

interface FloatingActionButtonsProps {
  onThematicStudyClick: () => void;
  onQuizClick: () => void;
  onAiBuddyClick: () => void;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onThematicStudyClick,
  onQuizClick,
  onAiBuddyClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'Assistente', icon: IconFeather, onClick: onAiBuddyClick, bg: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Quiz', icon: IconBrain, onClick: onQuizClick, bg: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Estudo Temático', icon: IconSparkles, onClick: onThematicStudyClick, bg: 'bg-green-600 hover:bg-green-700' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center">
      <div className={`flex flex-col items-center space-y-3 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
           <div key={index} className="flex items-center group">
             <span className="mr-3 px-3 py-1.5 bg-white dark:bg-gray-700 text-sm font-semibold rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.label}
             </span>
            <button
              onClick={() => { action.onClick(); setIsOpen(false); }}
              className={`${action.bg} text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-110`}
              aria-label={action.label}
            >
              <action.icon className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 mt-4"
        aria-label={isOpen ? "Fechar menu de ferramentas" : "Abrir menu de ferramentas"}
      >
        <div className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <IconPlus className="w-7 h-7" />
        </div>
      </button>
    </div>
  );
};