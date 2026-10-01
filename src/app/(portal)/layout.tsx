import React from "react";
import { CommandPalette } from "@/components/layout/CommandPalette";

export default function PortalGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
