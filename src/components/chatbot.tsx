'use client';
      
      import { useState, useRef, useEffect } from 'react';
      import { usePathname } from 'next/navigation';
      import { Button } from '@/components/ui/button';
      import { Input } from '@/components/ui/input';
      import { ScrollArea } from '@/components/ui/scroll-area';
      import { BotIcon, UserIcon } from '@/components/ui/icons';
      import { generateResponseWithContext } from '@/ai/chatbot/chat';
      import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
      
      interface Message {
        role: 'user' | 'assistant';
        content: string;
      }
      
      export function Chatbot() {
        const [messages, setMessages] = useState<Message[]>([]);
        const [input, setInput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const pathname = usePathname();
        const scrollAreaRef = useRef<HTMLDivElement>(null);
      
        const handleSend = async () => {
          if (input.trim() === '') return;
      
          const userMessage: Message = { role: 'user', content: input };
          const newMessages = [...messages, userMessage];
          setMessages(newMessages);
          setInput('');
          setIsLoading(true);
      
          try {
            const response = await generateResponseWithContext({ userInput: input, conversationHistory: newMessages });
            const botMessage: Message = { role: 'assistant', content: response.response };
            setMessages((prev) => [...prev, botMessage]);
          } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage: Message = {
              role: 'assistant',
              content: "I'm having trouble connecting right now. Please try again in a moment.",
            };
            setMessages((prev) => [...prev, errorMessage]);
          } finally {
            setIsLoading(false);
          }
        };
      
        useEffect(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
          }
        }, [messages]);

        const formatResponse = (text: string) => {
          const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          const withLineBreaks = boldedText.replace(/\n/g, '<br />');
          const withLinks = withLineBreaks.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
          return withLinks;
        };
      
        return (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg">
                <BotIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Artisan Assistant</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col py-4">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-6">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && <BotIcon className="h-6 w-6 flex-shrink-0" />}
                        <div className={`max-w-xs rounded-lg px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {msg.role === 'assistant' ? (
                            <div dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }} />
                          ) : (
                            msg.content
                          )}
                        </div>
                        {msg.role === 'user' && <UserIcon className="h-6 w-6 flex-shrink-0" />}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-4">
                        <BotIcon className="h-6 w-6 flex-shrink-0" />
                        <div className="max-w-xs rounded-lg bg-muted px-4 py-3">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about the site..."
                      disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        );
      }