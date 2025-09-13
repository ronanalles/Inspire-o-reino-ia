import React from 'react';
import { IconSparkles, IconBrain, IconFeather, IconChevronRight } from './IconComponents';
import { ModalType } from '../types';

interface ToolsScreenProps {
  onOpenModal: (modal: ModalType) => void;
}

const ToolsScreen: React.FC<ToolsScreenProps> = ({
  onOpenModal,
}) => {
  const tools = [
    {
      title: 'Estudo Temático',
      description: 'Explore temas específicos através das Escrituras com a ajuda da IA.',
      icon: IconSparkles,
      onClick: () => onOpenModal('thematic'),
      color: 'text-emerald-500',
    },
    {
      title: 'Quiz Bíblico',
      description: 'Teste seus conhecimentos com perguntas desafiadoras geradas por IA.',
      icon: IconBrain,
      onClick: () => onOpenModal('quiz'),
      color: 'text-purple-500',
    },
    {
      title: 'Assistente de Estudo',
      description: 'Converse com uma IA para tirar dúvidas e aprofundar seu entendimento.',
      icon: IconFeather,
      onClick: () => onOpenModal('aiBuddy'),
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
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.title}
              onClick={tool.onClick}
              className="group flex flex-col justify-between text-left p-6 bg-card rounded-xl shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 ease-in-out border border-border"
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