
import React from 'react';
import { IconKey } from './IconComponents';

interface ApiKeyErrorDisplayProps {
  context: string;
}

export const ApiKeyErrorDisplay: React.FC<ApiKeyErrorDisplayProps> = ({ context }) => (
  <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-lg my-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <IconKey className="h-6 w-6 text-red-500" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <h3 className="text-md font-bold text-red-800 dark:text-red-300">
          Configuração da Chave de API Necessária
        </h3>
        <div className="mt-2 text-sm text-red-700 dark:text-red-400">
          <p>
            O recurso '{context}' está desativado. Para ativá-lo, por favor configure a variável de ambiente <code>API_KEY</code> em suas configurações de implantação (Vercel, Netlify, etc.).
          </p>
        </div>
      </div>
    </div>
  </div>
);
