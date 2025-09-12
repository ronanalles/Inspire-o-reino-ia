import React from 'react';
import { ReadingSettings, FontSize, LineHeight, FontFamily } from '../types';

interface ReadingSettingsPanelProps {
  isOpen: boolean;
  settings: ReadingSettings;
  onSettingsChange: (newSettings: ReadingSettings) => void;
}

export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({ isOpen, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const fontSizes: { label: string; value: FontSize }[] = [
    { label: 'P', value: 'sm' },
    { label: 'M', value: 'base' },
    { label: 'G', value: 'lg' },
    { label: 'XG', value: 'xl' },
  ];
  
  const lineHeights: { label: string; value: LineHeight }[] = [
    { label: 'P', value: 'tight' },
    { label: 'M', value: 'normal' },
    { label: 'G', value: 'loose' },
  ];

  const fontFamilies: { label: string; value: FontFamily }[] = [
    { label: 'Sans', value: 'sans' },
    { label: 'Serif', value: 'serif' },
  ];
  
  const handleSettingChange = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-popover rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 border border-border p-4">
      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-popover-foreground mb-2">Fonte</label>
            <div className="grid grid-cols-2 gap-2">
                {fontFamilies.map(family => (
                    <button
                        key={family.value}
                        onClick={() => handleSettingChange('fontFamily', family.value)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${settings.fontFamily === family.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-accent border-border'}`}
                    >
                        {family.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-popover-foreground mb-2">Tamanho do Texto</label>
            <div className="grid grid-cols-4 gap-2">
                {fontSizes.map(size => (
                    <button
                        key={size.value}
                        onClick={() => handleSettingChange('fontSize', size.value)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${settings.fontSize === size.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-accent border-border'}`}
                    >
                        {size.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-popover-foreground mb-2">Espaçamento</label>
             <div className="grid grid-cols-3 gap-2">
                {lineHeights.map(height => (
                    <button
                        key={height.value}
                        onClick={() => handleSettingChange('lineHeight', height.value)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${settings.lineHeight === height.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-accent border-border'}`}
                    >
                        {height.label}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
