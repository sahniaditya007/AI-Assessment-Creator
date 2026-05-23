import { redis } from "../config/redis.js";
import type { GeneratedPaper } from "../types/assessment.js";

const PAPER_PREFIX = "paper:";
const JOB_PREFIX = "job:";
const TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function cachePaper(
  assignmentId: string,
  paper: GeneratedPaper
): Promise<void> {
  await redis.setex(
    `${PAPER_PREFIX}${assignmentId}`,
    TTL_SECONDS,
    JSON.stringify(paper)
  );
}

export async function getCachedPaper(
  assignmentId: string
): Promise<GeneratedPaper | null> {
  const raw = await redis.get(`${PAPER_PREFIX}${assignmentId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GeneratedPaper;
  } catch {
    return null;
  }
}

export async function invalidatePaper(assignmentId: string): Promise<void> {
  await redis.del(`${PAPER_PREFIX}${assignmentId}`);
}

export async function setJobState(
  assignmentId: string,
  state: Record<string, unknown>
): Promise<void> {
  await redis.setex(
    `${JOB_PREFIX}${assignmentId}`,
    TTL_SECONDS,
    JSON.stringify(state)
  );
}

export async function getJobState(
  assignmentId: string
): Promise<Record<string, unknown> | null> {
  const raw = await redis.get(`${JOB_PREFIX}${assignmentId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function invalidateJobState(assignmentId: string): Promise<void> {
  await redis.del(`${JOB_PREFIX}${assignmentId}`);
}
