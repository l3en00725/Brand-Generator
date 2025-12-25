import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import type { BrandStrategy } from '../../types';
import { MAX_FREE_REVISIONS } from '../../types';

export default function RefineOptionsPanel(props: {
  brandStrategy: BrandStrategy;
  revisionsUsed: number;
  onRequestRevision: (request: string) => Promise<void>;
  isRevising: boolean;
}) {
  const { brandStrategy, revisionsUsed, onRequestRevision, isRevising } = props;
  const [value, setValue] = useState('');

  const freeLeft = Math.max(0, MAX_FREE_REVISIONS - revisionsUsed);
  const canRevise = revisionsUsed < MAX_FREE_REVISIONS;

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isRevising) return;
    await onRequestRevision(trimmed);
    setValue('');
  };

  return (
    <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Refine these 3 options (regenerates A/B/C)
            </span>
          </div>
          <p className="text-sm text-gray-300">
            Tell us what to change. This generates <span className="text-white">3 new logo options</span> using the same brand name ({brandStrategy.brandName}).
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Examples: “Simpler icon, less literal” • “More premium, tighter geometry” • “Make the wordmark cleaner”
          </p>
        </div>

        <div className={`text-xs font-mono px-2 py-1 rounded ${
          canRevise ? 'text-green-400 bg-green-500/10' : 'text-orange-400 bg-orange-500/10'
        }`}>
          {freeLeft} free left
        </div>
      </div>

      <div className="mt-4 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Describe what you'd like to improve…"
          className="w-full bg-dark-900 text-white placeholder-gray-500 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          disabled={isRevising || !canRevise}
        />
        <button
          onClick={submit}
          disabled={!value.trim() || isRevising || !canRevise}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Submit refinement"
        >
          {isRevising ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>

      {!canRevise && (
        <p className="mt-3 text-[10px] text-gray-600">
          Additional refinements will trigger the $2 revision modal (test mode).
        </p>
      )}
    </div>
  );
}


