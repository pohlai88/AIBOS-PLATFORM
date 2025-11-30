/**
 * MotionIcon - Nano Banana Pro Kinetic Icon Wrapper
 * 
 * Adds Framer Motion physics to icons with 3 distinct "feels":
 * - revolver: Heavy, mechanical spinning (settings, refresh)
 * - jelly: Soft, bouncy, playful (likes, hearts, fun UI)
 * - pulse: Breathing, alive (alerts, status indicators)
 * 
 * Uses spring physics (Hooke's Law) to simulate weight, friction, and tension.
 */

"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { ColoredMDIIcon, ColoredMDIIconProps } from "./mdi-colored-icon";

// The 3 Flavors of "Nano Physics"
export type MotionVariant = "revolver" | "jelly" | "pulse";

interface MotionIconProps extends ColoredMDIIconProps {
  /**
   * Animation variant
   * - revolver: Heavy, mechanical spinning (perfect for settings, refresh)
   * - jelly: Soft, bouncy, playful (perfect for likes, hearts, fun UI)
   * - pulse: Breathing, alive (perfect for alerts, status indicators)
   */
  animation?: MotionVariant;
  
  /**
   * Click handler
   */
  onClick?: () => void;
}

// 1. THE REVOLVER (Spinning)
// Perfect for: Settings gears, Refresh buttons, Loading states
// Feel: Heavy, mechanical, satisfying
const revolverVariants = {
  idle: { rotate: 0 },
  hover: {
    rotate: 45,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
  tap: {
    rotate: 360,
    scale: 0.9,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// 2. THE JELLY (Bouncy)
// Perfect for: Likes, Hearts, Success checks, Fun UI
// Feel: Soft, organic, playful
const jellyVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.2,
    rotate: -10,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: {
    scale: 0.8,
    rotate: 10,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
};

// 3. THE PULSE (Breathing)
// Perfect for: Alerts, Status indicators, Live dots
// Feel: Alive, urgent, glowing
const pulseVariants = {
  idle: { scale: 1, opacity: 1 },
  hover: {
    scale: 1.1,
    filter: "brightness(1.2)",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
  // Special: Continuous background animation
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

/**
 * MotionIcon - Adds kinetic physics to icons
 * 
 * @example
 * ```tsx
 * import { mdiCog, mdiHeart, mdiAlertCircle } from "@mdi/js";
 * 
 * // Revolver (spinning)
 * <MotionIcon path={mdiCog} variant="secondary" animation="revolver" />
 * 
 * // Jelly (bouncy)
 * <MotionIcon path={mdiHeart} variant="error" animation="jelly" />
 * 
 * // Pulse (breathing)
 * <MotionIcon path={mdiAlertCircle} variant="warning" animation="pulse" />
 * ```
 */
export const MotionIcon = ({
  animation = "revolver",
  onClick,
  ...props
}: MotionIconProps) => {
  const getVariant = () => {
    switch (animation) {
      case "jelly":
        return jellyVariants;
      case "pulse":
        return pulseVariants;
      default:
        return revolverVariants;
    }
  };

  return (
    <motion.div
      className="inline-flex cursor-pointer"
      variants={getVariant()}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      animate={animation === "pulse" ? "animate" : "idle"}
      onClick={onClick}
    >
      {/* Render your existing Nano Icon inside the physics shell */}
      <ColoredMDIIcon {...props} />
    </motion.div>
  );
};

MotionIcon.displayName = "MotionIcon";

