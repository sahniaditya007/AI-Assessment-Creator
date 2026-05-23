import dotenv from "dotenv";
import path from "path";

dotenv.config();

function parseFrontendOrigins(): string[] {
  const raw = process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? "http://localhost:3000";

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedFrontendOrigin(origin?: string): boolean {
  if (!origin) {
    return true;
  }

  const allowedOrigins = parseFrontendOrigins();
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function resolveUploadDir(): string {
  const configured = process.env.UPLOAD_DIR ?? "uploads";
  const resolved = path.resolve(configured);

  // In Vercel Serverless, /var/task is read-only. Use /tmp instead.
  if (resolved.startsWith("/var/task/")) {
    return "/tmp/uploads";
  }

  return resolved;
}

export const env = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  mongodbUri:
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/vedaai-assessments",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",

  // OpenRouter config
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openrouterBaseUrl:
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  aiModel: process.env.AI_MODEL ?? "z-ai/glm-4.5-air:free",

  // Set USE_MOCK_AI=true to skip real AI calls during development
  useMockAi:
    process.env.USE_MOCK_AI === "true" || !process.env.OPENROUTER_API_KEY,

  frontendOrigins: parseFrontendOrigins(),
  frontendUrl: parseFrontendOrigins()[0],
  uploadDir: resolveUploadDir(),
};
