"use client";

import { Transition } from "framer-motion";

/**
 * Yaspro Studio Kinetic Spring Tokens
 * Physical mass, velocity damping, and spring tension calibrated for human-crafted feel.
 */
export const studioSprings = {
  // Snappy: Quick tactile response for buttons, toggles, badges
  snappy: {
    type: "spring",
    stiffness: 420,
    damping: 28,
    mass: 0.8,
  } as Transition,

  // Cinematic: Smooth, luxurious motion for drawers, cards, hero reveals
  cinematic: {
    type: "spring",
    stiffness: 240,
    damping: 30,
    mass: 1,
  } as Transition,

  // Heavy: Deliberate, weighted motion for large overlays and modals
  heavy: {
    type: "spring",
    stiffness: 160,
    damping: 24,
    mass: 1.2,
  } as Transition,

  // Micro: Sub-pixel spring for icon nudges and press depressions
  tactile: {
    type: "spring",
    stiffness: 600,
    damping: 35,
    mass: 0.5,
  } as Transition,
};

/**
 * Standard tactile interactive states for Framer Motion
 */
export const tactilePress = {
  scale: 0.97,
  transition: studioSprings.tactile,
};

export const subtleHover = {
  y: -2,
  transition: studioSprings.snappy,
};
