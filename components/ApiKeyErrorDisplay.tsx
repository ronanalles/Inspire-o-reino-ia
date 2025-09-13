
import React from 'react';
import { IconKey } from './IconComponents';

interface ApiKeyErrorDisplayProps {
  context: string;
}

export const ApiKeyErrorDisplay: React.FC<ApiKeyErrorDisplayProps> = ({ context }) => (
  <div className="p-4 border-l-4 border-destructive bg-destructive/10 rounded-r-lg my-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <IconKey className="h-5 w-5 text-destructive flex-shrink-0" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <h3 className="text-md font-bold text-destructive">
          Configuração da Chave de API Necessária
        </h3>
        <div className="mt-2 text-sm text-destructive/80">
          <p>
            O recurso '{context}' está desativado. Para ativá-lo, por favor configure a variável de ambiente <code>VITE_API_KEY</code> em suas configurações de implantação (Vercel, Netlify, etc.).
          </p>
        </div>
      </div>
    </div>
  </div>
);
