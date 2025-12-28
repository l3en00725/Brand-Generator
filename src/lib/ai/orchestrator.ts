import {
  BrandStrategy,
  LogoVariation,
  LogoVariationStatus,
  LogoVariationType,
} from '@/schemas/brand';
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
  variationCount: number; // Always 3 (symbol, lettermark, combination)
}

/**
 * Generate logo variations in parallel (SVG + PNG)
 * Returns array of LogoVariation objects with mixed SVG/PNG availability
 */
export async function generateLogoVariations(
  options: GenerationOptions
): Promise<LogoVariation[]> {
  const { strategy } = options;

  const variationPlan: Array<{ type: LogoVariationType; intent: string }> = [
    {
      type: 'symbol',
      intent:
        'Symbol mark (icon-only). Create a distinctive emblem that could work as an app icon or favicon. No letters or text. Use layered geometric forms or abstract motifs that feel intentional, legible at 32px, and balanced in negative space.',
    },
    {
      type: 'lettermark',
      intent:
        'Lettermark. Craft stylized initials using custom vector geometry—not raw fonts. Maintain strong typographic rhythm, clean counters, and a silhouette that holds up in single color at 32px.',
    },
    {
      type: 'combination',
      intent:
        'Combination mark. Pair a compact symbol with a wordmark-ready shape. Design for horizontal balance so the mark can sit to the left of the name. Keep forms simple, confident, and readable as a monochrome silhouette.',
    },
  ];

  // Prepare generation options
  const svgOptions = variationPlan.map((plan) => ({
    brandName: strategy.brandName,
    logoDirection: strategy.logoDirection,
    primaryColor: strategy.colors.primary,
    industry: strategy.industry,
    styleAxis: strategy.styleAxis,
    variationType: plan.type,
    intent: plan.intent,
  }));

  const pngOptions = variationPlan.map((plan) => ({
    brandName: strategy.brandName,
    logoDirection: strategy.logoDirection,
    primaryColor: strategy.colors.primary,
    industry: strategy.industry,
    styleAxis: strategy.styleAxis,
    variationType: plan.type,
    intent: plan.intent,
  }));

  // Generate SVG and PNG in parallel
  const [svgResults, pngResults] = await Promise.all([
    generateSvgVariations(svgOptions),
    generatePngVariations(pngOptions),
  ]);

  // Pair SVG + PNG results into LogoVariation objects
  const variations: LogoVariation[] = [];

  for (let i = 0; i < variationPlan.length; i++) {
    const svgResult = svgResults[i];
    const pngResult = pngResults[i];
    const plan = variationPlan[i];

    let status: LogoVariationStatus = 'completed';
    const errors: string[] = [];

    if (!svgResult.svg && !pngResult.pngUrl) {
      status = 'failed';
      errors.push(...svgResult.errors, ...pngResult.errors);
      continue; // Quality gate: do not surface empty variations
    }

    if (!svgResult.svg && pngResult.pngUrl) {
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
      type: plan.type,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  return variations;
}

