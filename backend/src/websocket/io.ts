import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import type { JobProgressEvent } from "../types/assessment.js";

let io: Server | null = null;

export function initWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("subscribe", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId) {
        socket.join(roomFor(assignmentId));
      }
    });

    socket.on("unsubscribe", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId) {
        socket.leave(roomFor(assignmentId));
      }
    });
  });

  return io;
}

export function emitJobProgress(event: JobProgressEvent): void {
  if (!io) return;
  io.to(roomFor(event.assignmentId)).emit("generation:progress", event);
}

function roomFor(assignmentId: string): string {
  return `assignment:${assignmentId}`;
}
