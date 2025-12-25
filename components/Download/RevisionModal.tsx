import React from 'react';
import { X, CreditCard, Lock } from 'lucide-react';
import { REVISION_COST_USD } from '../../types';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <CreditCard size={28} className="text-brand-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white text-center mb-2">
          Additional Revision Required
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-center text-sm mb-6">
          You've used your free revision. Additional revisions cost{' '}
          <span className="text-brand-400 font-semibold">${REVISION_COST_USD}</span> each.
        </p>

        {/* What's included */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-mono">
            Each revision includes:
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
              Switch between logo options (A, B, or C)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
              Adjust primary color (lighter/darker)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
              Regenerate all social assets
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            disabled
            className="w-full py-3 px-4 bg-brand-500/50 text-white/70 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock size={16} />
            Payment Coming Soon
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-white/5 text-gray-400 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-gray-600 text-center mt-4">
          For V1 test launch, payment processing is disabled.
        </p>
      </div>
    </div>
  );
};

export default RevisionModal;

