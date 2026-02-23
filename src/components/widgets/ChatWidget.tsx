import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { APP_CONTEXT } from '../../lib/appContext';
import { sanitizeHTML, sanitizeText } from '../../lib/inputSanitization';
import DOMPurify from 'dompurify';

interface Message {
  text: string;
  type: 'user' | 'agent';
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: sanitizeHTML('Hello! I am Luna.<br>How can I help you today?'), type: 'agent' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);

  // Generate stars on mount
  useEffect(() => {
    if (!isOpen || !starsContainerRef.current) return;

    const starsContainer = starsContainerRef.current;
    const numberOfStars = 100;
    const sunRadius = 125; // Half of the sun's 250px width/height
    const minStarRadius = sunRadius + 15;
    const maxStarRadius = sunRadius + 120;

    // Clear existing stars
    starsContainer.innerHTML = '';

    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';

      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Random position in a circle around the sun's center
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * (maxStarRadius - minStarRadius) + minStarRadius;
      const xOffset = radius * Math.cos(angle);
      const yOffset = radius * Math.sin(angle);

      star.style.left = `calc(50% + ${xOffset}px)`;
      star.style.top = `calc(50% + ${yOffset}px)`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      star.style.animationDelay = `${Math.random() * 3}s`;

      starsContainer.appendChild(star);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (chatWidgetRef.current && !chatWidgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async () => {
    const messageText = inputValue.trim();
    if (!messageText || isThinking) return;

    // Add user message (sanitize to prevent XSS)
    setMessages(prev => [...prev, { text: sanitizeText(messageText), type: 'user' }]);
    setInputValue('');
    setIsThinking(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Please log in to use the chat widget');
      }

      // Prepare system message
      const systemMessage = `You are Luna, the AI support agent for SkillHoop. Keep answers brief and helpful. Use the following context to answer user questions about the app features and pricing. If you don't know something, tell them to check Settings -> Support.\n\n${APP_CONTEXT}`;

      // Call the API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageText,
          systemMessage: systemMessage,
          model: 'gpt-4o-mini',
          userId: user.id,
          feature_name: 'chat_widget',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add agent response (sanitize HTML to allow safe formatting)
      setMessages(prev => [...prev, { 
        text: sanitizeHTML(data.content || 'I apologize, but I couldn\'t generate a response. Please try again or contact support.'), 
        type: 'agent' 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred. Please try again or contact support via Settings -> Support.';
      
      setMessages(prev => [...prev, { 
        text: sanitizeText(`Sorry, I encountered an error: ${errorMessage}`), 
        type: 'agent' 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-slate-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-slate-700 transition-colors z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div 
          ref={chatWidgetRef}
          id="chat-widget" 
          className="fixed bottom-28 right-8 w-full max-w-sm h-full max-h-[600px] rounded-2xl shadow-lg z-50 flex flex-col overflow-hidden backdrop-blur-xl border border-white/30 dark:border-slate-700"
        >
          {/* Header with Close Button */}
          <div className="relative flex-shrink-0 p-4 border-b border-white/30 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chat with Luna</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesRef}
            id="chat-messages" 
            className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar flex flex-col relative"
          >
            {/* Stars Container */}
            <div ref={starsContainerRef} id="stars-container" className="absolute top-0 left-0 w-full h-full overflow-hidden z-[1]"></div>
            
            {/* Sun Animation */}
            <div className="section-banner-sun"></div>

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.type}-message p-3 rounded-lg max-w-[80%] ${
                  message.type === 'user' 
                    ? 'user-message self-end' 
                    : 'agent-message self-start'
                }`}
                style={{ position: 'relative', zIndex: 5 }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }}
              />
            ))}
            
            {/* Thinking Indicator */}
            {isThinking && (
              <div
                className="chat-message agent-message self-start p-3 rounded-lg max-w-[80%]"
                style={{ position: 'relative', zIndex: 5 }}
              >
                <div className="flex items-center gap-2">
                  <span>Thinking</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 flex-shrink-0 border-t border-white/30 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full h-10 px-3 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all duration-300 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isThinking || !inputValue.trim()}
                className="w-10 h-10 bg-slate-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

