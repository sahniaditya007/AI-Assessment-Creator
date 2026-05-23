"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket, subscribeToAssignment } from "@/lib/socket";
import { useAssignmentStore } from "@/store/assignmentStore";

export function useGenerationSocket(assignmentId: string) {
  const router = useRouter();
  const { handleProgress, setWsConnected, generationStatus } =
    useAssignmentStore();

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setWsConnected(true);
    const onDisconnect = () => setWsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) setWsConnected(true);

    const unsubscribe = subscribeToAssignment(assignmentId, (event) => {
      handleProgress(event);
      if (event.status === "completed" && event.paper) {
        router.push(`/assignments/${assignmentId}/paper`);
      }
    });

    return () => {
      unsubscribe();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [assignmentId, handleProgress, router, setWsConnected]);

  return { generationStatus };
}
