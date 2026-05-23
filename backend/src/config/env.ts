import dotenv from "dotenv";
import path from "path";

dotenv.config();

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const defaultUploadDir = isVercel ? "/tmp/uploads" : "uploads";

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

  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? defaultUploadDir),
};
