'use client';

import { BrandChat } from '@/components/branding/brand-chat';
import { LogoGrid } from '@/components/branding/logo-grid';
import { BrandStrategyDraft, LogoVariation, StyleAxis } from '@/schemas/brand';
import { useState, useCallback } from 'react';

/**
 * Create Page
 * 
 * Main branding creation flow:
 * 1. Chat discovery (left)
 * 2. Strategy + logo generation (right)
 * 
 * State manages conversation → strategy extraction → generation trigger
 */

export default function CreatePage() {
  const [strategyDraft, setStrategyDraft] = useState<BrandStrategyDraft | null>(null);
  const [styleAxis, setStyleAxis] = useState<StyleAxis | null>(null);
  const [variations, setVariations] = useState<LogoVariation[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStyleAxisChange = useCallback((axis: StyleAxis) => {
    setStyleAxis(axis);
    setVariations(null);
  }, []);

  // Trigger logo generation
  const handleGenerate = useCallback(async () => {
    if (!strategyDraft || !styleAxis) return;

    const strategy = { ...strategyDraft, styleAxis };

    setIsGenerating(true);
    setVariations(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          variationCount: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate logos');
      }

      const data = await response.json();
      setVariations(data.variations || []);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [strategyDraft, styleAxis]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Chat */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <BrandChat
              onStrategyExtracted={(draft) => {
                setStrategyDraft(draft);
                setStyleAxis(null);
                setVariations(null);
              }}
            />
          </div>

          {/* Right: Strategy + Variations */}
          <div>
            {strategyDraft ? (
              <LogoGrid
                strategy={strategyDraft}
                styleAxis={styleAxis}
                onStyleAxisChange={handleStyleAxisChange}
                onGenerate={handleGenerate}
                variations={variations}
                isGenerating={isGenerating}
              />
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>Complete the brand discovery conversation to see your strategy and generate logos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

