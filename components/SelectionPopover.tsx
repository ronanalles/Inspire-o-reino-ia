import React, { useState } from 'react';
import { IconBrain, IconSparkles, IconSearch, IconCopy, IconCheck } from './IconComponents';
import { SelectionState } from '../types';

type PopoverAction = 'explain' | 'crossRef' | 'search' | 'copy';

interface SelectionPopoverProps {
  selectionState: SelectionState;
  onAction: (action: PopoverAction, text: string) => void;
  onClose: () => void;
}

export const SelectionPopover: React.FC<SelectionPopoverProps> = ({ selectionState, onAction, onClose }) => {
  const { rect, text } = selectionState;
  const [isCopied, setIsCopied] = useState(false);

  if (!rect) return null;

  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.top - 55}px`, // Position above the selection with some margin
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%)',
    zIndex: 30,
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
        setIsCopied(false);
        onClose(); // Close popover after copy animation
    }, 1500);
  }

  const handleAction = (action: PopoverAction) => {
    if (action === 'copy') {
      handleCopy();
    } else {
      // Type assertion because 'copy' is handled separately
      onAction(action as 'explain' | 'crossRef' | 'search', text);
    }
  }

  // Hide popover if it would be off-screen at the top
  if (rect.top < 60) {
    return null;
  }

  return (
    <div
      style={popoverStyle}
      className="bg-card shadow-[var(--shadow-lg)] rounded-full flex p-1.5 space-x-1 border border-border selection-popover"
      onMouseUp={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
        <ActionButton icon={IconBrain} onClick={() => handleAction('explain')} label="Explicar" />
        <ActionButton icon={IconSparkles} onClick={() => handleAction('crossRef')} label="Referências" />
        <ActionButton icon={IconSearch} onClick={() => handleAction('search')} label="Buscar" />
        <ActionButton 
          icon={isCopied ? IconCheck : IconCopy} 
          onClick={() => handleAction('copy')} 
          label={isCopied ? 'Copiado!' : 'Copiar'}
          className={isCopied ? 'text-green-500' : ''}
        />
    </div>
  );
};

const ActionButton = ({ icon: Icon, onClick, label, className = '' }: { icon: React.ElementType, onClick: () => void, label: string, className?: string }) => (
    <button 
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-primary transition-colors ${className}`}
      aria-label={label}
    >
        <Icon className="w-5 h-5" />
    </button>
);