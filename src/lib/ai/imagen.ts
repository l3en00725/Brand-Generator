/**
 * Imagen PNG Generation
 * 
 * Generates PNG logo variations using Google Vertex AI Imagen.
 * PNGs are the reliability anchor - they guarantee visual quality.
 * 
 * AUTHENTICATION:
 * - Uses service account authentication via GOOGLE_APPLICATION_CREDENTIALS_JSON
 * - Credentials are parsed from environment variable (full JSON string)
 * - This avoids OAuth flows and user consent screens
 * - Service account has Vertex AI User role
 * 
 * WHY VERTEX AI (not Gemini API):
 * - Imagen is part of Vertex AI, not the Gemini API
 * - Vertex AI provides unified access to Google's AI models including Imagen
 * - Service account auth is required for server-side applications
 * 
 * WHY PNG IS THE RELIABILITY LAYER:
 * - SVG generation (via Gemini) is experimental and may fail validation
 * - PNG generation via Imagen is production-grade and reliable
 * - PNG failure should be rare, but if it happens, we still show SVG if available
 */

import { GoogleAuth } from 'google-auth-library';

export interface PngGenerationOptions {
  brandName: string;
  logoDirection: string;
  primaryColor: string;
  industry: string;
}

/**
 * Get authenticated Google Auth client
 * Uses service account credentials from environment variable
 */
function getGoogleAuthClient(): GoogleAuth {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
  }

  // Parse service account credentials from JSON string
  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS_JSON must be valid JSON. ' +
      'Expected full service account JSON object as a string.'
    );
  }

  return new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
}

/**
 * Build Imagen prompt for logo generation
 * Keeps prompt minimal and brand-safe (logo, flat, vector-like, white background)
 */
function buildLogoPrompt(options: PngGenerationOptions): string {
  const { brandName, logoDirection, primaryColor, industry } = options;

  return `A minimalist, professional logo mark for "${brandName}", a ${industry} brand. ${logoDirection}. Flat design, vector-style appearance, solid shapes only. Primary color: ${primaryColor}. White background. Clean and simple, designed to work at small sizes. No gradients, shadows, or 3D effects.`;
}

/**
 * Generate a PNG logo variation using Vertex AI Imagen
 * Uses REST API to call Imagen 3 model
 * Returns base64-encoded PNG image data URL
 */
export async function generatePngVariation(
  options: PngGenerationOptions
): Promise<{ pngUrl: string | null; errors: string[] }> {
  try {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_VERTEX_REGION || 'us-central1';

    if (!projectId) {
      throw new Error('GOOGLE_PROJECT_ID environment variable is required');
    }

    const auth = getGoogleAuthClient();
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token from service account');
    }

    const prompt = buildLogoPrompt(options);

    // Vertex AI Imagen 3 endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

    // Generate image using Imagen REST API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1', // Square for logos
          safetyFilterLevel: 'block_some',
          personGeneration: 'dont_allow',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagen API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();

    // Extract base64 image data from response
    // Imagen returns images in predictions array with bytesBase64Encoded field
    const predictions = responseData.predictions;
    if (!predictions || predictions.length === 0) {
      return {
        pngUrl: null,
        errors: ['Imagen returned no image predictions'],
      };
    }

    // Get the first image (Imagen returns base64 encoded PNG)
    const prediction = predictions[0];
    
    // The response structure: prediction.bytesBase64Encoded or nested in structValue
    let base64Data: string | undefined;
    
    if (prediction.bytesBase64Encoded) {
      base64Data = prediction.bytesBase64Encoded;
    } else if (prediction.structValue?.fields?.bytesBase64Encoded?.stringValue) {
      base64Data = prediction.structValue.fields.bytesBase64Encoded.stringValue;
    }

    if (!base64Data) {
      return {
        pngUrl: null,
        errors: ['Imagen response missing base64 image data'],
      };
    }

    // Return as data URL for easy use in frontend
    const pngUrl = `data:image/png;base64,${base64Data}`;

    return {
      pngUrl,
      errors: [],
    };
  } catch (error) {
    // Fail open: log error but don't crash
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Imagen PNG generation error:', errorMessage);

    return {
      pngUrl: null,
      errors: [`Imagen generation failed: ${errorMessage}`],
    };
  }
}

/**
 * Generate multiple PNG variations in parallel
 * Each variation is independent, so failures don't cascade
 */
export async function generatePngVariations(
  options: PngGenerationOptions,
  count: number
): Promise<Array<{ pngUrl: string | null; errors: string[] }>> {
  const promises = Array.from({ length: count }, () => generatePngVariation(options));
  return Promise.all(promises);
}
