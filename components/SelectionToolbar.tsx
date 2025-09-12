import React from 'react';
import { SelectionState, HighlightColor } from '../types';
import { IconX } from './IconComponents';

interface SelectionToolbarProps {
  selection: SelectionState | null;
  onHighlight: (color: HighlightColor) => void;
  onClose: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ selection, onHighlight, onClose }) => {
  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];
  
  const colorClasses: Record<HighlightColor, string> = {
    yellow: 'bg-yellow-400 hover:ring-yellow-500',
    green: 'bg-green-400 hover:ring-green-500',
    blue: 'bg-blue-400 hover:ring-blue-500',
    pink: 'bg-pink-400 hover:ring-pink-500',
  };

  const isOpen = selection !== null;

  return (
    <div className={`fixed bottom-0 inset-x-0 z-20 md:hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-card border-t border-border p-2 shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground ml-2">Grifar:</span>
                <div className="flex space-x-2">
                    {colors.map((color) => (
                        <button
                        key={color}
                        onClick={() => onHighlight(color)}
                        className={`w-7 h-7 rounded-full ${colorClasses[color]} transition-all hover:ring-2 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-card`}
                        aria-label={`Grifar com ${color}`}
                        />
                    ))}
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
                <IconX className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
};