
"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { chat, type ChatInput, type ChatOutput } from '@/ai/flows/chatbot-flow';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'model', text: 'Hello! I am SmartBot. How can I help you today?' }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { history: [...messages, newUserMessage] };
      const { response } = await chat(chatInput);
      const botMessage: ChatMessage = { role: 'model', text: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I am having some trouble right now.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-28 right-6 z-40 sm:bottom-28 sm:right-8">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-lg hover:scale-105 transition-transform flex items-center justify-center bg-accent hover:bg-accent/90"
        >
          {isOpen ? <X className="h-7 w-7 sm:h-8 sm:w-8" /> : <Bot className="h-7 w-7 sm:h-8 sm:w-8" />}
          <span className="sr-only">Toggle Chatbot</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-48 right-6 sm:right-8 z-40 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[500px] bg-card border rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-in-out">
          <header className="p-4 border-b flex items-center gap-3">
             <Bot className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg font-headline">SmartBot Assistant</h3>
          </header>
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-end gap-2", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                    <div
                    className={cn(
                        'rounded-lg px-3 py-2 max-w-[80%] break-words text-sm',
                        message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                    >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <footer className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                autoComplete="off"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
}
