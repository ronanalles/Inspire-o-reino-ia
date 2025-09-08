import React from 'react';
import { HighlightColor } from '../types';

interface HighlightPopoverProps {
  top: number;
  left: number;
  onSelectColor: (color: HighlightColor) => void;
}

export const HighlightPopover: React.FC<HighlightPopoverProps> = ({ top, left, onSelectColor }) => {
  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];
  
  const colorClasses: Record<HighlightColor, string> = {
    yellow: 'bg-yellow-300 hover:ring-yellow-400',
    green: 'bg-green-300 hover:ring-green-400',
    blue: 'bg-blue-300 hover:ring-blue-400',
    pink: 'bg-pink-300 hover:ring-pink-400',
  };

  return (
    <div
      className="highlight-popover absolute z-10 bg-white dark:bg-gray-700 shadow-lg rounded-full flex p-1 space-x-1 border border-gray-200 dark:border-gray-600"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)',
      }}
      // Prevent mouseup from closing the popover when a color is clicked
      onMouseUp={(e) => e.stopPropagation()} 
    >
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelectColor(color)}
          className={`w-6 h-6 rounded-full ${colorClasses[color]} transition-all hover:ring-2 focus:outline-none focus:ring-2`}
          aria-label={`Grifar com ${color}`}
        />
      ))}
    </div>
  );
};