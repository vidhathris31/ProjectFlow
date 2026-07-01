import { AppError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Thin wrapper around the Google Gemini generative language API.
 *
 * The API key is read exclusively from environment variables (GEMINI_API_KEY)
 * and is never exposed to the frontend — all Gemini calls are proxied through
 * this backend service so the key stays server-side.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Sends a prompt to the Gemini API and returns the generated text.
 * Throws an AppError (which is caught by the global error handler) on failure,
 * so callers can stay simple and just `await` this function.
 */
export const generateAIContent = async (
  systemInstruction: string,
  userPrompt: string,
  options: GeminiGenerationOptions = {}
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not configured in environment variables.');
    throw new AppError(
      'AI features are not configured on this server. Please set GEMINI_API_KEY.',
      503
    );
  }

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    logger.error('Failed to reach Gemini API', err as any);
    throw new AppError('Could not reach the AI service. Please try again shortly.', 502);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    logger.error(`Gemini API error (${response.status}): ${errorText}`);
    throw new AppError('The AI service returned an error. Please try again.', 502);
  }

  const data: any = await response.json();

  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text)
    .filter(Boolean)
    .join('\n');

  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) {
      throw new AppError(`The AI could not process this request (${blockReason}).`, 422);
    }
    throw new AppError('The AI service returned an empty response. Please try again.', 502);
  }

  return text.trim();
};
