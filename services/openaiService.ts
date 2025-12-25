import OpenAI from 'openai';
import { GPT_MODEL, DALLE_MODEL, GPT_SYSTEM_PROMPT, ANTI_MOCKUP_BLOCK, ANTI_VARIATION_BLOCK } from '../constants';
import type { Message, BrandStrategy } from '../types';

// Initialize OpenAI client
const getOpenAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
};

// ============================================
// CHAT COMPLETION (Brand Strategy)
// ============================================
export async function chat(messages: Message[]): Promise<string> {
  const openai = getOpenAIClient();
  
  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    messages: [
      { role: 'system', content: GPT_SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ],
    temperature: 0.7,
    max_tokens: 1500
  });
  
  return response.choices[0].message.content || '';
}

// ============================================
// IMAGE GENERATION (Logos)
// ============================================
export async function generateLogo(prompt: string): Promise<string> {
  const openai = getOpenAIClient();
  
  // Safety nets: never trust the LLM to fully comply.
  // 1) Strip URLs if they appear (external inspiration links cause "scene" outputs).
  // 2) Ensure the hard anti-mockup block is present verbatim.
  // 3) Ensure the "no icon sets / no multiple marks" block is present.
  const withoutUrls = prompt.replace(/https?:\/\/\S+/g, '').trim();
  const withMockupBlock = withoutUrls.includes('Flat logo mark only.')
    ? withoutUrls
    : `${withoutUrls}\n\n${ANTI_MOCKUP_BLOCK}`;
  const finalPrompt = withMockupBlock.includes('Single logo only.')
    ? withMockupBlock
    : `${withMockupBlock}\n\n${ANTI_VARIATION_BLOCK}`;

  const response = await openai.images.generate({
    model: DALLE_MODEL,
    prompt: finalPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    // Slightly reduces "stylized" / mockup-y tendencies vs vivid.
    style: 'natural',
    response_format: 'b64_json'
  });
  
  const base64 = response.data[0].b64_json;
  if (!base64) {
    throw new Error('No image data returned from DALL-E');
  }
  
  return base64;
}

export async function generateAllLogos(prompts: { A: string; B: string; C: string }): Promise<{
  A: string;
  B: string;
  C: string;
}> {
  // Parallel generation for speed
  const [logoA, logoB, logoC] = await Promise.all([
    generateLogo(prompts.A),
    generateLogo(prompts.B),
    generateLogo(prompts.C)
  ]);
  
  return {
    A: logoA,
    B: logoB,
    C: logoC
  };
}

// ============================================
// HELPERS
// ============================================
export function extractJsonFromResponse(text: string): BrandStrategy | null {
  // Try to find JSON in markdown code block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]) as BrandStrategy;
    } catch (e) {
      console.error('Failed to parse JSON from response:', e);
      return null;
    }
  }
  
  // Try to parse the whole response as JSON
  try {
    return JSON.parse(text) as BrandStrategy;
  } catch {
    return null;
  }
}

export function detectStep(messages: Message[]): 1 | 2 | 3 | 4 {
  // Count user messages to determine step
  const userMessages = messages.filter(m => m.role === 'user').length;
  
  if (userMessages === 0) return 1;
  if (userMessages === 1) return 2;
  if (userMessages === 2) return 3;
  return 4; // After step 3 answer, we generate brand strategy
}

