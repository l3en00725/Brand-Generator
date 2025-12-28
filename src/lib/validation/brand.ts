import { brandStrategyDraftSchema, brandStrategySchema } from '@/schemas/brand';

// Re-export brand schemas for validation
export { brandStrategySchema } from '@/schemas/brand';
export { brandStrategyDraftSchema } from '@/schemas/brand';

/**
 * Validates and parses brand strategy JSON
 * Returns validated strategy or throws ZodError
 */
export function validateBrandStrategy(data: unknown) {
  return brandStrategySchema.parse(data);
}

/**
 * Validates strategy drafts that do not yet include the visual style axis
 */
export function validateBrandStrategyDraft(data: unknown) {
  return brandStrategyDraftSchema.parse(data);
}

