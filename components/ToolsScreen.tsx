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
      color: 'text-emerald-500',
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
      color: 'text-primary',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Ferramentas de Estudo</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Recursos com Inteligência Artificial para enriquecer sua jornada na Palavra.
          </p>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.title}
              onClick={tool.onClick}
              className="group flex flex-col justify-between text-left p-6 bg-card rounded-xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-border"
            >
              <div>
                <div className="mb-4">
                  <tool.icon className={`w-10 h-10 ${tool.color}`} />
                </div>
                <h2 className="font-bold text-xl text-card-foreground mb-2">{tool.title}</h2>
                <p className="text-muted-foreground">{tool.description}</p>
              </div>
              <div className="flex items-center justify-end mt-6 text-sm font-semibold text-primary">
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