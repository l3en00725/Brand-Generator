import { brandStrategySchema } from '@/schemas/brand';

// Re-export brand schemas for validation
export { brandStrategySchema } from '@/schemas/brand';

/**
 * Validates and parses brand strategy JSON
 * Returns validated strategy or throws ZodError
 */
export function validateBrandStrategy(data: unknown) {
  return brandStrategySchema.parse(data);
}

