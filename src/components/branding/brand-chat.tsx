'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './message-bubble';
import { BrandStrategy } from '@/schemas/brand';
import { validateBrandStrategy } from '@/lib/validation/brand';
import { getMessageContent } from '@/lib/utils/ui-message';

/**
 * Brand Chat Component
 * 
 * Streaming chat interface for brand discovery.
 * Uses Vercel AI SDK useChat hook for progressive streaming.
 */

interface BrandChatProps {
  onStrategyExtracted?: (strategy: BrandStrategy) => void;
}

export function BrandChat({ onStrategyExtracted }: BrandChatProps) {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [localInput, setLocalInput] = useState('');

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/4176329a-c639-450a-ae71-1ad22ccc0226',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'brand-chat.tsx:23',message:'Component mount',data:{hasReact:typeof React !== 'undefined',hasUseState:typeof useState,hasUseEffect:typeof useEffect},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H8'})}).catch(()=>{});
  }, []);
  // #endregion

  let chatResult;
  try {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4176329a-c639-450a-ae71-1ad22ccc0226',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'brand-chat.tsx:32',message:'About to call useChat',data:{useChatType:typeof useChat},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    
    chatResult = useChat({
      api: '/api/chat',
      initialMessages: [
        {
          id: 'initial-greeting',
          role: 'assistant',
          content: "Hello! I'm Claude, your AI branding assistant. I'd love to help you create an amazing brand identity. To get started, could you tell me the name of your business or project?",
        },
      ] as any,
      onFinish: (message) => {
        // Extract brand strategy JSON from final message
        const text = getMessageContent(message);
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const extracted = JSON.parse(jsonMatch[1]);
            const validated = validateBrandStrategy(extracted);
            onStrategyExtracted?.(validated);
          } catch (err) {
            console.error('Failed to extract/validate brand strategy:', err);
          }
        }
      },
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4176329a-c639-450a-ae71-1ad22ccc0226',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'brand-chat.tsx:52',message:'useChat returned',data:{hasResult:!!chatResult,resultKeys:chatResult ? Object.keys(chatResult) : []},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/4176329a-c639-450a-ae71-1ad22ccc0226',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'brand-chat.tsx:56',message:'useChat error',data:{error:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    throw err;
  }

  const { messages, input, handleSubmit, handleInputChange, isLoading, error, append, sendMessage } = chatResult;

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/4176329a-c639-450a-ae71-1ad22ccc0226',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'brand-chat.tsx:42',message:'useChat hook state',data:{input:typeof input,handleInputChange:typeof handleInputChange,handleSubmit:typeof handleSubmit,append:typeof append,messagesLength:messages?.length,messages:messages,isLoading,hasError:!!error},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1,H2'})}).catch(()=>{});
  }, [input, handleInputChange, handleSubmit, append, messages, isLoading, error]);
  // #endregion

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 mb-4 max-h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Show initial greeting if no messages */}
          {messages.length === 0 && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-4 flex-row">
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div className="px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm">
                    <p className="whitespace-pre-wrap">
                      Hello! I'm Claude, your AI branding assistant. I'd love to help you create an amazing brand identity. To get started, could you tell me the name of your business or project?
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 text-left">
                    BrandForge
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-4 text-gray-400">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
            {error.message || 'Failed to send message. Please try again.'}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const textToSend = (input || localInput || '').trim();
        if (!textToSend || isLoading) return;
        
        // Try handleSubmit first (standard useChat flow)
        if (handleSubmit && handleInputChange) {
          handleSubmit(e);
        } else if (sendMessage) {
          // Fallback: use sendMessage directly
          sendMessage({ role: 'user', content: textToSend });
          setLocalInput('');
        }
      }} className="px-4 pb-4">
        <div className="relative">
          <input
            value={(input !== undefined && input !== null) ? input : localInput}
            onChange={(e) => {
              const value = e.target.value;
              if (handleInputChange) {
                handleInputChange(e);
              } else {
                setLocalInput(value);
              }
            }}
            placeholder="Type your answer here..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !(input || localInput || '').trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white text-gray-900 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
        <p className="text-center mt-2 text-xs text-gray-500">
          Press Enter to send • AI can make mistakes. Review generated brands.
        </p>
      </form>
    </div>
  );
}
