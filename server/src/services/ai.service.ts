import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

interface AICompletionInput {
  system: string;
  prompt: string;
  maxTokens?: number;
}

async function callAnthropic({ system, prompt, maxTokens = 1024 }: AICompletionInput): Promise<string> {
  if (!env.AI_API_KEY) {
    throw ApiError.badRequest('AI features are not configured — set AI_API_KEY on the server');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(`AI provider request failed: ${response.status} ${errorBody}`);
    throw ApiError.internal('AI request failed — please try again');
  }

  const data = (await response.json()) as { content: { type: string; text: string }[] };
  return data.content.find((block) => block.type === 'text')?.text?.trim() ?? '';
}

const DEFAULT_GEMINI_MODEL = 'gemini-flash-lite-latest';

async function callGemini({ system, prompt, maxTokens = 1024 }: AICompletionInput): Promise<string> {
  if (!env.AI_API_KEY) {
    throw ApiError.badRequest('AI features are not configured — set AI_API_KEY on the server');
  }

  const model = env.AI_MODEL && env.AI_MODEL !== 'claude-sonnet-5' ? env.AI_MODEL : DEFAULT_GEMINI_MODEL;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(`AI provider request failed: ${response.status} ${errorBody}`);
    throw ApiError.internal('AI request failed — please try again');
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  if (!text && data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
    logger.error('Gemini response was truncated before producing any text — consider raising maxTokens');
  }
  return text.trim();
}

async function complete(input: AICompletionInput): Promise<string> {
  switch (env.AI_PROVIDER) {
    case 'gemini':
      return callGemini(input);
    case 'anthropic':
    default:
      return callAnthropic(input);
  }
}

export const aiService = {
  summarize(plainText: string) {
    return complete({
      system: 'You summarize notes concisely. Respond with only the summary, no preamble.',
      prompt: `Summarize the following note in 3-5 sentences:\n\n${plainText}`,
    });
  },

  fixGrammar(plainText: string) {
    return complete({
      system: 'You correct grammar and spelling while preserving meaning, tone, and formatting. Respond with only the corrected text.',
      prompt: plainText,
    });
  },

  rewrite(plainText: string, style: string) {
    return complete({
      system: `You rewrite text in a ${style} tone while preserving meaning. Respond with only the rewritten text.`,
      prompt: plainText,
    });
  },

  translate(plainText: string, targetLanguage: string) {
    return complete({
      system: `You translate text into ${targetLanguage}. Respond with only the translation.`,
      prompt: plainText,
    });
  },

  generateTitle(plainText: string) {
    return complete({
      system: 'You generate a short, descriptive title (max 8 words) for a note. Respond with only the title, no quotes.',
      prompt: plainText,
      maxTokens: 32,
    });
  },

  async generateTags(plainText: string): Promise<string[]> {
    const raw = await complete({
      system: 'You generate 3-6 relevant lowercase tags (single words or short phrases) for a note. Respond with only a comma-separated list, no other text.',
      prompt: plainText,
      maxTokens: 64,
    });
    return raw
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6);
  },

  generateMeetingNotes(plainText: string) {
    return complete({
      system:
        'You transform raw meeting notes into a structured format with sections: Attendees, Summary, Discussion Points, Decisions, and Action Items. Use markdown headings.',
      prompt: plainText,
      maxTokens: 2048,
    });
  },

  extractActionItems(plainText: string) {
    return complete({
      system: 'You extract action items from notes as a markdown checklist (- [ ] item — owner if mentioned). Respond with only the checklist.',
      prompt: plainText,
      maxTokens: 512,
    });
  },
};
