export const GPT_MODEL = 'gpt-4o';
export const DALLE_MODEL = 'dall-e-3';

// =============================================================================
// LOGO PROMPTING (V1) - Flat, SVG-ready, anti-mockup constraints
// =============================================================================
export const ANTI_MOCKUP_BLOCK = `Flat logo mark only.
NO mockups.
NO paper, pens, desks, lighting, shadows, depth, or 3D effects.
NO gradients or textures.
NO background scenes.
Solid shapes only.
Vector-style appearance.
Designed to work at 24px.
Must look like a real SVG logo, not a rendered image.
Centered on a plain white background.`;

// Additional guardrails (we still append ANTI_MOCKUP_BLOCK verbatim as required)
export const ANTI_VARIATION_BLOCK = `Single logo only.
NO icon sets.
NO multiple marks.
NO extra symbols.
NO alternative concepts shown.
NO labels like "Option A/B/C".
NO borders, frames, badges, or app tiles.
Plain white background only.`;

export const LOGO_PROMPT_RULES = `LOGO PROMPT GENERATION RULES (CRITICAL - FOLLOW EXACTLY):

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

OPTION C — WORDMARK (text rendered by code; image must be icon-only):
- DO NOT render any text in the image (we will typeset the wordmark in code to avoid misspellings)
- Generate a clean companion symbol intended to sit left of the brand name in a lockup
- Same flat constraints: solid fills only; 24px legibility; 2-color max

OUTPUT FORMAT:
- Each prompt must be a single paragraph followed by the mandatory block and then:
${ANTI_VARIATION_BLOCK}`;

export const GPT_SYSTEM_PROMPT = `You are BrandForge, a brand strategist AI. Your role is to gather requirements and produce a structured brand strategy with logo generation prompts.

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
    "A": "Detailed DALL-E prompt for option A...",
    "B": "Detailed DALL-E prompt for option B...",
    "C": "Detailed DALL-E prompt for option C..."
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

export const INITIAL_MESSAGE = "Welcome to BrandForge! I'll help you create a complete brand identity. Let's start — what's your brand name, and what does your business do?";

// Asset file list for preview
export const ASSET_MANIFEST = {
  logos: [
    { name: 'logo.png', description: 'Standard logo (512×512)' },
    { name: 'logo-transparent.png', description: 'Transparent background' },
    { name: 'logo-dark.png', description: 'For dark backgrounds' },
    { name: 'logo-light.png', description: 'For light backgrounds' },
    { name: 'logo@2x.png', description: 'High resolution (1024×1024)' },
    { name: 'logo@4x.png', description: 'Extra high resolution (2048×2048)' },
  ],
  social: [
    { name: 'open-graph.png', description: 'Website sharing (1200×630)' },
    { name: 'x-header.png', description: 'X/Twitter header (1500×500)' },
    { name: 'linkedin-banner.png', description: 'LinkedIn banner (1584×396)' },
    { name: 'instagram-profile.png', description: 'Instagram profile (320×320)' },
  ],
  icons: [
    { name: 'favicon-16.png', description: '16×16 favicon' },
    { name: 'favicon-32.png', description: '32×32 favicon' },
    { name: 'favicon-64.png', description: '64×64 favicon' },
    { name: 'favicon-128.png', description: '128×128 favicon' },
    { name: 'favicon-256.png', description: '256×256 favicon' },
    { name: 'app-icon-1024.png', description: 'App store icon (1024×1024)' },
  ],
  metadata: [
    { name: 'colors.json', description: 'Brand color palette' },
    { name: 'fonts.txt', description: 'Recommended fonts' },
    { name: 'README.txt', description: 'Usage guide' },
  ],
};
