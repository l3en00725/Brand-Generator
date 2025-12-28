'use client';

import { BrandStrategyDraft, LogoVariation, LogoVariationType, StyleAxis } from '@/schemas/brand';
import { VariationCard } from './variation-card';
import { PalettePreview } from './palette-preview';

/**
 * Logo Grid Component
 * 
 * Displays brand strategy (palette, rationale) and logo variations.
 * Handles generation trigger and progressive loading.
 */

interface LogoGridProps {
  strategy: BrandStrategyDraft;
  styleAxis: StyleAxis | null;
  onStyleAxisChange: (axis: StyleAxis) => void;
  onGenerate: () => void;
  variations: LogoVariation[] | null;
  isGenerating: boolean;
}

const styleOptions: Array<{ key: StyleAxis; label: string; detail: string }> = [
  { key: 'organic', label: 'Organic', detail: 'Rounded forms, natural curves, softer edges' },
  { key: 'geometric', label: 'Geometric', detail: 'Straight lines, symmetry, grid-based precision' },
  { key: 'bold', label: 'Bold', detail: 'Thick strokes, high contrast, strong silhouettes' },
];

const variationLabels: Record<LogoVariationType, string> = {
  symbol: 'Symbol Mark',
  lettermark: 'Lettermark',
  combination: 'Combination Mark',
};

export function LogoGrid({
  strategy,
  styleAxis,
  onStyleAxisChange,
  onGenerate,
  variations,
  isGenerating,
}: LogoGridProps) {
  const orderedTypes: LogoVariationType[] = ['symbol', 'lettermark', 'combination'];
  const variationsByType = new Map<LogoVariationType, LogoVariation>();

  variations?.forEach((variation) => {
    if (!variationsByType.has(variation.type)) {
      variationsByType.set(variation.type, variation);
    }
  });

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

        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Style direction</h3>
              <p className="text-gray-400 text-sm">One choice that steers every logo we show you.</p>
            </div>
            <span className="text-xs text-gray-500">Required</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {styleOptions.map((option) => {
              const isActive = styleAxis === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onStyleAxisChange(option.key)}
                  className={`flex flex-col gap-1 p-3 text-left rounded-lg border transition-all ${
                    isActive
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-gray-700 bg-gray-900/40 text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <span className="font-semibold text-sm">{option.label}</span>
                  <span className="text-xs text-gray-400">{option.detail}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
          <p className="font-semibold mb-1">What you will see</p>
          <p className="text-gray-400">Exactly three curated directions: a symbol mark, a lettermark, and a combination mark—only shown when they clear our quality checks.</p>
        </div>
      </div>

      {/* Generate Button */}
      {!variations && !isGenerating && (
        <button
          onClick={onGenerate}
          disabled={!styleAxis}
          className="w-full py-4 px-6 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {styleAxis ? 'Generate three logo options' : 'Choose a style to generate logos'}
        </button>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="text-center py-12 space-y-3">
          <div className="inline-flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300">Crafting three production-ready logo directions...</p>
          </div>
          <p className="text-xs text-gray-500">We silently drop anything that looks like a placeholder.</p>
        </div>
      )}

      {/* Variations Grid */}
      {variations && variations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Logo variations</h3>
            <p className="text-xs text-gray-400">Curated for recognizability at favicon size</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderedTypes.map((type) => {
              const variation = variationsByType.get(type);

              if (!variation) {
                return (
                  <div
                    key={type}
                    className="p-6 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-gray-500">{variationLabels[type]}</p>
                      <p className="text-sm text-gray-300 mt-1">
                        This direction was dropped because it didn&apos;t meet our quality bar.
                      </p>
                    </div>
                    <div className="mt-6 text-sm text-gray-500">
                      We only show marks that feel intentional and production-ready.
                    </div>
                  </div>
                );
              }

              return <VariationCard key={variation.id} variation={variation} brandName={strategy.brandName} />;
            })}
          </div>
        </div>
      )}

      {variations && variations.length === 0 && !isGenerating && (
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-400">
          Nothing cleared the quality bar. Regenerate to try fresh concepts.
        </div>
      )}
    </div>
  );
}

