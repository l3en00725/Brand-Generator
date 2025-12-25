import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { 
  AppPhase, 
  ChatStatus, 
  type Message, 
  type BrandStrategy, 
  type LogoOption, 
  type LogoOptionId,
  type ChatResponse,
  type GenerateLogosResponse 
} from '../../types';
import { INITIAL_MESSAGE } from '../../constants';
import MessageBubble from './MessageBubble';
import LogoOptions from '../LogoSelection/LogoOptions';
import DownloadPanel from '../Download/DownloadPanel';

const ChatInterface: React.FC = () => {
  // App state
  const [phase, setPhase] = useState<AppPhase>(AppPhase.CHAT);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INITIAL_MESSAGE }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Brand data
  const [brandStrategy, setBrandStrategy] = useState<BrandStrategy | null>(null);
  const [logoOptions, setLogoOptions] = useState<LogoOption[] | null>(null);
  const [selectedOption, setSelectedOption] = useState<LogoOptionId | null>(null);
  const [revisionsUsed, setRevisionsUsed] = useState(0);
  const [isRevising, setIsRevising] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // ============================================
  // CHAT HANDLER
  // ============================================
  const handleSendMessage = async () => {
    if (!inputValue.trim() || status === ChatStatus.LOADING) return;

    const userText = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setStatus(ChatStatus.LOADING);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data: ChatResponse = await response.json();

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // Check if ready for logo generation
      if (data.readyForLogos && data.brandStrategy) {
        setBrandStrategy(data.brandStrategy);
        setStatus(ChatStatus.COMPLETE);
        // Trigger logo generation
        handleGenerateLogos(data.brandStrategy);
      } else {
        setStatus(ChatStatus.IDLE);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please try again.');
      setStatus(ChatStatus.ERROR);
    }
  };

  // ============================================
  // LOGO GENERATION
  // ============================================
  const handleGenerateLogos = async (strategy: BrandStrategy) => {
    setPhase(AppPhase.GENERATING);

    try {
      const response = await fetch('/api/generate-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoPrompts: strategy.logoPrompts })
      });

      if (!response.ok) {
        throw new Error('Failed to generate logos');
      }

      const data: GenerateLogosResponse = await response.json();
      setLogoOptions(data.options);
      setPhase(AppPhase.SELECTION);
      setIsRevising(false); // Reset revision state
    } catch (err) {
      console.error('Logo generation error:', err);
      setError('Failed to generate logos. Please refresh and try again.');
      setPhase(AppPhase.CHAT);
      setStatus(ChatStatus.ERROR);
      setIsRevising(false); // Reset revision state on error
    }
  };

  // ============================================
  // SELECTION & DOWNLOAD
  // ============================================
  const handleSelectOption = (id: LogoOptionId) => {
    setSelectedOption(id);
  };

  const handleConfirmSelection = async () => {
    if (!selectedOption || !logoOptions || !brandStrategy) return;

    setPhase(AppPhase.COMPLETE);
  };

  const handleDownload = async () => {
    if (!selectedOption || !logoOptions || !brandStrategy) return;

    const selected = logoOptions.find(opt => opt.id === selectedOption);
    if (!selected) return;

    setPhase(AppPhase.DOWNLOADING);

    try {
      const response = await fetch('/api/generate-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOption,
          logoBase64: selected.imageUrl,
          brandStrategy
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate assets');
      }

      // Get the ZIP blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandStrategy.brandName.toLowerCase().replace(/\s+/g, '-')}-brand-assets.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setPhase(AppPhase.COMPLETE);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download assets. Please try again.');
      setPhase(AppPhase.COMPLETE);
    }
  };

  // ============================================
  // REVISIONS
  // ============================================
  const handleColorRevision = async (shade: 'lighter' | 'darker') => {
    if (!selectedOption || !logoOptions || !brandStrategy) return;

    const selected = logoOptions.find(opt => opt.id === selectedOption);
    if (!selected) return;

    setRevisionsUsed(prev => prev + 1);
    setPhase(AppPhase.DOWNLOADING);

    try {
      const response = await fetch('/api/generate-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOption,
          logoBase64: selected.imageUrl,
          brandStrategy,
          revision: { type: 'color', shade }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate revised assets');
      }

      // Get the ZIP blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandStrategy.brandName.toLowerCase().replace(/\s+/g, '-')}-brand-assets-revised.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setPhase(AppPhase.COMPLETE);
    } catch (err) {
      console.error('Revision error:', err);
      setError('Failed to apply revision. Please try again.');
      setPhase(AppPhase.COMPLETE);
    }
  };

  const handleSwitchOption = (newOption: LogoOptionId) => {
    setSelectedOption(newOption);
    setRevisionsUsed(prev => prev + 1);
  };

  // ============================================
  // CHAT-BASED REVISION (TEST MODE)
  // ============================================
  const handleRequestRevision = async (revisionRequest: string) => {
    if (!brandStrategy) return;
    
    setIsRevising(true);
    setRevisionsUsed(prev => prev + 1);

    try {
      // Create a revision message that includes current brand context
      const revisionMessages: Message[] = [
        ...messages,
        { 
          role: 'user', 
          content: `REVISION REQUEST: Please update my brand "${brandStrategy.brandName}" with these changes: ${revisionRequest}. 
          
Current brand info:
- Industry: ${brandStrategy.industry}
- Audience: ${brandStrategy.audience}
- Tone: ${brandStrategy.tone}
- Primary color: ${brandStrategy.colors.primary}

Please generate an updated brand strategy JSON with new colors and logo prompts that reflect these changes.`
        }
      ];

      // Call chat API for revision
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: revisionMessages, isRevision: true })
      });

      if (!response.ok) {
        throw new Error('Failed to get revision from AI');
      }

      const data = await response.json();

      // Add messages to chat history
      setMessages(prev => [
        ...prev,
        { role: 'user', content: `Revision: ${revisionRequest}` },
        { role: 'assistant', content: data.reply }
      ]);

      // If we got a new brand strategy, regenerate logos
      if (data.brandStrategy) {
        setBrandStrategy(data.brandStrategy);
        setSelectedOption(null);
        await handleGenerateLogos(data.brandStrategy);
      } else {
        setIsRevising(false);
      }
    } catch (err) {
      console.error('Revision error:', err);
      setError('Failed to process revision. Please try again.');
      setIsRevising(false);
    }
  };

  // ============================================
  // KEY HANDLER
  // ============================================
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ============================================
  // RENDER
  // ============================================
  
  // Logo Selection Phase
  if (phase === AppPhase.SELECTION && logoOptions && brandStrategy) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <LogoOptions
          options={logoOptions}
          selectedOption={selectedOption}
          onSelect={handleSelectOption}
          onConfirm={handleConfirmSelection}
          brandStrategy={brandStrategy}
          revisionsUsed={revisionsUsed}
          isRevising={isRevising}
          onRequestRevision={handleRequestRevision}
        />
      </div>
    );
  }

  // Complete Phase (Download Panel)
  if ((phase === AppPhase.COMPLETE || phase === AppPhase.DOWNLOADING) && logoOptions && selectedOption && brandStrategy) {
    const selected = logoOptions.find(opt => opt.id === selectedOption)!;
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <DownloadPanel
          selectedOption={selected}
          allOptions={logoOptions}
          brandStrategy={brandStrategy}
          revisionsUsed={revisionsUsed}
          onColorRevision={handleColorRevision}
          onSwitchOption={handleSwitchOption}
          onDownload={handleDownload}
          isDownloading={phase === AppPhase.DOWNLOADING}
        />
      </div>
    );
  }

  // Generating Phase
  if (phase === AppPhase.GENERATING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-5xl mx-auto px-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Loader2 size={32} className="text-brand-400 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Generating Your Logos</h3>
          <p className="text-gray-400 text-sm">
            Creating 3 unique logo concepts with DALL-E 3...
          </p>
          <p className="text-gray-500 text-xs mt-4 font-mono">
            This may take 30-60 seconds
          </p>
        </div>
      </div>
    );
  }

  // Chat Phase (Default)
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
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {(status === ChatStatus.ERROR || error) && (
          <div className="flex justify-center my-4">
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error || 'Connection failed. Please refresh.'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
    </div>
  );
};

export default ChatInterface;
