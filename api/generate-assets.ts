import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deriveAssets, adjustColor } from '../services/assetProcessor';
import { createZipFromAssets, getZipFilename } from '../services/zipBuilder';
import type { GenerateAssetsRequest, BrandStrategy } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { selectedOption, logoBase64, brandStrategy, revision } = req.body as GenerateAssetsRequest;

    if (!selectedOption || !logoBase64 || !brandStrategy) {
      return res.status(400).json({ 
        error: 'selectedOption, logoBase64, and brandStrategy are required' 
      });
    }

    // Apply color revision if requested
    let finalStrategy: BrandStrategy = brandStrategy;
    if (revision && revision.type === 'color') {
      finalStrategy = {
        ...brandStrategy,
        colors: {
          ...brandStrategy.colors,
          primary: adjustColor(brandStrategy.colors.primary, revision.shade)
        }
      };
    }

    // Strip data URL prefix if present
    const cleanBase64 = logoBase64.replace(/^data:image\/png;base64,/, '');

    // Generate all assets
    const assets = await deriveAssets(cleanBase64, finalStrategy);

    // Create ZIP file
    const zipBuffer = await createZipFromAssets(assets, finalStrategy.brandName);
    const filename = getZipFilename(finalStrategy.brandName);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    // Send ZIP file
    return res.send(zipBuffer);
  } catch (error) {
    console.error('Generate assets API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate assets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

