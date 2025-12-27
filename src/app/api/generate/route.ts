import { NextRequest } from 'next/server';
import { generateRequestSchema, GenerateRequest } from '@/schemas/brand';
import { generateLogoVariations } from '@/lib/ai/orchestrator';
import { validateBrandStrategy } from '@/lib/validation/brand';

/**
 * Generate API Route
 * 
 * Generates logo variations (SVG + PNG) in parallel.
 * Returns variations progressively as they complete.
 * 
 * MCP NOTE: This route does NOT import or use MCP servers.
 * Generation logic is deterministic server code only.
 */

export const runtime = 'nodejs'; // Node runtime for Gemini/Imagen APIs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validated = generateRequestSchema.safeParse(body);
    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: validated.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { strategy, variationCount } = validated.data;

    // Validate brand strategy
    try {
      validateBrandStrategy(strategy);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid brand strategy', details: error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate variations in parallel
    const variations = await generateLogoVariations({
      strategy,
      variationCount,
    });

    return new Response(
      JSON.stringify({ variations }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Generate API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate logos',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

