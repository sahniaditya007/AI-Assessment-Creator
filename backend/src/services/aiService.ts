import OpenAI from "openai";
import { env } from "../config/env.js";
import type { AssignmentInput, GeneratedPaper } from "../types/assessment.js";
import { buildGenerationPrompt } from "./promptBuilder.js";
import { buildMockPaper, parsePaperResponse } from "./paperParser.js";

/**
 * OpenAI SDK pointed at OpenRouter's API.
 * OpenRouter is fully OpenAI-compatible — same SDK, different baseURL + headers.
 */
const client = env.openrouterApiKey
  ? new OpenAI({
      apiKey: env.openrouterApiKey,
      baseURL: env.openrouterBaseUrl,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/vedaai-assessment-creator",
        "X-Title": "VedaAI Assessment Creator",
      },
    })
  : null;

export async function generateQuestionPaper(
  input: AssignmentInput
): Promise<GeneratedPaper> {
  if (env.useMockAi) {
    await delay(1500);
    return buildMockPaper(input);
  }

  if (!client) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Set it in .env or enable USE_MOCK_AI=true."
    );
  }

  const prompt = buildGenerationPrompt(input);

  const response = await client.chat.completions.create({
    model: env.aiModel,
    messages: [
      {
        role: "system",
        content:
          "You are an expert academic assessment designer. Output ONLY valid JSON — no markdown fences, no commentary, no text before or after the JSON object.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    // Note: response_format is intentionally omitted — GLM-4.5-Air on OpenRouter
    // does not guarantee json_object mode. The prompt enforces JSON output and
    // paperParser.ts handles extraction + validation robustly.
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from language model");
  }

  return parsePaperResponse(content, input.title);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
