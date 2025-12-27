# BrandForge AI - Branding Center

A Next.js 15 application that generates professional brand identities using AI-powered logo generation.

## Architecture

- **Next.js 15** (App Router) with TypeScript
- **Claude Sonnet 4** for brand strategy and discovery
- **Gemini 3.0 Flash** for SVG logo generation
- **Imagen** (placeholder) for PNG logo generation
- **Vercel AI SDK UI** for streaming responses
- **Zod** for validation and type safety

## Key Features

- Progressive streaming of brand discovery conversation
- Parallel SVG + PNG logo generation (3-8 variations)
- SVG validation with automatic retries
- Fail-open design (SVG failure never blocks PNG display)
- V1 scope: Logo variations only (no asset packs yet)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy `.env.example` to `.env`):
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=...
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (chat, generate)
│   ├── create/            # Main branding flow page
│   └── layout.tsx         # Root layout
├── components/
│   └── branding/          # Branding UI components
├── lib/
│   ├── ai/                # AI client wrappers (Claude, Gemini, Imagen)
│   ├── skills/            # Claude Skills (static prompts)
│   └── validation/        # Zod schemas and validators
└── schemas/               # Shared Zod schemas
```

## MCP Servers (Dev-Time Only)

MCP servers run locally via Cursor and are **never deployed to production**. See `docs/mcp-servers.md` for details.

## Rules of the System

1. **MCP is dev-time only** - Never import MCP clients in runtime code
2. **Skills are static strings** - No dynamic prompt composition
3. **Validation before trust** - All inputs/outputs validated with Zod
4. **Fail open, not closed** - Show partial results if available
5. **Stream everything** - Progressive rendering for perceived speed
6. **No state libraries** - Use URL state (nuqs) or component state only
7. **Zod is the schema language** - One schema per concept, shared client/server

## V1 Scope

- Brand discovery chat (3 questions)
- Brand strategy generation (palette, rationale, archetype)
- Logo variation generation (SVG + PNG, 3-8 variations)
- Download selected logo (SVG or PNG)

**Not included in V1:**
- Full asset packs (21-asset ZIP)
- Logo lockups (icon + name combinations)
- Social media assets
- Favicon generation

These will be added in V2+.

## License

Private project.
