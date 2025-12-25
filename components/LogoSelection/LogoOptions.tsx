import React from 'react';
import { Sparkles } from 'lucide-react';
import type { LogoOption, LogoOptionId } from '../../types';
import AssetPreviewList from './AssetPreviewList';

interface LogoOptionsProps {
  options: LogoOption[];
  selectedOption: LogoOptionId | null;
  onSelect: (id: LogoOptionId) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoOptions: React.FC<LogoOptionsProps> = ({
  options,
  selectedOption,
  onSelect,
  onConfirm,
  isLoading = false
}) => {
  const optionLabels: Record<LogoOptionId, { title: string; description: string }> = {
    A: { title: 'Abstract Icon', description: 'Geometric symbol, no letters' },
    B: { title: 'Lettermark', description: 'Stylized initials only' },
    C: { title: 'Wordmark', description: 'Full brand name' }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-4">
          <Sparkles size={14} className="text-brand-400" />
          <span className="text-xs font-mono text-brand-300 uppercase tracking-wider">
            3 Logo Concepts Generated
          </span>
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">Choose your logo</h2>
        <p className="text-gray-400 text-sm">Select one option to receive your complete brand asset package</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const label = optionLabels[option.id];

          return (
            <div
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`
                cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300
                ${isSelected 
                  ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/20' 
                  : 'border-white/10 bg-dark-800 hover:border-white/30 hover:bg-dark-700'
                }
              `}
            >
              {/* Option Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`
                  text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full
                  ${isSelected 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-white/10 text-gray-400'
                  }
                `}>
                  Option {option.id}
                </span>
                {isSelected && (
                  <span className="text-xs text-brand-400 font-mono">Selected</span>
                )}
              </div>

              {/* Logo Preview */}
              <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4 shadow-inner">
                <img
                  src={option.imageUrl}
                  alt={`Logo option ${option.id}`}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Label */}
              <div className="text-center mb-2">
                <h3 className="text-white font-semibold">{label.title}</h3>
                <p className="text-gray-500 text-xs">{label.description}</p>
              </div>

              {/* Asset Preview */}
              <AssetPreviewList />
            </div>
          );
        })}
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center">
        <button
          onClick={onConfirm}
          disabled={!selectedOption || isLoading}
          className={`
            px-8 py-4 rounded-xl font-semibold text-sm uppercase tracking-wider
            transition-all duration-300 flex items-center gap-3
            ${selectedOption && !isLoading
              ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/30'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Assets...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {selectedOption ? `Get Option ${selectedOption} Assets` : 'Select an option'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LogoOptions;

