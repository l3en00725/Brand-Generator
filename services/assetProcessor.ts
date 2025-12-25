import sharp from 'sharp';
import type { BrandStrategy } from '../types';

// ============================================
// MAIN ASSET DERIVATION
// ============================================
export async function deriveAssets(
  logoBase64: string,
  brandStrategy: BrandStrategy
): Promise<Map<string, Buffer>> {
  const assets = new Map<string, Buffer>();
  const logoBuffer = Buffer.from(logoBase64, 'base64');

  // LOGOS
  assets.set('logos/logo.png', await resizeImage(logoBuffer, 512, 512));
  assets.set('logos/logo-transparent.png', await removeWhiteBackground(logoBuffer));
  assets.set('logos/logo-dark.png', await addBackground(logoBuffer, '#1a1a1a'));
  assets.set('logos/logo-light.png', await addBackground(logoBuffer, '#ffffff'));
  assets.set('logos/logo@2x.png', await resizeImage(logoBuffer, 1024, 1024));
  assets.set('logos/logo@4x.png', await resizeImage(logoBuffer, 2048, 2048));

  // SOCIAL
  assets.set('social/open-graph.png', await createSocialAsset(logoBuffer, 1200, 630, brandStrategy));
  assets.set('social/x-header.png', await createSocialAsset(logoBuffer, 1500, 500, brandStrategy));
  assets.set('social/linkedin-banner.png', await createSocialAsset(logoBuffer, 1584, 396, brandStrategy));
  assets.set('social/instagram-profile.png', await resizeImage(logoBuffer, 320, 320));

  // ICONS
  for (const size of [16, 32, 64, 128, 256]) {
    assets.set(`icons/favicon-${size}.png`, await resizeImage(logoBuffer, size, size));
  }
  assets.set('icons/app-icon-1024.png', await resizeImage(logoBuffer, 1024, 1024));

  // METADATA
  assets.set('metadata/colors.json', Buffer.from(JSON.stringify(brandStrategy.colors, null, 2)));
  assets.set('metadata/fonts.txt', Buffer.from('Heading: Inter\nBody: Inter'));
  assets.set('metadata/README.txt', Buffer.from(generateReadme(brandStrategy.brandName)));

  return assets;
}

// ============================================
// IMAGE PROCESSING HELPERS
// ============================================
async function resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
}

async function removeWhiteBackground(buffer: Buffer): Promise<Buffer> {
  // Get raw pixel data
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert white/near-white pixels to transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If pixel is white-ish (R,G,B all > 240), make transparent
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Set alpha to 0
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toBuffer();
}

async function addBackground(buffer: Buffer, color: string): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Create background and composite logo on top
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha: 1 }
    }
  })
    .composite([{ input: buffer, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function createSocialAsset(
  logoBuffer: Buffer,
  width: number,
  height: number,
  brandStrategy: BrandStrategy
): Promise<Buffer> {
  // Deterministic social layout with brand name + tagline (no AI text -> no misspellings).
  const brandName = brandStrategy.brandName.trim();
  const tagline = (brandStrategy.tagline || '').trim();
  const subcopy = tagline || `${brandStrategy.industry}`.trim() || `For ${brandStrategy.audience}`.trim();

  const primary = brandStrategy.colors.primary || '#0ea5e9';
  const hex = primary.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const paddingX = Math.round(width * 0.08);
  const iconSize = Math.min(Math.round(height * 0.42), 220);
  const iconLeft = paddingX;
  const iconTop = Math.round((height - iconSize) / 2);
  const textLeft = iconLeft + iconSize + Math.round(width * 0.04);

  const resizedLogo = await sharp(logoBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  // Simple SVG text overlay (works in sharp without relying on system fonts too heavily)
  const titleSize = Math.max(40, Math.round(height * 0.10));
  const subSize = Math.max(20, Math.round(height * 0.05));
  const accentW = Math.min(240, Math.round(width * 0.22));
  const accentH = 10;
  const accentY = iconTop + iconSize + 36;

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .title { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; font-weight: 700; fill: #0B1220; }
      .sub { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; font-weight: 400; fill: #475569; }
    </style>
    <text x="${textLeft}" y="${iconTop + Math.round(titleSize * 1.2)}" class="title" font-size="${titleSize}">
      ${escapeXml(brandName)}
    </text>
    <text x="${textLeft}" y="${iconTop + Math.round(titleSize * 1.2) + Math.round(subSize * 1.6)}" class="sub" font-size="${subSize}">
      ${escapeXml(subcopy).slice(0, 72)}
    </text>
    <rect x="${iconLeft}" y="${accentY}" width="${accentW}" height="${accentH}" fill="rgb(${r},${g},${b})" />
  </svg>`;

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      { input: resizedLogo, left: iconLeft, top: iconTop },
      { input: Buffer.from(svg), left: 0, top: 0 }
    ])
    .png()
    .toBuffer();
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================
// README GENERATOR
// ============================================
function generateReadme(brandName: string): string {
  return `${brandName} Brand Assets
========================

LOGOS/
- logo.png: Standard logo (512x512)
- logo-transparent.png: Transparent background version
- logo-dark.png: For use on dark backgrounds
- logo-light.png: For use on light backgrounds
- logo@2x.png: High resolution (1024x1024)
- logo@4x.png: Extra high resolution (2048x2048)

SOCIAL/
- open-graph.png: Website sharing preview (1200x630)
- x-header.png: X/Twitter header (1500x500)
- linkedin-banner.png: LinkedIn banner (1584x396)
- instagram-profile.png: Instagram profile (320x320)

ICONS/
- favicon-16/32/64/128/256.png: Website favicons
- app-icon-1024.png: App store icon

METADATA/
- colors.json: Brand color palette (HEX values)
- fonts.txt: Recommended fonts
- README.txt: This file

Generated by BrandForge AI
`;
}

// ============================================
// COLOR ADJUSTMENT (for revisions)
// ============================================
export function adjustColor(hex: string, shade: 'lighter' | 'darker'): string {
  const cleanHex = hex.replace('#', '');
  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  const factor = shade === 'lighter' ? 1.2 : 0.8;

  r = Math.min(255, Math.round(r * factor));
  g = Math.min(255, Math.round(g * factor));
  b = Math.min(255, Math.round(b * factor));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

