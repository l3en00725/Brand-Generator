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

const ANTI_VARIATION_BLOCK = `
Single logo only.
NO icon sets.
NO multiple marks.
NO extra symbols.
NO alternative concepts shown.
NO labels like "Option A/B/C".
NO borders, frames, badges, or app tiles.
Plain white background only.`;

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
- No “presentation elements”: no extra icons, no icon rows, no example lockups, no tool illustrations

OPTION A — ABSTRACT ICON (no letters):
- No letters, no initials, no text
- Simple geometric/symbolic form built from 2–4 primitives; strong silhouette
- Timeless, brand-agnostic, works as standalone app icon at 24px
- Avoid literal object pictograms (no tools, no pencils, no wrenches, no rakes)

OPTION B — LETTERMARK (initials only):
- Stylized initials only (1–3 letters max)
- Typography-driven with custom letterform modifications (cuts, joins, terminals, negative space)
- NO pictorial icons or motifs (no leaves/arrows/stars). Only letter shapes.
- No enclosing shapes unless essential to the letter construction
- NO extra words (no industry descriptors like "PLUMBING"). Initials only.

OPTION C — WORDMARK (full brand name):
- DO NOT render any text in the image (we will typeset the wordmark in code to avoid misspellings)
- Generate a clean companion symbol intended to sit left of the brand name in a lockup
- Same flat constraints: solid fills only; 24px legibility; 2-color max

OUTPUT FORMAT:
- Each prompt must be a single paragraph followed by the mandatory block and then:
${ANTI_VARIATION_BLOCK}
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

// POST /api/generate-assets (local dev: FULL asset package ZIP)
app.post('/api/generate-assets', async (req, res) => {
  try {
    const { selectedOption, logoBase64, brandStrategy, revision } = req.body;

    if (!selectedOption || !logoBase64 || !brandStrategy) {
      return res.status(400).json({ 
        error: 'selectedOption, logoBase64, and brandStrategy are required' 
      });
    }

    const sharp = (await import('sharp')).default;
    const archiver = (await import('archiver')).default;
    const { Writable } = await import('stream');

    let finalStrategy = { ...brandStrategy };
    if (revision?.type === 'color' && revision?.shade) {
      finalStrategy = {
        ...finalStrategy,
        colors: {
          ...finalStrategy.colors,
          primary: adjustHexColor(finalStrategy.colors.primary, revision.shade),
        }
      };
    }

    const cleanBase64 = logoBase64.replace(/^data:image\/png;base64,/, '');
    const logoBuffer = Buffer.from(cleanBase64, 'base64');

    const assets = new Map();

    // LOGOS
    assets.set('logos/logo.png', await resizeContain(sharp, logoBuffer, 512, 512));
    assets.set('logos/logo-transparent.png', await removeWhiteBg(sharp, logoBuffer));
    assets.set('logos/logo-dark.png', await addBg(sharp, logoBuffer, '#1a1a1a'));
    assets.set('logos/logo-light.png', await addBg(sharp, logoBuffer, '#ffffff'));
    assets.set('logos/logo@2x.png', await resizeContain(sharp, logoBuffer, 1024, 1024));
    assets.set('logos/logo@4x.png', await resizeContain(sharp, logoBuffer, 2048, 2048));

    // SOCIAL (includes icon + brand name + subcopy)
    assets.set('social/open-graph.png', await createSocial(sharp, logoBuffer, 1200, 630, finalStrategy));
    assets.set('social/x-header.png', await createSocial(sharp, logoBuffer, 1500, 500, finalStrategy));
    assets.set('social/linkedin-banner.png', await createSocial(sharp, logoBuffer, 1584, 396, finalStrategy));
    assets.set('social/instagram-profile.png', await resizeContain(sharp, logoBuffer, 320, 320));

    // ICONS
    for (const size of [16, 32, 64, 128, 256]) {
      assets.set(`icons/favicon-${size}.png`, await resizeContain(sharp, logoBuffer, size, size));
    }
    assets.set('icons/app-icon-1024.png', await resizeContain(sharp, logoBuffer, 1024, 1024));

    // METADATA
    assets.set('metadata/colors.json', Buffer.from(JSON.stringify(finalStrategy.colors, null, 2)));
    assets.set('metadata/fonts.txt', Buffer.from('Heading: Inter\nBody: Inter'));
    assets.set('metadata/README.txt', Buffer.from(generateReadme(finalStrategy.brandName)));

    // ZIP archive
    const chunks = [];
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => { throw err; });
    archive.pipe(writableStream);

    for (const [path, buffer] of assets.entries()) {
      archive.append(buffer, { name: path });
    }

    writableStream.on('finish', () => {
      const zipBuffer = Buffer.concat(chunks);
      const filename = `${sanitizeFilename(finalStrategy.brandName)}-brand-assets.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', zipBuffer.length);
      res.send(zipBuffer);
    });

    await archive.finalize();
  } catch (error) {
    console.error('Generate assets API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate assets',
      details: error.message
    });
  }
});

function sanitizeFilename(name) {
  return String(name || 'brand')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function adjustHexColor(hex, shade) {
  const cleanHex = String(hex || '#000000').replace('#', '');
  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);
  const factor = shade === 'lighter' ? 1.2 : 0.8;
  r = Math.min(255, Math.round(r * factor));
  g = Math.min(255, Math.round(g * factor));
  b = Math.min(255, Math.round(b * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

async function resizeContain(sharpLib, buffer, width, height) {
  return sharpLib(buffer)
    .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
}

async function removeWhiteBg(sharpLib, buffer) {
  const { data, info } = await sharpLib(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) data[i + 3] = 0;
  }

  return sharpLib(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function addBg(sharpLib, buffer, color) {
  const meta = await sharpLib(buffer).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;
  const hex = String(color || '#ffffff').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return sharpLib({ create: { width, height, channels: 4, background: { r, g, b, alpha: 1 } } })
    .composite([{ input: buffer, gravity: 'center' }])
    .png()
    .toBuffer();
}

function escapeXml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function socialSubcopy(strategy) {
  const tagline = String(strategy?.tagline || '').trim();
  if (tagline) return tagline;
  const industry = String(strategy?.industry || '').trim();
  const audience = String(strategy?.audience || '').trim();
  if (industry && audience) return `${industry} for ${audience}`.slice(0, 72);
  if (industry) return industry.slice(0, 72);
  if (audience) return `For ${audience}`.slice(0, 72);
  return 'Professional services, delivered.';
}

async function createSocial(sharpLib, logoBuffer, width, height, strategy) {
  const brandName = String(strategy?.brandName || 'Brand').trim();
  const subcopy = socialSubcopy(strategy);
  const primary = String(strategy?.colors?.primary || '#0ea5e9');
  const hex = primary.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const paddingX = Math.round(width * 0.08);
  const iconSize = Math.min(Math.round(height * 0.42), 220);
  const iconLeft = paddingX;
  const iconTop = Math.round((height - iconSize) / 2);
  const textLeft = iconLeft + iconSize + Math.round(width * 0.04);

  const resizedLogo = await sharpLib(logoBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  const titleSize = Math.max(40, Math.round(height * 0.10));
  const subSize = Math.max(20, Math.round(height * 0.05));
  const accentW = Math.min(240, Math.round(width * 0.22));
  const accentH = 10;
  const accentY = iconTop + iconSize + 36;

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .title { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; font-weight: 700; fill: #0B1220; }
      .sub { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; font-weight: 400; fill: #475569; }
    </style>
    <text x="${textLeft}" y="${iconTop + Math.round(titleSize * 1.2)}" class="title" font-size="${titleSize}">
      ${escapeXml(brandName)}
    </text>
    <text x="${textLeft}" y="${iconTop + Math.round(titleSize * 1.2) + Math.round(subSize * 1.6)}" class="sub" font-size="${subSize}">
      ${escapeXml(subcopy).slice(0, 72)}
    </text>
    <rect x="${iconLeft}" y="${accentY}" width="${accentW}" height="${accentH}" fill="rgb(${r},${g},${b})" />
  </svg>`;

  return sharpLib({ create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([
      { input: resizedLogo, left: iconLeft, top: iconTop },
      { input: Buffer.from(svg), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

function generateReadme(brandName) {
  return `${brandName} Brand Assets
========================

LOGOS/
- logo.png: Standard logo (512x512)
- logo-transparent.png: Transparent background version
- logo-dark.png: For use on dark backgrounds
- logo-light.png: For use on light backgrounds
- logo@2x.png: High resolution (1024x1024)
- logo@4x.png: Extra high resolution (2048x2048)

SOCIAL/
- open-graph.png: Website sharing preview (1200x630)
- x-header.png: X/Twitter header (1500x500)
- linkedin-banner.png: LinkedIn banner (1584x396)
- instagram-profile.png: Instagram profile (320x320)

ICONS/
- favicon-16/32/64/128/256.png: Website favicons
- app-icon-1024.png: App store icon

METADATA/
- colors.json: Brand color palette (HEX values)
- fonts.txt: Recommended fonts
- README.txt: This file

Generated by BrandForge AI
`;
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Make sure your .env file has OPENAI_API_KEY set');
});
