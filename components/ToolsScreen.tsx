import React from 'react';
import { IconSparkles, IconBrain, IconFeather, IconChevronRight } from './IconComponents';

interface ToolsScreenProps {
  onThematicStudyClick: () => void;
  onQuizClick: () => void;
  onAiBuddyClick: () => void;
}

const ToolsScreen: React.FC<ToolsScreenProps> = ({
  onThematicStudyClick,
  onQuizClick,
  onAiBuddyClick,
}) => {
  const tools = [
    {
      title: 'Estudo Temático',
      description: 'Explore temas específicos através das Escrituras com a ajuda da IA.',
      icon: IconSparkles,
      onClick: onThematicStudyClick,
      color: 'text-green-500',
    },
    {
      title: 'Quiz Bíblico',
      description: 'Teste seus conhecimentos com perguntas desafiadoras geradas por IA.',
      icon: IconBrain,
      onClick: onQuizClick,
      color: 'text-purple-500',
    },
    {
      title: 'Assistente de Estudo',
      description: 'Converse com uma IA para tirar dúvidas e aprofundar seu entendimento.',
      icon: IconFeather,
      onClick: onAiBuddyClick,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">Ferramentas de Estudo</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Recursos com Inteligência Artificial para enriquecer sua jornada na Palavra.
          </p>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.title}
              onClick={tool.onClick}
              className="group flex flex-col justify-between text-left p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all border border-gray-200 dark:border-gray-700"
            >
              <div>
                <div className="flex items-center mb-4">
                  <tool.icon className={`w-8 h-8 mr-4 ${tool.color}`} />
                  <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200">{tool.title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
              </div>
              <div className="flex items-center justify-end mt-6 text-sm font-semibold text-blue-600 dark:text-blue-400">
                Acessar
                <IconChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ToolsScreen;
