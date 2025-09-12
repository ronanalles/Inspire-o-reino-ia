import React from 'react';
import { CrossReferenceItem } from '../types';
import { IconX, IconLink, IconSparkles } from './IconComponents';

interface CrossReferencePanelProps {
  item: CrossReferenceItem | null;
  onClose: () => void;
  onNavigateToVerse: (book: string, chapter: number) => void;
}

export const CrossReferencePanel: React.FC<CrossReferencePanelProps> = ({ item, onClose, onNavigateToVerse }) => {
  const isOpen = item !== null;

  const handleNavigate = (book: string, chapter: number) => {
    onNavigateToVerse(book, chapter);
    onClose();
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-xl transform transition-transform z-40 border-l border-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-live="polite"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold flex items-center">
              <IconSparkles className="mr-2 text-primary" />
              Estudo Aprofundado
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground" aria-label="Fechar painel de estudo">
              <IconX className="w-6 h-6" />
            </button>
          </div>

          {item ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-2xl font-bold text-foreground">{item.term}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{item.explanation}</p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-card-foreground mb-3">Referências Cruzadas</h4>
                <ul className="space-y-2">
                  {item.crossReferences.map((ref, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => handleNavigate(ref.book, ref.chapter)}
                        className="text-primary hover:underline text-left"
                      >
                        {ref.reference}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {item.articles && item.articles.length > 0 && (
                <section>
                  <h4 className="text-lg font-semibold text-card-foreground mb-3">Artigos para Estudo</h4>
                  <ul className="space-y-2">
                    {item.articles.map((article, index) => (
                      <li key={index}>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
                        >
                          <IconLink className="w-4 h-4 mr-2" />
                          {article.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Selecione um termo para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};