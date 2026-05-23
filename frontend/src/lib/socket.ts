import { io, Socket } from "socket.io-client";
import type { JobProgressEvent } from "@/types/assessment";

function getWsUrl(): string {
  const configured = process.env.NEXT_PUBLIC_WS_URL;
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    const isLocalHost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalHost) {
      return "http://localhost:4000";
    }
  }

  throw new Error(
    "NEXT_PUBLIC_WS_URL is not set. Configure it in Vercel to point to your Railway backend."
  );
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getWsUrl(), {
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
