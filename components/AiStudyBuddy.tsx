import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessageToChat, MissingApiKeyError } from '../services/geminiService';
import { ChatMessage } from '../types';
import { IconFeather, IconSend, IconX, IconSpinner } from './IconComponents';
import { ApiKeyErrorDisplay } from './ApiKeyErrorDisplay';

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
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [animationClass, setAnimationClass] = useState({ backdrop: 'opacity-0', panel: 'opacity-0 scale-95' });

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimationClass({ backdrop: 'opacity-100', panel: 'opacity-100 scale-100' }), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationClass({ backdrop: 'opacity-0', panel: 'opacity-0 scale-95' });
    }
  }, [isOpen]);

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
    setIsApiKeyError(false);
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
    setIsApiKeyError(false);

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
      if (error instanceof MissingApiKeyError) {
        setIsApiKeyError(true);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "Desculpe, ocorreu um erro. Tente novamente." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && animationClass.backdrop === 'opacity-0') return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-in-out ${animationClass.backdrop}`}>
        <div className={`bg-card text-card-foreground rounded-none md:rounded-xl shadow-[var(--shadow-xl)] w-full h-full md:w-full md:max-w-lg md:h-auto md:max-h-[80vh] flex flex-col transform transition-all duration-300 ease-in-out border-none md:border border-border ${animationClass.panel}`}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 rounded-t-none md:rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <IconFeather className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-card-foreground">Assistente de Estudo</h3>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <IconX className="w-6 h-6" />
                </button>
            </div>

            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-secondary text-secondary-foreground rounded-xl px-4 py-2">
                            <IconSpinner className="w-5 h-5 animate-spin" />
                        </div>
                    </div>
                )}
                {isApiKeyError && <ApiKeyErrorDisplay context="Assistente de Estudo" />}
            </div>

            <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pergunte algo..."
                    className="flex-1 p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none bg-background text-foreground"
                    disabled={isLoading || isApiKeyError}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim() || isApiKeyError} className="bg-primary text-primary-foreground p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconSend className="w-6 h-6" />
                </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AiStudyBuddy;