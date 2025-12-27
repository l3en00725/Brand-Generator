'use client';

import { BrandStrategy, LogoVariation } from '@/schemas/brand';
import { VariationCard } from './variation-card';
import { PalettePreview } from './palette-preview';
import { useState } from 'react';

/**
 * Logo Grid Component
 * 
 * Displays brand strategy (palette, rationale) and logo variations.
 * Handles generation trigger and progressive loading.
 */

interface LogoGridProps {
  strategy: BrandStrategy;
  onGenerate: () => void;
  variations: LogoVariation[] | null;
  isGenerating: boolean;
}

export function LogoGrid({ strategy, onGenerate, variations, isGenerating }: LogoGridProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Brand Strategy Summary */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{strategy.brandName}</h2>
          <p className="text-gray-400">{strategy.tagline}</p>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Brand Rationale</h3>
          <p className="text-gray-400 text-sm">{strategy.rationale}</p>
        </div>

        <PalettePreview colors={strategy.colors} />
      </div>

      {/* Generate Button */}
      {!variations && !isGenerating && (
        <button
          onClick={onGenerate}
          className="w-full py-4 px-6 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-500 transition-all"
        >
          Generate Logo Variations
        </button>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Generating logo variations...</p>
          </div>
        </div>
      )}

      {/* Variations Grid */}
      {variations && variations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Logo Variations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variations.map((variation) => (
              <VariationCard key={variation.id} variation={variation} brandName={strategy.brandName} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

