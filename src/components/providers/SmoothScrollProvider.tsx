"use client";

import React, { useEffect } from "react";
import { CustomCinemaCursor } from "@/components/ui/CustomCinemaCursor";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Enable native smooth momentum scrolling
    if (typeof document !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth";
    }
  }, []);

  return (
    <>
      <CustomCinemaCursor />
      {children}
    </>
  );
}
