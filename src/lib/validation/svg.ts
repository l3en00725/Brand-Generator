import { z } from 'zod';

// ============================================================================
// SVG Validation
// ============================================================================
// Lightweight validation: string checks + forbidden tags
// This runs server-side only (JSDOM not available in Edge runtime)

const FORBIDDEN_TAGS = ['defs', 'filter', 'clipPath', 'image', 'foreignObject', 'text'];
const MAX_SVG_LENGTH = 10000; // Complexity cap
const MIN_VECTOR_SHAPES = 2; // Avoid single-shape placeholders
const MIN_PATH_COMPLEXITY = 24; // Require at least one intentional path string length

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

  const shapeCount = (svgLower.match(/<(path|circle|rect|polygon|polyline|line|ellipse)[\s>]/g) || []).length;
  if (shapeCount < MIN_VECTOR_SHAPES) {
    return { valid: false, reason: 'SVG must use at least two vector shapes to avoid placeholder marks' };
  }

  // Require at least one custom path with meaningful commands
  const pathMatches = Array.from(svgLower.matchAll(/<path[^>]*d="([^"]+)"/g));
  if (pathMatches.length === 0) {
    return { valid: false, reason: 'SVG must include at least one custom <path> for intentional geometry' };
  }

  const hasComplexPath = pathMatches.some((match) => match[1].length >= MIN_PATH_COMPLEXITY && /[a-z]{2,}/i.test(match[1]));
  if (!hasComplexPath) {
    return { valid: false, reason: 'SVG paths are too simple—use layered commands, not single-line doodles' };
  }

  // Reject obvious placeholders
  if (/placeholder|lorem|dummy/.test(svgLower)) {
    return { valid: false, reason: 'SVG appears to contain placeholder content' };
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

