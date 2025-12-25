import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAllLogos } from '../services/openaiService';
import type { GenerateLogosRequest, GenerateLogosResponse, LogoOption } from '../types';
import { ANTI_MOCKUP_BLOCK, ANTI_VARIATION_BLOCK } from '../constants';

function enforceLogoConstraints(prompt: string): string {
  const withoutUrls = prompt.replace(/https?:\/\/\S+/g, '').trim();
  const withMockup = withoutUrls.includes('Flat logo mark only.')
    ? withoutUrls
    : `${withoutUrls}\n\n${ANTI_MOCKUP_BLOCK}`;
  return withMockup.includes('Single logo only.')
    ? withMockup
    : `${withMockup}\n\n${ANTI_VARIATION_BLOCK}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logoPrompts } = req.body as GenerateLogosRequest;

    if (!logoPrompts || !logoPrompts.A || !logoPrompts.B || !logoPrompts.C) {
      return res.status(400).json({ error: 'logoPrompts with A, B, C are required' });
    }

    const enforcedPrompts = {
      A: enforceLogoConstraints(logoPrompts.A),
      B: enforceLogoConstraints(logoPrompts.B),
      C: enforceLogoConstraints(logoPrompts.C),
    };

    // Generate all 3 logos in parallel
    const logos = await generateAllLogos(enforcedPrompts);

    // Format response with data URLs
    const options: LogoOption[] = [
      {
        id: 'A',
        imageUrl: `data:image/png;base64,${logos.A}`,
        prompt: enforcedPrompts.A
      },
      {
        id: 'B',
        imageUrl: `data:image/png;base64,${logos.B}`,
        prompt: enforcedPrompts.B
      },
      {
        id: 'C',
        imageUrl: `data:image/png;base64,${logos.C}`,
        prompt: enforcedPrompts.C
      }
    ];

    const response: GenerateLogosResponse = { options };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Generate logos API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate logos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

