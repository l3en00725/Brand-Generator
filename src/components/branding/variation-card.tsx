'use client';

import { LogoVariation } from '@/schemas/brand';
import { useState } from 'react';

/**
 * Variation Card Component
 * 
 * Displays a single logo variation with SVG/PNG toggle.
 * Handles download functionality.
 */

interface VariationCardProps {
  variation: LogoVariation;
  brandName: string;
}

export function VariationCard({ variation, brandName }: VariationCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<'svg' | 'png'>(
    variation.svg ? 'svg' : 'png'
  );

  const handleDownload = () => {
    if (selectedFormat === 'svg' && variation.svg) {
      const blob = new Blob([variation.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (selectedFormat === 'png' && variation.pngUrl) {
      const a = document.createElement('a');
      a.href = variation.pngUrl;
      a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const hasSvg = !!variation.svg;
  const hasPng = !!variation.pngUrl;

  return (
    <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700">
      {/* Format Toggle */}
      {hasSvg && hasPng && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedFormat('svg')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              selectedFormat === 'svg'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            SVG
          </button>
          <button
            onClick={() => setSelectedFormat('png')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              selectedFormat === 'png'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            PNG
          </button>
        </div>
      )}

      {/* Logo Preview */}
      <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4 shadow-inner flex items-center justify-center p-8">
        {selectedFormat === 'svg' && variation.svg ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: variation.svg }}
          />
        ) : selectedFormat === 'png' && variation.pngUrl ? (
          <img src={variation.pngUrl} alt="Logo variation" className="w-full h-full object-contain" />
        ) : (
          <div className="text-gray-400 text-sm">No preview available</div>
        )}
      </div>

      {/* Status & Errors */}
      {variation.status !== 'completed' && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Status: {variation.status}</p>
          {variation.errors && variation.errors.length > 0 && (
            <ul className="text-xs text-red-400 space-y-1">
              {variation.errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={
          (selectedFormat === 'svg' && !variation.svg) ||
          (selectedFormat === 'png' && !variation.pngUrl)
        }
        className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Download {selectedFormat.toUpperCase()}
      </button>
    </div>
  );
}

