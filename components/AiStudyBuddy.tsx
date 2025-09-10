import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessageToChat, ApiKeyError } from '../services/geminiService';
import { ChatMessage } from '../types';
import { IconFeather, IconSend, IconX, IconSpinner } from './IconComponents';

interface AiStudyBuddyProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    book: string;
    chapter: number;
  };
}

const AiStudyBuddy: React.FC<AiStudyBuddyProps> = ({ isOpen, onClose, context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const setupChat = useCallback(() => {
    setMessages([
        {
            sender: 'ai',
            text: `Olá! Sou seu assistente de estudos. Como posso te ajudar a entender ${context.book} ${context.chapter}?`
        }
    ]);
    setIsFirstMessage(true);
  }, [context]);

  useEffect(() => {
    if(isOpen){
        setupChat();
    }
  }, [isOpen, context.book, context.chapter, setupChat]);


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = isFirstMessage ? [] : messages;
      const stream = await sendMessageToChat(input, context, chatHistory);
      setIsFirstMessage(false);
      let aiResponse = '';
      setMessages(prev => [...prev, { sender: 'ai', text: '' }]);
      
      for await (const chunk of stream) {
        aiResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = aiResponse;
          return newMessages;
        });
      }

    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage = error instanceof ApiKeyError
        ? "<b>Erro de Configuração:</b> A chave da API não foi encontrada. O assistente de estudo está indisponível."
        : "Desculpe, ocorreu um erro. Tente novamente.";
      setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 md:bottom-24 md:right-6 w-[calc(100%-2rem)] md:w-11/12 max-w-md h-[70vh] max-h-[600px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col z-40 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <div className="flex items-center space-x-2">
            <IconFeather className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Assistente de Estudo</h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <IconX className="w-6 h-6" />
        </button>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
               <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-2">
                    <IconSpinner className="w-5 h-5 animate-spin" />
                 </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-500 text-white p-2 rounded-lg disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
            <IconSend className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiStudyBuddy;