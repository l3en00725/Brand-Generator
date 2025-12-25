import React, { useEffect, useMemo, useState } from 'react';
import type { BrandStrategy } from '../../types';

type PreviewMode = 'icon' | 'lockup' | 'og';

function getOgSubcopy(strategy: BrandStrategy): string {
  const tagline = (strategy.tagline || '').trim();
  if (tagline) return tagline;

  const industry = (strategy.industry || '').trim();
  const audience = (strategy.audience || '').trim();

  if (industry && audience) return `${industry} for ${audience}`.slice(0, 64);
  if (industry) return industry.slice(0, 64);
  if (audience) return `For ${audience}`.slice(0, 64);
  return 'Professional services, delivered.';
}

async function renderOpenGraphDataUrl(params: {
  logoDataUrl: string;
  brandName: string;
  subcopy: string;
  primaryHex: string;
}): Promise<string> {
  const { logoDataUrl, brandName, subcopy, primaryHex } = params;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load logo image
  const img = new Image();
  img.decoding = 'async';
  img.src = logoDataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load logo'));
  });

  // Layout constants
  const paddingX = 96;
  const paddingY = 90;
  const iconSize = 180;
  const textX = paddingX + iconSize + 48;
  const centerY = canvas.height / 2;

  // Draw icon (logo image scaled into icon box)
  const iconY = Math.round(centerY - iconSize / 2);
  ctx.drawImage(img, paddingX, iconY, iconSize, iconSize);

  // Brand name
  ctx.fillStyle = '#0B1220';
  ctx.font = '700 64px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(brandName, textX, iconY + 78);

  // Subcopy
  ctx.fillStyle = '#475569';
  ctx.font = '400 30px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(subcopy, textX, iconY + 128);

  // Accent bar
  ctx.fillStyle = primaryHex || '#0ea5e9';
  ctx.fillRect(paddingX, iconY + iconSize + 42, 240, 10);

  return canvas.toDataURL('image/png');
}

export default function OptionPreviews(props: {
  logoDataUrl: string;
  brandStrategy: BrandStrategy;
}) {
  const { logoDataUrl, brandStrategy } = props;

  const [mode, setMode] = useState<PreviewMode>('icon');
  const [ogPreview, setOgPreview] = useState<string>('');

  const subcopy = useMemo(() => getOgSubcopy(brandStrategy), [brandStrategy]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await renderOpenGraphDataUrl({
          logoDataUrl,
          brandName: brandStrategy.brandName,
          subcopy,
          primaryHex: brandStrategy.colors.primary,
        });
        if (!cancelled) setOgPreview(url);
      } catch {
        if (!cancelled) setOgPreview('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logoDataUrl, brandStrategy.brandName, brandStrategy.colors.primary, subcopy]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
          Preview (what you’ll get)
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('icon')}
            className={`px-2 py-1 rounded text-[10px] font-mono border ${
              mode === 'icon'
                ? 'border-white/20 text-white bg-white/10'
                : 'border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            Icon
          </button>
          <button
            type="button"
            onClick={() => setMode('lockup')}
            className={`px-2 py-1 rounded text-[10px] font-mono border ${
              mode === 'lockup'
                ? 'border-white/20 text-white bg-white/10'
                : 'border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            Icon + Name
          </button>
          <button
            type="button"
            onClick={() => setMode('og')}
            className={`px-2 py-1 rounded text-[10px] font-mono border ${
              mode === 'og'
                ? 'border-white/20 text-white bg-white/10'
                : 'border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            Open Graph
          </button>
        </div>
      </div>

      {mode === 'icon' && (
        <div className="bg-white rounded-xl p-3 shadow-inner">
          <div className="w-24 h-24 mx-auto bg-white rounded-lg overflow-hidden">
            <img src={logoDataUrl} alt="Icon preview" className="w-full h-full object-contain" />
          </div>
          <div className="mt-2 text-center text-[10px] font-mono text-gray-500">
            Square icon preview
          </div>
        </div>
      )}

      {mode === 'lockup' && (
        <div className="bg-white rounded-xl p-4 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0">
              <img src={logoDataUrl} alt="Lockup icon" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {brandStrategy.brandName}
              </div>
              <div className="text-[11px] text-slate-600 truncate">{subcopy}</div>
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] font-mono text-gray-500">
            Horizontal lockup preview
          </div>
        </div>
      )}

      {mode === 'og' && (
        <div className="bg-white rounded-xl p-3 shadow-inner">
          {ogPreview ? (
            <img
              src={ogPreview}
              alt="Open Graph preview"
              className="w-full h-auto rounded-lg border border-slate-200"
            />
          ) : (
            <div className="w-full h-40 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
              Generating Open Graph preview…
            </div>
          )}
          <div className="mt-2 text-center text-[10px] font-mono text-gray-500">
            Open Graph (1200×630) preview
          </div>
        </div>
      )}
    </div>
  );
}


