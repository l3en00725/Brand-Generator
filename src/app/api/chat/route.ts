import { NextRequest } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from 'ai';
import { getMessageContent } from '@/lib/utils/ui-message';

/**
 * Chat API Route
 * 
 * Handles brand discovery conversation using Claude.
 * Streams responses progressively via Vercel AI SDK.
 * 
 * MCP NOTE: This route does NOT import or use MCP servers.
 * MCP is dev-time only. Skills are static strings compiled into prompts.
 */

// Note: Using nodejs runtime for Anthropic SDK compatibility
// Edge runtime may not support all Node.js APIs required by @anthropic-ai/sdk
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // DEMO MODE: Always return demo response for now (until API key is configured)
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages array', { status: 400 });
    }

    // Get the last user message to provide context-aware demo responses
    const lastUserMessage = messages.filter((m: UIMessage) => m.role === 'user').pop();
    const userText = lastUserMessage ? getMessageContent(lastUserMessage) : '';

    // Generate context-aware demo response
    let demoResponse = "That's a great name! Now, let me ask: Who is your target audience?";
    
    if (userText.toLowerCase().includes('audience') || userText.toLowerCase().includes('target')) {
      demoResponse = "Perfect! And what tone would you like your brand to convey? For example, professional and trustworthy, modern and innovative, friendly and approachable?";
    } else if (userText.toLowerCase().includes('tone') || userText.toLowerCase().includes('feel')) {
      demoResponse = "Excellent! Based on what you've shared, I'm generating your brand strategy and logo concepts. This will just take a moment...";
    }

    // Use the same UI-message protocol as the installed AI SDK client.
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute({ writer }) {
          writer.write({ type: 'text-start', id: 'demo-response' });
          writer.write({ type: 'text-delta', id: 'demo-response', delta: demoResponse });
          writer.write({ type: 'text-end', id: 'demo-response' });
        },
      }),
      headers: { 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
