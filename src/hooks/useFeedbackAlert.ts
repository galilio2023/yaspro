import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Centralised feedback-alert hook.
 * Shows a message for `durationMs` and then auto-clears it.
 * Cleans up timers on unmount to prevent memory leaks.
 */
export function useFeedbackAlert(durationMs: number = 3000) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showFeedback = useCallback(
    (message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFeedback(message);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs]
  );

  const clearFeedback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);
  }, []);

  return { feedback, showFeedback, clearFeedback };
}
