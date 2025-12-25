import React from 'react';
import type { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Clean raw JSON out of the message for display if it exists in a block
  const displayContent = message.content.replace(/```json[\s\S]*?```/g, '');

  if (!displayContent.trim()) return null;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-brand-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div className="flex flex-col">
          <div 
            className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              isUser 
                ? 'bg-brand-600 text-white rounded-tr-sm' 
                : 'bg-dark-700 text-gray-100 border border-white/5 rounded-tl-sm'
            }`}
          >
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{displayContent}</ReactMarkdown>
              </div>
            )}
          </div>
          <span className={`text-[10px] text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'You' : 'BrandForge'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
