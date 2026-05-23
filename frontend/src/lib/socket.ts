import { io, Socket } from "socket.io-client";
import type { JobProgressEvent } from "@/types/assessment";

function getDefaultWsUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/_/backend`;
  }
  return "http://localhost:4000";
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? getDefaultWsUrl();

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToAssignment(
  assignmentId: string,
  onProgress: (event: JobProgressEvent) => void
): () => void {
  const s = getSocket();
  s.emit("subscribe", assignmentId);
  s.on("generation:progress", onProgress);

  return () => {
    s.emit("unsubscribe", assignmentId);
    s.off("generation:progress", onProgress);
  };
}
