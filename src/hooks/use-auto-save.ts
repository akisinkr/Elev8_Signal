"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedDataRef = useRef<T>(data);

  const save = useCallback(
    async (dataToSave: T) => {
      try {
        await onSave(dataToSave);
        savedDataRef.current = dataToSave;
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    },
    [onSave]
  );

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(savedDataRef.current)) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => save(data), delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, delay, save]);

  return { save: () => save(data) };
}
