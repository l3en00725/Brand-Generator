import { GoogleGenerativeAI } from '@google/generative-ai';
import { svgArchitectSkill } from '@/lib/skills/svg-architect';
import { validateSvgStructure } from '@/lib/validation/svg';

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
}

/**
 * Generate a single SVG logo variation
 * Returns validated SVG string or null if all retries fail
 */
export async function generateSvgVariation(
  options: SvgGenerationOptions,
  retryCount = 0
): Promise<{ svg: string | null; errors: string[] }> {
  const maxRetries = 3;
  const errors: string[] = [];

  const model = genAI.getGenerativeModel({ model: MODEL });

  // Build prompt from logo direction + constraints
  const prompt = `Generate an SVG logo for "${options.brandName}", a ${options.industry} brand.

Logo direction: ${options.logoDirection}
Primary color: ${options.primaryColor}

${retryCount > 0 ? `Previous attempt failed. Reason: ${errors[errors.length - 1]}. Try again with a simpler, more geometric design.` : ''}`;

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
        return generateSvgVariation(options, retryCount + 1);
      }
      
      return { svg: null, errors };
    }

    return { svg, errors: [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Generation error: ${errorMessage}`);
    
    if (retryCount < maxRetries - 1) {
      return generateSvgVariation(options, retryCount + 1);
    }
    
    return { svg: null, errors };
  }
}

/**
 * Generate multiple SVG variations in parallel
 */
export async function generateSvgVariations(
  options: SvgGenerationOptions,
  count: number
): Promise<Array<{ svg: string | null; errors: string[] }>> {
  const promises = Array.from({ length: count }, () => generateSvgVariation(options));
  return Promise.all(promises);
}

