import React, { useState, useEffect } from 'react';
import { SelectionState } from '../types';
import { IconX, IconSparkles, IconBrain, IconSearch, IconCopy, IconCheck } from './IconComponents';

interface SelectionActionPanelProps {
  selection: SelectionState | null;
  onClose: () => void;
  onExplain: (text: string) => void;
  onCrossRef: (text: string) => void;
  onSearch: (text: string) => void;
}

export const SelectionActionPanel: React.FC<SelectionActionPanelProps> = ({ selection, onClose, onExplain, onCrossRef, onSearch }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isOpen = selection !== null;

  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (selection) {
      navigator.clipboard.writeText(selection.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const ActionButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors w-20">
        <Icon className="w-6 h-6" />
        <span className="text-xs text-center">{label}</span>
    </button>
  );

  return (
    <div className={`fixed bottom-0 inset-x-0 z-20 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-card border-t border-border p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-start max-w-4xl mx-auto">
                <div className="flex-1 pr-4">
                    <p className="text-sm text-muted-foreground italic line-clamp-2">
                        {selection?.text}
                    </p>
                </div>
                <div className="flex items-center flex-wrap gap-1">
                   <ActionButton icon={IconBrain} label="Explicar" onClick={() => selection && onExplain(selection.text)} />
                   <ActionButton icon={IconSparkles} label="Referências" onClick={() => selection && onCrossRef(selection.text)} />
                   <ActionButton icon={IconSearch} label="Buscar" onClick={() => selection && onSearch(selection.text)} />
                   
                   <button onClick={handleCopy} className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors w-20">
                        {isCopied ? <IconCheck className="w-6 h-6 text-green-500" /> : <IconCopy className="w-6 h-6" />}
                        <span className="text-xs text-center">{isCopied ? 'Copiado!' : 'Copiar'}</span>
                   </button>
                </div>
                 <button onClick={onClose} className="p-2 -mt-1 -mr-1 rounded-full hover:bg-accent text-muted-foreground self-start ml-2">
                    <IconX className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};