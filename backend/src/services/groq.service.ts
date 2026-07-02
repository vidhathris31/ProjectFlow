import { AppError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Thin wrapper around the Groq API (OpenAI-compatible chat completions).
 *
 * The API key is read exclusively from environment variables (GROQ_API_KEY)
 * and is never exposed to the frontend — all Groq calls are proxied through
 * this backend service so the key stays server-side.
 */

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Sends a prompt to the Groq API and returns the generated text.
 * Throws an AppError (which is caught by the global error handler) on failure,
 * so callers can stay simple and just `await` this function.
 *
 * Signature is unchanged from the old Gemini version, so callers
 * (e.g. ai.controller.ts) don't need to change how they invoke this.
 */
export const generateAIContent = async (
  systemInstruction: string,
  userPrompt: string,
  options: GroqGenerationOptions = {}
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    logger.error('GROQ_API_KEY is not configured in environment variables.');
    throw new AppError(
      'AI features are not configured on this server. Please set GROQ_API_KEY.',
      503
    );
  }

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt },
    ],
    temperature: options.temperature ?? 0.4,
    max_completion_tokens: options.maxOutputTokens ?? 2048,
  };

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    logger.error('Failed to reach Groq API', err as any);
    throw new AppError('Could not reach the AI service. Please try again shortly.', 502);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    logger.error(`Groq API error (${response.status}): ${errorText}`);
    throw new AppError('The AI service returned an error. Please try again.', 502);
  }

  const data: any = await response.json();

  const text: string | undefined = data?.choices?.[0]?.message?.content;

  if (!text) {
    const finishReason = data?.choices?.[0]?.finish_reason;
    if (finishReason && finishReason !== 'stop') {
      throw new AppError(`The AI could not process this request (${finishReason}).`, 422);
    }
    throw new AppError('The AI service returned an empty response. Please try again.', 502);
  }

  return text.trim();
};