"use client";

import React from "react";
import { usePageLoader } from "@/components/layout/GlobalPageLoader";

export interface LoadingFallbackStatusProps {
  label?: string;
}

export function LoadingFallbackStatus({
  label = "Loading page content...",
}: LoadingFallbackStatusProps) {
  const { isLoading } = usePageLoader();

  // If GlobalPageLoader is already active and announcing its own status,
  // suppress this fallback to prevent duplicate announcements.
  if (isLoading) {
    return null;
  }

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {label}
    </div>
  );
}
