import { GoogleGenerativeAI } from '@google/generative-ai';
import { svgArchitectSkill } from '@/lib/skills/svg-architect';
import { validateSvgStructure } from '@/lib/validation/svg';
import { LogoVariationType, StyleAxis } from '@/schemas/brand';

/**
 * Gemini Flash SVG Generation
 * 
 * Generates SVG logo variations using Gemini 3.0 Flash.
 * SVG is treated as conceptual variation, not single source of truth.
 * 
 * Retries up to 3 times on validation failure.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

export interface SvgGenerationOptions {
  brandName: string;
  logoDirection: string;
  primaryColor: string;
  industry: string;
  styleAxis: StyleAxis;
  variationType: LogoVariationType;
  intent: string;
}

const STYLE_CONSTRAINTS: Record<StyleAxis, string[]> = {
  organic: [
    'Favor rounded forms and natural curves; avoid sharp angles entirely',
    'Use leaf, growth, or flowing metaphors to shape the silhouette',
    'Keep the weight soft and balanced rather than rigid',
  ],
  geometric: [
    'Construct with straight lines, symmetry, and clear grid alignment',
    'Maintain consistent stroke weight and crisp intersections',
    'Avoid organic curves or sketchy edges',
  ],
  bold: [
    'Use fewer, larger shapes with high contrast and thick strokes',
    'Carve confident negative space for a strong silhouette',
    'Prioritize punchy, poster-like presence over fine detail',
  ],
};

/**
 * Generate a single SVG logo variation
 * Returns validated SVG string or null if all retries fail
 */
export async function generateSvgVariation(
  options: SvgGenerationOptions,
  retryCount = 0,
  priorErrors: string[] = []
): Promise<{ svg: string | null; errors: string[] }> {
  const maxRetries = 3;
  const errors: string[] = [...priorErrors];

  const model = genAI.getGenerativeModel({ model: MODEL });

  const styleRequirements = STYLE_CONSTRAINTS[options.styleAxis]
    .map((line) => `- ${line}`)
    .join('\n');

  // Build prompt from logo direction + constraints
  const prompt = `Design a ${options.intent}

Brand: "${options.brandName}" (${options.industry})
Direction: ${options.logoDirection}
Palette: anchor to ${options.primaryColor} on white

Style guardrails (${options.styleAxis}):
${styleRequirements}

Requirements:
- Crisp, high-contrast silhouette that is legible at 32px
- Ready for single-color use; avoid gradients, filters, or effects
- Compose at least two meaningful vector elements with intentional negative space and a clear focal point
- Keep proportions balanced in a 1:1 512x512 viewBox
- Do not include generic geometry, clipart, starbursts, lorem ipsum, or placeholder text
- Avoid lone circles, squares, or triangles; combine shapes into a purposeful mark with layered hierarchy
- For lettermark: build custom geometry for initials, not raw fonts
- For symbol/icon: absolutely no letters or numbers
- The silhouette must survive as a single-color icon; do not rely on texture or detail
- Do not violate the style guardrails above under any circumstance

${retryCount > 0 ? `Previous attempt failed (${errors[errors.length - 1] || 'unknown'}). Retry with simpler, more iconic geometry.` : ''}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: svgArchitectSkill,
    });

    const response = result.response;
    const text = response.text().trim();

    // Extract SVG from response (might have markdown fences)
    let svg = text.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim();

    // Validate SVG
    const validation = validateSvgStructure(svg);
    if (!validation.valid) {
      errors.push(validation.reason || 'Invalid SVG structure');

      if (retryCount < maxRetries - 1) {
        // Retry with error context
        return generateSvgVariation(options, retryCount + 1, errors);
      }
      
      return { svg: null, errors };
    }

    return { svg, errors: [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Generation error: ${errorMessage}`);

    if (retryCount < maxRetries - 1) {
      return generateSvgVariation(options, retryCount + 1, errors);
    }

    return { svg: null, errors };
  }
}

/**
 * Generate multiple SVG variations in parallel
 */
export async function generateSvgVariations(
  options: SvgGenerationOptions[]
): Promise<Array<{ svg: string | null; errors: string[] }>> {
  const promises = options.map((option) => generateSvgVariation(option));
  return Promise.all(promises);
}

