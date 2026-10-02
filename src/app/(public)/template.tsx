"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Route Transition Template (App Router)
 * Creates a subtle cinematic cross-dissolve with sub-pixel vertical settling
 * on every page navigation. Zero layout thrash, pure GPU opacity/transform.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // Studio easing
      }}
      className="w-full flex-1 flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}
