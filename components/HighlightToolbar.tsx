import React from 'react';
import { SelectionState, HighlightColor } from '../types';

interface HighlightToolbarProps {
  selection: SelectionState | null;
  onHighlight: (color: HighlightColor) => void;
  onClose: () => void;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({ selection, onHighlight, onClose }) => {
  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];
  
  const colorClasses: Record<HighlightColor, string> = {
    yellow: 'bg-yellow-400 hover:ring-yellow-500',
    green: 'bg-green-400 hover:ring-green-500',
    blue: 'bg-blue-400 hover:ring-blue-500',
    pink: 'bg-pink-400 hover:ring-pink-500',
  };

  if (!selection || !selection.rect) return null;

  const style = {
    top: `${selection.rect.bottom + window.scrollY + 8}px`,
    left: `${selection.rect.left + selection.rect.width / 2 + window.scrollX}px`,
  };

  const isOpen = selection !== null;

  return (
    <div
      className={`hidden md:flex absolute z-20 bg-popover shadow-lg rounded-full p-1 space-x-1 border border-border transition-opacity duration-150 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={style}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing text selection
    >
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onHighlight(color)}
          className={`w-7 h-7 rounded-full ${colorClasses[color]} transition-all hover:ring-2 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-popover`}
          aria-label={`Grifar com ${color}`}
        />
      ))}
    </div>
  );
};