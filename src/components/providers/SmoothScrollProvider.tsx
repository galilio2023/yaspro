"use client";

import React from "react";
import { CustomCinemaCursor } from "@/components/ui/CustomCinemaCursor";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: We intentionally do NOT override scroll-behavior here.
  // globals.css already sets `html { scroll-behavior: auto; }` which is correct:
  // — It enables the browser's native 60/120Hz momentum scrolling on iOS/Android.
  // — Setting `smooth` via JS would fight iOS rubber-band physics and degrade FPS.
  return (
    <>
      <CustomCinemaCursor />
      {children}
    </>
  );
}
