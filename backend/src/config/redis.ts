import Redis from "ioredis";
import { env } from "./env.js";

// Upstash (and any rediss:// URL) requires TLS.
// When the URL scheme is rediss://, pass tls:{} so ioredis enables TLS.
const isTls = env.redisUrl.startsWith("rediss://");

const sharedOptions: ConstructorParameters<typeof Redis>[1] = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  ...(isTls && {
    tls: {
      rejectUnauthorized: false, // required for Upstash self-signed certs
    },
  }),
};

export const redis = new Redis(env.redisUrl, sharedOptions);

redis.on("error", (err: Error) => {
  // Log but don't crash — ioredis will reconnect automatically
  console.error("[Redis] connection error:", err.message);
});

// BullMQ needs a plain connection config object, not an ioredis instance.
// Pass the same TLS options so BullMQ workers also connect correctly.
export const redisConnection = {
  url: env.redisUrl,
  ...(isTls && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
};
