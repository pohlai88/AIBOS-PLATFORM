/**
 * Icon Showcase - Nano Banana Pro + Aceternity Effects
 * 
 * A working demonstration of:
 * - Adaptive Luminance icon colors
 * - Glassy backgrounds
 * - Kinetic animations
 * - Aceternity effects (Border Beam, Spotlight, Animated Tooltip)
 */

"use client";

import * as React from "react";
import {
  mdiLanguageJavascript,
  mdiLanguageTypescript,
  mdiLanguagePython,
  mdiLanguageHtml5,
  mdiLanguageCss3,
  mdiReact,
  mdiVuejs,
  mdiNodejs,
  mdiGit,
  mdiHome,
  mdiAccount,
  mdiCog,
  mdiHeart,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiInformation,
} from "@mdi/js";
import { ColoredMDIIcon, MotionIcon } from "@aibos/ui/components/shared/primitives/icons";
import { BorderBeam } from "@aibos/ui/components/shared/primitives/icons/aceternity/border-beam";
import { Spotlight } from "@aibos/ui/components/shared/primitives/icons/aceternity/spotlight";
import { AnimatedTooltip } from "@aibos/ui/components/shared/primitives/icons/aceternity/animated-tooltip";

const TECH_STACK = [
  { icon: mdiLanguageJavascript, variant: "javascript" as const, label: "JavaScript" },
  { icon: mdiLanguageTypescript, variant: "typescript" as const, label: "TypeScript" },
  { icon: mdiLanguagePython, variant: "python" as const, label: "Python" },
  { icon: mdiLanguageHtml5, variant: "html" as const, label: "HTML" },
  { icon: mdiLanguageCss3, variant: "css" as const, label: "CSS" },
  { icon: mdiReact, variant: "react" as const, label: "React" },
  { icon: mdiVuejs, variant: "vue" as const, label: "Vue" },
  { icon: mdiNodejs, variant: "node" as const, label: "Node.js" },
  { icon: mdiGit, variant: "git" as const, label: "Git" },
];

const STATUS_ICONS = [
  { icon: mdiCheckCircle, variant: "success" as const, label: "Success" },
  { icon: mdiAlertCircle, variant: "warning" as const, label: "Warning" },
  { icon: mdiAlertCircle, variant: "error" as const, label: "Error" },
  { icon: mdiInformation, variant: "info" as const, label: "Info" },
];

const KINETIC_ICONS = [
  { icon: mdiCog, variant: "secondary" as const, animation: "revolver" as const, label: "Revolver" },
  { icon: mdiHeart, variant: "error" as const, animation: "jelly" as const, label: "Jelly" },
  { icon: mdiAlertCircle, variant: "warning" as const, animation: "pulse" as const, label: "Pulse" },
];

export default function IconShowcasePage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Spotlight Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Spotlight className="top-0 left-0 md:left-1/2" fill="white" />
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-16">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Nano Banana <span className="text-indigo-500">Pro</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Adaptive Luminance Icons + Aceternity Effects = Visceral UI
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Toggle dark mode to see colors adapt automatically
          </p>
        </div>

        {/* Tech Stack with Border Beam */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2 dark:border-gray-700">
            Tech Stack Icons (with Border Beam)
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {TECH_STACK.map((item) => (
              <AnimatedTooltip key={item.label} tooltip={item.label} variant="primary">
                <div className="relative p-4 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:scale-105 transition-transform">
                  <BorderBeam
                    duration={12}
                    delay={Math.random() * 5}
                    colorFrom="var(--icon-js)"
                    colorTo="var(--icon-react)"
                  />
                  <ColoredMDIIcon
                    path={item.icon}
                    variant={item.variant}
                    size={1.5}
                    withBackground
                  />
                </div>
              </AnimatedTooltip>
            ))}
          </div>
        </section>

        {/* Status Icons with Glassy Background */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2 dark:border-gray-700">
            Status Icons (Glassy Background)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATUS_ICONS.map((item) => (
              <AnimatedTooltip
                key={item.label}
                tooltip={item.label}
                variant={item.variant === "error" ? "error" : item.variant === "warning" ? "warning" : item.variant === "success" ? "success" : "primary"}
              >
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl glass-panel">
                  <ColoredMDIIcon
                    path={item.icon}
                    variant={item.variant}
                    size={2}
                    withBackground
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </AnimatedTooltip>
            ))}
          </div>
        </section>

        {/* Kinetic Animations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2 dark:border-gray-700">
            Kinetic Animations (Framer Motion)
          </h2>
          <div className="flex gap-8 justify-center">
            {KINETIC_ICONS.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <AnimatedTooltip tooltip={`${item.label} Animation`} variant="primary">
                  <MotionIcon
                    path={item.icon}
                    variant={item.variant}
                    animation={item.animation}
                    size={2}
                    withBackground
                  />
                </AnimatedTooltip>
                <span className="text-xs font-mono text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison: Plain vs Glassy */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2 dark:border-gray-700">
            Plain vs Glassy Comparison
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TECH_STACK.slice(0, 4).map((item) => (
              <div key={item.label} className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <ColoredMDIIcon path={item.icon} variant={item.variant} size={1.5} />
                  <span className="text-xs text-slate-500">Plain</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ColoredMDIIcon
                    path={item.icon}
                    variant={item.variant}
                    size={1.5}
                    withBackground
                  />
                  <span className="text-xs text-slate-500">Glassy</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info Footer */}
        <div className="p-6 rounded-lg bg-slate-100 dark:bg-slate-900 text-sm space-y-2">
          <p className="font-semibold">✨ Features Demonstrated:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>Adaptive Luminance - Colors change for light/dark mode</li>
            <li>Glassy Backgrounds - Translucent color-matched backgrounds</li>
            <li>Border Beam - Animated borders on icon cards</li>
            <li>Spotlight - Mouse-following spotlight effect</li>
            <li>Animated Tooltip - Hover tooltips that follow mouse</li>
            <li>Kinetic Animations - Spring physics with Framer Motion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

