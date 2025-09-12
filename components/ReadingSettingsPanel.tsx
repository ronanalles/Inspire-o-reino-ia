import React, { useEffect, useState } from 'react';
import { ReadingSettings, FontSize, LineHeight, FontFamily } from '../types';
import { IconX } from './IconComponents';

interface ReadingSettingsPanelProps {
  isOpen: boolean;
  settings: ReadingSettings;
  onSettingsChange: (newSettings: ReadingSettings) => void;
  onClose: () => void;
}

export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({ isOpen, settings, onSettingsChange, onClose }) => {
  const [animationClass, setAnimationClass] = useState({ backdrop: 'opacity-0', panel: 'translate-y-full md:scale-95 md:opacity-0' });

  useEffect(() => {
    if (isOpen) {
        const timer = setTimeout(() => {
            setAnimationClass({ backdrop: 'opacity-100', panel: 'translate-y-0 md:scale-100 md:opacity-100' });
        }, 10);
        return () => clearTimeout(timer);
    } else {
        setAnimationClass({ backdrop: 'opacity-0', panel: 'translate-y-full md:scale-95 md:opacity-0' });
    }
  }, [isOpen]);

  if (!isOpen && animationClass.backdrop === 'opacity-0') return null;


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
    { label: 'Moderna', value: 'sans' },
    { label: 'Clássica', value: 'serif' },
  ];
  
  const handleSettingChange = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center transition-opacity duration-300 ease-in-out ${animationClass.backdrop}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-card w-full rounded-t-2xl md:rounded-xl md:w-auto md:min-w-80 p-4 transform transition-all duration-300 ease-in-out shadow-[var(--shadow-xl)] ${animationClass.panel}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-card-foreground">Opções de Leitura</h3>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-accent text-muted-foreground">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Fonte</label>
                <div className="grid grid-cols-2 gap-2">
                    {fontFamilies.map(family => (
                        <button
                            key={family.value}
                            onClick={() => handleSettingChange('fontFamily', family.value)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${settings.fontFamily === family.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-accent border-border'}`}
                        >
                            {family.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Tamanho do Texto</label>
                <div className="grid grid-cols-4 gap-2">
                    {fontSizes.map(size => (
                        <button
                            key={size.value}
                            onClick={() => handleSettingChange('fontSize', size.value)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${settings.fontSize === size.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-accent border-border'}`}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Espaçamento</label>
                <div className="grid grid-cols-3 gap-2">
                    {lineHeights.map(height => (
                        <button
                            key={height.value}
                            onClick={() => handleSettingChange('lineHeight', height.value)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${settings.lineHeight === height.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-accent border-border'}`}
                        >
                            {height.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};