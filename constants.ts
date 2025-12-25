export const GPT_MODEL = 'gpt-4o';
export const DALLE_MODEL = 'dall-e-3';

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

LOGO PROMPT RULES (CRITICAL FOR DALL-E 3):
- Each prompt MUST include: "minimalist logo design, solid white background, centered composition, high contrast, vector-style, professional branding"
- Option A: Icon-based (abstract geometric symbol representing the industry)
- Option B: Lettermark (stylized initials or monogram of the brand name)
- Option C: Wordmark (the brand name with a subtle integrated icon element)
- Include the brand's primary color explicitly in each prompt (e.g., "using navy blue #1e3a5f")
- Include the brand name in prompts B and C
- NO human faces, NO photorealistic elements, NO complex illustrations, NO gradients
- NO text that says "logo" or "brand" - just the actual brand name/initials

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
