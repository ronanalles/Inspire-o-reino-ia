
import React, { useState, useEffect } from 'react';
import { IconSparkles, IconBrain, IconChevronRight, IconX } from './IconComponents';
import { ModalType } from '../types';

const ThematicStudy = React.lazy(() => import('./ThematicStudy'));
const BibleQuiz = React.lazy(() => import('./BibleQuiz'));

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose, onNavigateToVerse }) => {
  const [activeTool, setActiveTool] = useState<ModalType | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveTool(null);
    }
  }, [isOpen]);

  const handleOpenTool = (tool: ModalType) => {
    setActiveTool(tool);
  };
  
  const handleCloseTool = () => {
      setActiveTool(null);
  }

  if (!isOpen) return null;

  if (activeTool === 'thematic') {
      return <ThematicStudy isOpen={true} onClose={handleCloseTool} onNavigateToVerse={onNavigateToVerse} />;
  }
  
  if (activeTool === 'quiz') {
      return <BibleQuiz isOpen={true} onClose={handleCloseTool} />;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4`} onClick={onClose}>
      <div className={`bg-card rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-card-foreground">Ferramentas de Estudo</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-accent text-muted-foreground">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <ToolButton 
            title="Estudo Temático" 
            description="Explore temas específicos." 
            icon={IconSparkles} 
            onClick={() => handleOpenTool('thematic')}
            color="text-emerald-500"
          />
          <ToolButton 
            title="Quiz Bíblico" 
            description="Teste seus conhecimentos." 
            icon={IconBrain} 
            onClick={() => handleOpenTool('quiz')}
            color="text-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

interface ToolButtonProps {
    title: string;
    description: string;
    icon: React.FC<any>;
    onClick: () => void;
    color: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ title, description, icon: Icon, onClick, color }) => (
    <button onClick={onClick} className="w-full group flex items-center text-left p-4 bg-card hover:bg-accent rounded-lg transition-colors border border-border">
        <div className={`mr-4 p-2 bg-muted rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-card-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <IconChevronRight className="w-5 h-5 text-muted-foreground transform transition-transform group-hover:translate-x-1" />
    </button>
);


export default ToolsModal;
