import { UIMessage } from '@ai-sdk/react';
import { isTextUIPart } from 'ai';

/**
 * Extract text content from a UIMessage
 * UIMessage uses a parts array in v6, but we provide a compatibility helper
 */
export function getMessageContent(message: UIMessage): string {
  // If message has a content property (compatibility layer), use it
  if ('content' in message && typeof message.content === 'string') {
    return message.content;
  }

  // Otherwise, extract text from parts array
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter(isTextUIPart)
      .map((part) => {
        if ('text' in part && typeof part.text === 'string') {
          return part.text;
        }
        return '';
      })
      .join('');
  }

  return '';
}

