import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chat, extractJsonFromResponse, detectStep } from '../services/openaiService';
import type { ChatRequest, ChatResponse, Message } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Get response from GPT-4o
    const reply = await chat(messages);

    // Detect current step
    const step = detectStep(messages);

    // Check if response contains brand strategy JSON
    const brandStrategy = extractJsonFromResponse(reply);
    const readyForLogos = brandStrategy !== null;

    const response: ChatResponse = {
      reply,
      step: readyForLogos ? 4 : step,
      brandStrategy,
      readyForLogos
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

