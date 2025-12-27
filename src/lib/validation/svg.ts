import { z } from 'zod';

// ============================================================================
// SVG Validation
// ============================================================================
// Lightweight validation: string checks + forbidden tags
// This runs server-side only (JSDOM not available in Edge runtime)

const FORBIDDEN_TAGS = ['defs', 'filter', 'clipPath', 'image', 'foreignObject'];
const MAX_SVG_LENGTH = 10000; // Complexity cap

/**
 * Validates SVG structure without full DOM parsing (Edge-compatible).
 * Checks for viewBox, forbidden tags, and length constraints.
 */
export function validateSvgStructure(svg: string): {
  valid: boolean;
  reason?: string;
} {
  // Basic checks
  if (!svg || typeof svg !== 'string') {
    return { valid: false, reason: 'SVG must be a non-empty string' };
  }

  if (svg.length > MAX_SVG_LENGTH) {
    return { valid: false, reason: `SVG exceeds ${MAX_SVG_LENGTH} character limit` };
  }

  // Check for required viewBox
  if (!svg.includes('viewBox="0 0 512 512"')) {
    return { valid: false, reason: 'SVG must have viewBox="0 0 512 512"' };
  }

  // Check for forbidden tags (case-insensitive)
  const svgLower = svg.toLowerCase();
  for (const tag of FORBIDDEN_TAGS) {
    const tagRegex = new RegExp(`<${tag}[\\s>]`, 'i');
    if (tagRegex.test(svgLower)) {
      return { valid: false, reason: `SVG contains forbidden tag: <${tag}>` };
    }
  }

  // Check for <svg> root element
  if (!/<svg[\s>]/.test(svg)) {
    return { valid: false, reason: 'SVG must have <svg> root element' };
  }

  return { valid: true };
}

/**
 * Zod schema for SVG validation (for API validation)
 */
export const svgSchema = z.string().refine(
  (svg) => validateSvgStructure(svg).valid,
  (svg) => {
    const result = validateSvgStructure(svg);
    return { message: result.reason || 'Invalid SVG structure' };
  }
);

