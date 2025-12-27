/**
 * Streaming Utilities
 * 
 * Helper functions for working with streams in the AI SDK context.
 */

/**
 * Convert a string to a ReadableStream for AI SDK streaming
 */
export function stringToStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

/**
 * Combine multiple streams into one
 */
export function combineStreams(
  ...streams: ReadableStream<Uint8Array>[]
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for (const stream of streams) {
          const reader = stream.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            reader.releaseLock();
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

