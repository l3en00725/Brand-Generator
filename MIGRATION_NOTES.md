# Migration Notes

## Old Structure (Vite + React + Express)

The following files/directories are from the old architecture and should be removed after verifying the new Next.js structure works:

### To Remove (after testing):
- `api/` (old Vercel serverless functions - now in `src/app/api/`)
- `server.js` (old Express server - no longer needed)
- `vite.config.ts` (Vite config - Next.js handles this)
- `index.html` (Next.js uses `src/app/layout.tsx`)
- `App.tsx` (replaced by `src/app/page.tsx` and `src/app/create/page.tsx`)
- `index.tsx` (Next.js entry point is automatic)
- `components/` (old structure - new components in `src/components/`)
- `services/` (old AI services - new in `src/lib/ai/`)
- `constants.ts` (old constants - now in `src/lib/skills/`)
- `types.ts` (old types - now in `src/schemas/`)
- `vercel.json` (Next.js handles Vercel config automatically)

### Old Dependencies to Remove:
- `archiver` (asset ZIP - not in V1)
- `sharp` (asset processing - not in V1)
- `express` (old server - Next.js handles this)
- `cors` (not needed with Next.js API routes)
- `dotenv` (Next.js handles env vars)
- `openai` (switched to Claude + Gemini)
- `@vercel/node` (Next.js built-in)
- `@vitejs/plugin-react` (Next.js built-in)
- `vite` (Next.js built-in)

### New Dependencies:
- `next` (Next.js 15)
- `@ai-sdk/anthropic` (Vercel AI SDK for Claude)
- `@anthropic-ai/sdk` (Anthropic SDK - may not be needed if using @ai-sdk)
- `@google/generative-ai` (Gemini Flash)
- `ai` (Vercel AI SDK)
- `zod` (validation)
- `uuid` (variation IDs)

## Testing Checklist

Before removing old files:

1. ✅ New Next.js structure is created
2. ⏳ Install dependencies: `npm install`
3. ⏳ Set up `.env` file with API keys
4. ⏳ Test `/api/chat` endpoint
5. ⏳ Test `/api/generate` endpoint
6. ⏳ Test brand discovery flow
7. ⏳ Test logo generation flow
8. ⏳ Verify streaming works
9. ⏳ Verify validation works
10. ⏳ Remove old files

## Known Issues / TODOs

1. **Imagen PNG generation**: Currently placeholder. Need to implement Google Cloud Vertex AI Imagen API integration.
2. **Edge runtime**: Using `nodejs` runtime for now. Edge runtime may be possible with different SDK approach.
3. **Brand strategy extraction**: Currently extracts JSON from markdown code blocks in final message. Could be improved with structured outputs.

## Architecture Changes Summary

- **Old**: Vite + React + Express + OpenAI (GPT-4o + DALL-E 3)
- **New**: Next.js 15 + Claude (Sonnet 4) + Gemini (Flash) + Imagen

- **Old**: 3 logo options (A/B/C), full asset ZIP
- **New**: 3-8 logo variations (mixed SVG/PNG), single logo download (V1)

- **Old**: Synchronous generation
- **New**: Progressive streaming, parallel generation

