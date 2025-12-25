import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAllLogos } from '../services/openaiService';
import type { GenerateLogosRequest, GenerateLogosResponse, LogoOption } from '../types';

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

    // Generate all 3 logos in parallel
    const logos = await generateAllLogos(logoPrompts);

    // Format response with data URLs
    const options: LogoOption[] = [
      {
        id: 'A',
        imageUrl: `data:image/png;base64,${logos.A}`,
        prompt: logoPrompts.A
      },
      {
        id: 'B',
        imageUrl: `data:image/png;base64,${logos.B}`,
        prompt: logoPrompts.B
      },
      {
        id: 'C',
        imageUrl: `data:image/png;base64,${logos.C}`,
        prompt: logoPrompts.C
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

