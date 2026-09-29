/**
 * AI Security & Anti-Hallucination Sanitization Utilities
 *
 * Provides:
 * 1. Prompt Injection Defenses: Neutralizes delimiter escapes, instruction overrides,
 *    and system-role hijacking.
 * 2. Input Cleansing: Strips malicious control characters and HTML/script tags.
 * 3. Output Sanitization: Neutralizes potential XSS/HTML payloads before UI presentation.
 */

// Known prompt injection and delimiter hijacking signatures
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /you\s+are\s+now\s+(a|an|the|in)\s+/gi,
  /system\s*:\s*/gi,
  /<\s*\|\s*im_start\s*\|\s*>/gi,
  /<\s*\|\s*im_end\s*\|\s*>/gi,
  /\[\s*INST\s*\]/gi,
  /\[\s*\/\s*INST\s*\]/gi,
  /<<\s*SYS\s*>>/gi,
  /<<\s*\/\s*SYS\s*>>/gi,
  /---\s*BEGIN\s+SYSTEM/gi,
  /---\s*END\s+SYSTEM/gi,
  /format\s+your\s+response\s+as\s+system/gi,
  /repeat\s+(the\s+)?(prompt|system\s+prompt|instructions)/gi,
  /reveal\s+(your\s+)?(prompt|instructions|system\s+message)/gi,
];

/**
 * Sanitizes and neutralizes user-supplied prompts before passing them to the LLM.
 *
 * @param input - The raw user-supplied string
 * @param maxLength - Maximum permitted character length (default 2000)
 * @returns Cleaned and sanitized prompt string
 */
export function sanitizePromptInput(input: string, maxLength: number = 2000): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // 1. Enforce length limit
  let sanitized = input.slice(0, maxLength);

  // 2. Remove non-printable control characters & null bytes (preserving standard whitespace & newlines)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 3. Strip HTML / script / iframe / style tags
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, " ");

  // 4. Neutralize known jailbreak & prompt injection vectors with benign placeholders
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[sanitized-instruction]");
  }

  // 5. Normalize whitespace
  return sanitized.trim();
}

/**
 * Sanitizes model-generated output strings before returning them to client applications
 * to guarantee that LLM output cannot execute malicious script or HTML in user browsers.
 *
 * @param text - The output string from the AI model
 * @returns Escaped and sanitized string safe for DOM presentation
 */
export function sanitizeOutputString(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/javascript\s*:/gi, "blocked-script:")
    .replace(/data\s*:\s*text\/html/gi, "blocked-html:");
}

/**
 * Validates that an identifier strictly exists within an approved whitelist set.
 * Prevents catalog hallucination where the LLM invents non-existent equipment or soundstages.
 */
export function validateCatalogId<T extends string>(
  candidateId: string,
  validIds: readonly T[],
  fallbackId: T
): T {
  if (validIds.includes(candidateId as T)) {
    return candidateId as T;
  }
  return fallbackId;
}
