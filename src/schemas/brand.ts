import { z } from 'zod';

// ============================================================================
// Brand Strategy Schema
// ============================================================================

export const brandColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
});

export type BrandColors = z.infer<typeof brandColorsSchema>;

export const brandArchetypeSchema = z.enum([
  'sage',
  'hero',
  'creator',
  'caregiver',
  'explorer',
  'rebel',
  'lover',
  'jester',
  'innocent',
  'magician',
  'ruler',
  'oracle',
]);

export type BrandArchetype = z.infer<typeof brandArchetypeSchema>;

export const brandStrategySchema = z.object({
  brandName: z.string().min(1).max(100),
  industry: z.string().min(1).max(200),
  audience: z.string().min(1).max(200),
  archetype: brandArchetypeSchema,
  tone: z.enum(['professional', 'modern', 'bold']),
  tagline: z.string().min(1).max(100),
  rationale: z.string().min(10).max(500),
  colors: brandColorsSchema,
  logoDirection: z.string().min(10).max(300), // Abstract concept, not prompt
});

export type BrandStrategy = z.infer<typeof brandStrategySchema>;

// ============================================================================
// Logo Variation Schema
// ============================================================================

export const logoVariationStatusSchema = z.enum([
  'pending',
  'generating',
  'completed',
  'svg_failed',
  'png_failed',
  'failed',
]);

export type LogoVariationStatus = z.infer<typeof logoVariationStatusSchema>;

export const logoVariationSchema = z.object({
  id: z.string().uuid(),
  svg: z.string().optional(),
  pngUrl: z.string().url().optional(),
  status: logoVariationStatusSchema,
  errors: z.array(z.string()).optional(),
});

export type LogoVariation = z.infer<typeof logoVariationSchema>;

// ============================================================================
// API Request/Response Schemas
// ============================================================================

export const generateRequestSchema = z.object({
  strategy: brandStrategySchema,
  variationCount: z.number().int().min(3).max(8).default(5),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  variations: z.array(logoVariationSchema),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

