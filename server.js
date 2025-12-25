// Local development server for API routes
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// =============================================================================
// ANTI-MOCKUP CONSTRAINT BLOCK (MANDATORY FOR ALL LOGO PROMPTS)
// =============================================================================
const ANTI_MOCKUP_BLOCK = `
Flat logo mark only.
NO mockups.
NO paper, pens, desks, lighting, shadows, depth, or 3D effects.
NO gradients or textures.
NO background scenes.
Solid shapes only.
Vector-style appearance.
Designed to work at 24px.
Must look like a real SVG logo, not a rendered image.
Centered on a plain white background.`;

// =============================================================================
// LOGO PROMPT TEMPLATES (STRATEGIC DIFFERENTIATION)
// =============================================================================
const LOGO_PROMPT_RULES = `
LOGO PROMPT GENERATION RULES (CRITICAL - FOLLOW EXACTLY):

You must generate 3 DISTINCT logo prompts (A/B/C). Each must produce a flat, timeless, brand-ready logo mark.
These are NOT presentation mockups, NOT scenes, and NOT 3D renders.

IMPORTANT: Do NOT include any external inspiration links or URLs in prompts.

MANDATORY: Append this block verbatim to the END of every logo prompt:
${ANTI_MOCKUP_BLOCK}

GLOBAL PROMPT REQUIREMENTS (must appear in EACH prompt):
- Explicitly say: "Logo mark, not illustration"
- Explicitly describe shape logic with concrete primitives + alignment (e.g., "two circles overlapped 30%, cut by a 45° diagonal")
- Use SOLID FILLS ONLY (no strokes); crisp edges; consistent visual weight
- Explicitly include the brand primary color hex (e.g., "Using #1e3a5f as the primary color")
- Explicitly ban gradients, realism, textures, shadows, and 3D
- Limit palette: 2 colors max (primary + black). Background must remain white.
- Small-size rule: must remain legible at 24px; avoid thin details; avoid micro-gaps

OPTION A — ABSTRACT ICON (no letters):
- No letters, no initials, no text
- Simple geometric/symbolic form built from 2–4 primitives; strong silhouette
- Timeless, brand-agnostic, works as standalone app icon at 24px

OPTION B — LETTERMARK (initials only):
- Stylized initials only (1–3 letters max)
- Typography-driven with custom letterform modifications (cuts, joins, terminals, negative space)
- NO pictorial icons or motifs (no leaves/arrows/stars). Only letter shapes.
- No enclosing shapes unless essential to the letter construction

OPTION C — WORDMARK (full brand name):
- Full brand name only
- Clean modern typography with custom kerning and 1 subtle modification (optional)
- No tagline. No extra text. No separate icon.
- Optional: integrate a subtle symbol INTO a letter (no separate decorative icon)

OUTPUT FORMAT:
- Each prompt must be a single paragraph followed by the mandatory block.
`;

const GPT_SYSTEM_PROMPT = `You are BrandForge, a brand strategist AI. Your role is to gather requirements and produce a structured brand strategy with logo generation prompts.

CONVERSATION FLOW (STRICT - ONE QUESTION PER TURN):
Step 1: Ask for brand name and what the business does (industry/product).
Step 2: Ask about target audience (who are the customers?).
Step 3: Ask to choose ONE tone: "Professional & Trustworthy" OR "Modern & Bold".

After Step 3, output ONLY a JSON block with this exact structure:
\`\`\`json
{
  "brandName": "string",
  "industry": "string", 
  "audience": "string",
  "tone": "professional" | "modern",
  "tagline": "short tagline",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "logoPrompts": {
    "A": "Full DALL-E prompt for Abstract Icon option...",
    "B": "Full DALL-E prompt for Lettermark option...",
    "C": "Full DALL-E prompt for Wordmark option..."
  }
}
\`\`\`

${LOGO_PROMPT_RULES}

CONSTRAINTS:
- Ask ONE question at a time
- Keep responses concise (under 50 words per question)
- Do NOT explain your reasoning
- Do NOT suggest alternatives
- Do NOT output JSON until after Step 3 is answered
- Stay focused on brand requirements only`;

// Revision-specific system prompt
const REVISION_SYSTEM_PROMPT = `You are BrandForge, a brand strategist AI. The user has already created a brand and wants to revise it.

Given their revision request, generate an UPDATED brand strategy with the requested changes.

You MUST output a JSON block with this exact structure:
\`\`\`json
{
  "brandName": "string (keep the same name)",
  "industry": "string", 
  "audience": "string",
  "tone": "professional" | "modern",
  "tagline": "short tagline (can update)",
  "colors": {
    "primary": "#hex (update based on request)",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "logoPrompts": {
    "A": "Full DALL-E prompt for Abstract Icon option...",
    "B": "Full DALL-E prompt for Lettermark option...",
    "C": "Full DALL-E prompt for Wordmark option..."
  }
}
\`\`\`

${LOGO_PROMPT_RULES}

REVISION RULES:
- Keep the brand name the same
- Update colors/tone/style based on the revision request
- Generate NEW logo prompts that reflect the requested changes
- Include a brief acknowledgment of the changes before the JSON block

Be creative with the revision - interpret the user's request and make meaningful changes to the brand aesthetic.`;

// Helper to extract JSON from response
function extractJsonFromResponse(text) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      return null;
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Detect step from messages
function detectStep(messages) {
  const userMessages = messages.filter(m => m.role === 'user').length;
  if (userMessages === 0) return 1;
  if (userMessages === 1) return 2;
  if (userMessages === 2) return 3;
  return 4;
}

// =============================================================================
// Enforce anti-mockup constraints on prompts before sending to DALL-E
// =============================================================================
function enforceLogoConstraints(prompt) {
  // Always append the anti-mockup block if not already present
  if (!prompt.includes('Flat logo mark only')) {
    prompt = prompt + '\n\n' + ANTI_MOCKUP_BLOCK;
  }
  return prompt;
}

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, isRevision } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Use different system prompt for revisions
    const systemPrompt = isRevision ? REVISION_SYSTEM_PROMPT : GPT_SYSTEM_PROMPT;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const reply = response.choices[0].message.content || '';
    const step = detectStep(messages);
    const brandStrategy = extractJsonFromResponse(reply);
    const readyForLogos = brandStrategy !== null;

    res.json({
      reply,
      step: readyForLogos ? 4 : step,
      brandStrategy,
      readyForLogos
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

// POST /api/generate-logos
app.post('/api/generate-logos', async (req, res) => {
  try {
    const { logoPrompts } = req.body;

    if (!logoPrompts || !logoPrompts.A || !logoPrompts.B || !logoPrompts.C) {
      return res.status(400).json({ error: 'logoPrompts with A, B, C are required' });
    }

    console.log('Generating logos with flat/SVG-ready constraints...');

    // Enforce anti-mockup constraints on all prompts
    const promptA = enforceLogoConstraints(logoPrompts.A);
    const promptB = enforceLogoConstraints(logoPrompts.B);
    const promptC = enforceLogoConstraints(logoPrompts.C);

    console.log('Option A prompt:', promptA.substring(0, 100) + '...');
    console.log('Option B prompt:', promptB.substring(0, 100) + '...');
    console.log('Option C prompt:', promptC.substring(0, 100) + '...');

    // Generate all 3 logos in parallel
    const [logoA, logoB, logoC] = await Promise.all([
      openai.images.generate({
        model: 'dall-e-3',
        prompt: promptA,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json'
      }),
      openai.images.generate({
        model: 'dall-e-3',
        prompt: promptB,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json'
      }),
      openai.images.generate({
        model: 'dall-e-3',
        prompt: promptC,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json'
      })
    ]);

    const options = [
      {
        id: 'A',
        label: 'Abstract Icon',
        imageUrl: `data:image/png;base64,${logoA.data[0].b64_json}`,
        prompt: promptA
      },
      {
        id: 'B',
        label: 'Lettermark',
        imageUrl: `data:image/png;base64,${logoB.data[0].b64_json}`,
        prompt: promptB
      },
      {
        id: 'C',
        label: 'Wordmark',
        imageUrl: `data:image/png;base64,${logoC.data[0].b64_json}`,
        prompt: promptC
      }
    ];

    console.log('Logos generated successfully (flat/SVG-ready style)');
    res.json({ options });
  } catch (error) {
    console.error('Generate logos API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate logos',
      details: error.message
    });
  }
});

// POST /api/generate-assets (simplified - just returns the logo for now)
app.post('/api/generate-assets', async (req, res) => {
  try {
    const { selectedOption, logoBase64, brandStrategy } = req.body;

    if (!selectedOption || !logoBase64 || !brandStrategy) {
      return res.status(400).json({ 
        error: 'selectedOption, logoBase64, and brandStrategy are required' 
      });
    }

    // For local dev, we'll create a simple ZIP with just the logo
    // Full asset generation requires Sharp which needs native bindings
    
    const archiver = (await import('archiver')).default;
    const { Writable } = await import('stream');
    
    const chunks = [];
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });

    writableStream.on('finish', () => {
      const zipBuffer = Buffer.concat(chunks);
      const filename = `${brandStrategy.brandName.toLowerCase().replace(/\s+/g, '-')}-brand-assets.zip`;
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', zipBuffer.length);
      res.send(zipBuffer);
    });

    archive.pipe(writableStream);

    // Add logo
    const cleanBase64 = logoBase64.replace(/^data:image\/png;base64,/, '');
    archive.append(Buffer.from(cleanBase64, 'base64'), { name: 'logos/logo.png' });
    
    // Add colors.json
    archive.append(JSON.stringify(brandStrategy.colors, null, 2), { name: 'metadata/colors.json' });
    
    // Add README
    const readme = `${brandStrategy.brandName} Brand Assets
========================
Generated by BrandForge AI

Note: This is a development build with limited assets.
Deploy to Vercel for full asset generation.
`;
    archive.append(readme, { name: 'README.txt' });

    archive.finalize();
  } catch (error) {
    console.error('Generate assets API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate assets',
      details: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Make sure your .env file has OPENAI_API_KEY set');
});
