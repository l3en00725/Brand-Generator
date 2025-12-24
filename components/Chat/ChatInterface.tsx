import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { Message, ChatStatus, BrandAssetData } from '../../types';
import { startNewSession, sendMessage, extractJsonFromResponse } from '../../services/geminiService';
import { INITIAL_MESSAGE } from '../../constants';
import MessageBubble from './MessageBubble';
import BrandCard from '../Brand/BrandCard';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);
  const [brandData, setBrandData] = useState<BrandAssetData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        await startNewSession();
        setMessages([{ role: 'model', text: INITIAL_MESSAGE }]);
      } catch (error) {
        console.error("Failed to start chat:", error);
        setStatus(ChatStatus.ERROR);
      }
    };
    initChat();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || status === ChatStatus.LOADING) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setStatus(ChatStatus.LOADING);

    try {
      const responseText = await sendMessage(userText);
      
      // Check for completion/JSON
      const generatedData = extractJsonFromResponse(responseText);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText, isJson: !!generatedData }]);
      
      if (generatedData) {
        setBrandData(generatedData);
        setStatus(ChatStatus.COMPLETE);
      } else {
        setStatus(ChatStatus.IDLE);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please try again." }]);
      setStatus(ChatStatus.IDLE); // Allow retry
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto min-h-[600px] relative z-10">
      
      {/* Chat Messages Area */}
      <div className="w-full flex-1 overflow-y-auto px-4 py-8 mb-4 max-h-[70vh] scrollbar-hide">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        
        {status === ChatStatus.LOADING && (
           <div className="flex w-full mb-6 justify-start animate-fade-in">
             <div className="flex max-w-[75%] gap-4">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                 <Sparkles size={16} className="text-white animate-pulse" />
               </div>
               <div className="flex items-center">
                  <div className="flex space-x-1.5 p-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
             </div>
           </div>
        )}

        {status === ChatStatus.ERROR && (
           <div className="flex justify-center my-4">
             <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
               <AlertCircle size={16} />
               <span>Connection failed. Please refresh.</span>
             </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Brand Result Card (Appears on Completion) */}
      {brandData && (
        <div className="w-full px-4 mb-20 animate-slide-up">
           <BrandCard data={brandData} />
        </div>
      )}

      {/* Input Area (Hidden if complete) */}
      {!brandData && (
        <div className="w-full px-4 pb-8 sticky bottom-0 bg-gradient-to-t from-dark-900 via-dark-900 to-transparent pt-10">
          <div className="relative max-w-3xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              className="w-full bg-dark-800 text-white placeholder-gray-500 border border-white/10 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 shadow-2xl transition-all"
              disabled={status === ChatStatus.LOADING}
              autoFocus
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || status === ChatStatus.LOADING}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white text-dark-900 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-gray-600">
            Press Enter to send • AI can make mistakes. Review generated brands.
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;