
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for rendering
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Configure DOMPurify to only allow safe text content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
};

/**
 * Sanitizes node labels specifically
 * @param label - The node label to sanitize
 * @returns Sanitized label safe for rendering
 */
export const sanitizeNodeLabel = (label: string): string => {
  // Trim whitespace and sanitize
  const sanitized = sanitizeInput(label?.trim() || '');
  
  // Ensure we have a reasonable length limit
  return sanitized.length > 50 ? sanitized.substring(0, 50) + '...' : sanitized;
};
