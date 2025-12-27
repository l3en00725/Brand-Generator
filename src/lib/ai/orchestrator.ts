import { BrandStrategy, LogoVariation, LogoVariationStatus } from '@/schemas/brand';
import { generateSvgVariations } from './gemini';
import { generatePngVariations } from './imagen';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logo Generation Orchestrator
 * 
 * Coordinates parallel SVG + PNG generation.
 * Ensures SVG failure NEVER blocks PNG display.
 * 
 * Returns mixed results (some variations may have SVG, some PNG, some both).
 */

export interface GenerationOptions {
  strategy: BrandStrategy;
  variationCount: number; // 3-8
}

/**
 * Generate logo variations in parallel (SVG + PNG)
 * Returns array of LogoVariation objects with mixed SVG/PNG availability
 */
export async function generateLogoVariations(
  options: GenerationOptions
): Promise<LogoVariation[]> {
  const { strategy, variationCount } = options;

  // Prepare generation options
  const svgOptions = {
    brandName: strategy.brandName,
    logoDirection: strategy.logoDirection,
    primaryColor: strategy.colors.primary,
    industry: strategy.industry,
  };

  const pngOptions = {
    brandName: strategy.brandName,
    logoDirection: strategy.logoDirection,
    primaryColor: strategy.colors.primary,
    industry: strategy.industry,
  };

  // Generate SVG and PNG in parallel
  const [svgResults, pngResults] = await Promise.all([
    generateSvgVariations(svgOptions, variationCount),
    generatePngVariations(pngOptions, variationCount),
  ]);

  // Pair SVG + PNG results into LogoVariation objects
  const variations: LogoVariation[] = [];

  for (let i = 0; i < variationCount; i++) {
    const svgResult = svgResults[i];
    const pngResult = pngResults[i];

    let status: LogoVariationStatus = 'completed';
    const errors: string[] = [];

    if (!svgResult.svg && !pngResult.pngUrl) {
      status = 'failed';
      errors.push(...svgResult.errors, ...pngResult.errors);
    } else if (!svgResult.svg && pngResult.pngUrl) {
      status = 'svg_failed';
      errors.push(...svgResult.errors);
    } else if (svgResult.svg && !pngResult.pngUrl) {
      status = 'png_failed';
      errors.push(...pngResult.errors);
    }

    variations.push({
      id: uuidv4(),
      svg: svgResult.svg || undefined,
      pngUrl: pngResult.pngUrl || undefined,
      status,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  return variations;
}

