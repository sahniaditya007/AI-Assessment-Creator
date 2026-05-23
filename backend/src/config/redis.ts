import Redis, { type RedisOptions } from "ioredis";
import { env } from "./env.js";

// Upstash (and any rediss:// URL) requires TLS.
const isTls = env.redisUrl.startsWith("rediss://");

const options: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  ...(isTls && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
};

// Single shared ioredis instance used for caching / job state
export const redis = new Redis(env.redisUrl, options);

redis.on("error", (err: Error) => {
  console.error("[Redis] connection error:", err.message);
});

// BullMQ requires its own connection — it must not share the same
// ioredis instance as the app. We pass a factory function so BullMQ
// can create its own connections with the same options.
export function createBullMQConnection(): Redis {
  const conn = new Redis(env.redisUrl, options);
  conn.on("error", (err: Error) => {
    console.error("[BullMQ Redis] connection error:", err.message);
  });
  return conn;
}

// Convenience object for BullMQ Queue / Worker `connection` option
export const redisConnection = { url: env.redisUrl, ...(isTls && { tls: { rejectUnauthorized: false } }) };
