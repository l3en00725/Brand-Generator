import React, { useState } from 'react';
import { Download, RefreshCw, Palette, ArrowLeftRight, Check, Package, MessageSquare, Send, Sparkles } from 'lucide-react';
import type { LogoOption, LogoOptionId, BrandStrategy } from '../../types';
import { MAX_FREE_REVISIONS } from '../../types';
import { ASSET_MANIFEST } from '../../constants';
import RevisionModal from './RevisionModal';

interface DownloadPanelProps {
  selectedOption: LogoOption;
  allOptions: LogoOption[];
  brandStrategy: BrandStrategy;
  revisionsUsed: number;
  onColorRevision: (shade: 'lighter' | 'darker') => void;
  onSwitchOption: (newOption: LogoOptionId) => void;
  onDownload: () => void;
  isDownloading: boolean;
  onRequestRevision?: (request: string) => Promise<void>;
  isRevising?: boolean;
}

const DownloadPanel: React.FC<DownloadPanelProps> = ({
  selectedOption,
  allOptions,
  brandStrategy,
  revisionsUsed,
  onColorRevision,
  onSwitchOption,
  onDownload,
  isDownloading,
  onRequestRevision,
  isRevising = false
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRevisionChat, setShowRevisionChat] = useState(false);
  const [revisionInput, setRevisionInput] = useState('');
  const canRevise = revisionsUsed < MAX_FREE_REVISIONS;

  const handleRevisionSubmit = async () => {
    if (!revisionInput.trim() || !onRequestRevision) return;
    await onRequestRevision(revisionInput.trim());
    setRevisionInput('');
  };

  const handleRevision = (action: () => void) => {
    if (canRevise) {
      action();
    } else {
      setShowPaymentModal(true);
    }
  };

  const totalAssets = 
    ASSET_MANIFEST.logos.length + 
    ASSET_MANIFEST.social.length + 
    ASSET_MANIFEST.icons.length + 
    ASSET_MANIFEST.metadata.length;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
          <Check size={14} className="text-green-400" />
          <span className="text-xs font-mono text-green-300 uppercase tracking-wider">
            Brand Package Ready
          </span>
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">{brandStrategy.brandName}</h2>
        <p className="text-gray-400 text-sm">{brandStrategy.tagline}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Selected Logo Preview */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                Selected Logo
              </span>
              <span className="text-xs font-mono text-brand-400 px-2 py-1 bg-brand-500/10 rounded">
                Option {selectedOption.id}
              </span>
            </div>
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={selectedOption.imageUrl}
                alt={`Selected logo option ${selectedOption.id}`}
                className="w-full h-full object-contain p-4"
              />
            </div>

            {/* Color Palette Preview */}
            <div className="mt-4">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-2">
                Color Palette
              </span>
              <div className="flex gap-2">
                {Object.entries(brandStrategy.colors).map(([key, color]) => (
                  <div key={key} className="flex-1">
                    <div
                      className="aspect-square rounded-lg shadow-inner"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[8px] text-gray-500 font-mono block text-center mt-1">
                      {key.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Asset List */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-brand-400" />
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                {totalAssets} Files Included
              </span>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {/* Logos */}
              <div>
                <h4 className="text-xs font-mono text-brand-400 uppercase mb-2">Logos</h4>
                <ul className="space-y-1">
                  {ASSET_MANIFEST.logos.map((asset) => (
                    <li key={asset.name} className="text-xs text-gray-400 flex justify-between">
                      <span className="font-mono">{asset.name}</span>
                      <span className="text-gray-600">{asset.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social */}
              <div>
                <h4 className="text-xs font-mono text-purple-400 uppercase mb-2">Social</h4>
                <ul className="space-y-1">
                  {ASSET_MANIFEST.social.map((asset) => (
                    <li key={asset.name} className="text-xs text-gray-400 flex justify-between">
                      <span className="font-mono">{asset.name}</span>
                      <span className="text-gray-600">{asset.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Icons */}
              <div>
                <h4 className="text-xs font-mono text-green-400 uppercase mb-2">Icons</h4>
                <ul className="space-y-1">
                  {ASSET_MANIFEST.icons.map((asset) => (
                    <li key={asset.name} className="text-xs text-gray-400 flex justify-between">
                      <span className="font-mono">{asset.name}</span>
                      <span className="text-gray-600">{asset.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metadata */}
              <div>
                <h4 className="text-xs font-mono text-orange-400 uppercase mb-2">Metadata</h4>
                <ul className="space-y-1">
                  {ASSET_MANIFEST.metadata.map((asset) => (
                    <li key={asset.name} className="text-xs text-gray-400 flex justify-between">
                      <span className="font-mono">{asset.name}</span>
                      <span className="text-gray-600">{asset.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            {/* Download Button */}
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full py-4 px-6 bg-brand-500 text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating ZIP...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download All Assets
                </>
              )}
            </button>

            {/* Revision Section */}
            <div className="mt-6 pt-6 border-t border-white/10 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                  Revisions
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  canRevise 
                    ? 'text-green-400 bg-green-500/10' 
                    : 'text-orange-400 bg-orange-500/10'
                }`}>
                  {MAX_FREE_REVISIONS - revisionsUsed} free left
                </span>
              </div>

              {/* Color Adjustment */}
              <div className="mb-4">
                <span className="text-xs text-gray-500 mb-2 block">Adjust primary color</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRevision(() => onColorRevision('lighter'))}
                    className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Palette size={14} />
                    Lighter
                  </button>
                  <button
                    onClick={() => handleRevision(() => onColorRevision('darker'))}
                    className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Palette size={14} />
                    Darker
                  </button>
                </div>
              </div>

              {/* Switch Option */}
              <div>
                <span className="text-xs text-gray-500 mb-2 block">Switch to another option</span>
                <div className="flex gap-2">
                  {allOptions
                    .filter(opt => opt.id !== selectedOption.id)
                    .map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleRevision(() => onSwitchOption(opt.id))}
                        className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeftRight size={14} />
                        Option {opt.id}
                      </button>
                    ))}
                </div>
              </div>

              {!canRevise && (
                <p className="text-[10px] text-gray-600 mt-4 text-center">
                  Additional revisions cost $2 each
                </p>
              )}

              {/* Chat Revision Button */}
              {onRequestRevision && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowRevisionChat(!showRevisionChat)}
                    className="w-full py-3 px-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-sm text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    {showRevisionChat ? 'Hide Revision Chat' : 'Request Revision via Chat'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revision Chat Panel */}
      {showRevisionChat && onRequestRevision && (
        <div className="mt-6 bg-dark-800 border border-purple-500/30 rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm font-mono text-purple-300 uppercase tracking-wider">
              Test Mode: Revision Chat
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">
            Tell the AI what you'd like to change. For example:
            <span className="block mt-2 text-gray-500 italic">
              "Make the colors more earthy and natural" or "I want a bolder, more modern look"
            </span>
          </p>

          <div className="relative">
            <input
              type="text"
              value={revisionInput}
              onChange={(e) => setRevisionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRevisionSubmit()}
              placeholder="Describe what you'd like to change..."
              className="w-full bg-dark-900 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              disabled={isRevising}
            />
            <button
              onClick={handleRevisionSubmit}
              disabled={!revisionInput.trim() || isRevising}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRevising ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          {isRevising && (
            <div className="mt-4 flex items-center gap-2 text-purple-300 text-sm">
              <Sparkles size={14} className="animate-pulse" />
              <span>Regenerating your brand with changes...</span>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <RevisionModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </div>
  );
};

export default DownloadPanel;

