'use client';

import { BrandColors } from '@/schemas/brand';

/**
 * Palette Preview Component
 * 
 * Displays the brand color palette with hex codes.
 */

interface PalettePreviewProps {
  colors: BrandColors;
}

export function PalettePreview({ colors }: PalettePreviewProps) {
  const colorEntries = Object.entries(colors) as [keyof BrandColors, string][];

  return (
    <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
        Color Palette
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {colorEntries.map(([key, color]) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <div
              className="w-full aspect-square rounded-lg shadow-inner border border-gray-700"
              style={{ backgroundColor: color }}
            />
            <div className="text-center">
              <p className="text-xs text-gray-400 font-mono">{key}</p>
              <p className="text-xs text-gray-500 font-mono">{color}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

