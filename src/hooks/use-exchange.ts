"use client";

import { useState, useCallback } from "react";
import type { MessageWithSender } from "@/types";

export function useExchange(matchId: string) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string, type: "TEXT" | "VOICE_NOTE" = "TEXT", voiceNoteUrl?: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/matches/${matchId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, type, voiceNoteUrl }),
        });
        if (!res.ok) throw new Error("Failed to send message");
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        return message;
      } finally {
        setIsLoading(false);
      }
    },
    [matchId]
  );

  const addMessage = useCallback((message: MessageWithSender) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return { messages, setMessages, isLoading, sendMessage, addMessage };
}
