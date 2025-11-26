import type { DesignNode } from "../types/DesignNode.js";

/**
 * Tailwind class → Design token mapping.
 * Maps utility classes to their pixel/numeric values.
 */
const tailwindMap = {
  // Font sizes
  fontSize: {
    "text-xs": 12,
    "text-sm": 14,
    "text-base": 16,
    "text-lg": 18,
    "text-xl": 20,
    "text-2xl": 24,
    "text-3xl": 30,
    "text-4xl": 36,
    "text-5xl": 48,
    "text-6xl": 60,
  } as Record<string, number>,

  // Font weights
  fontWeight: {
    "font-thin": 100,
    "font-extralight": 200,
    "font-light": 300,
    "font-normal": 400,
    "font-medium": 500,
    "font-semibold": 600,
    "font-bold": 700,
    "font-extrabold": 800,
    "font-black": 900,
  } as Record<string, number>,

  // Line heights
  lineHeight: {
    "leading-none": 1,
    "leading-tight": 1.25,
    "leading-snug": 1.375,
    "leading-normal": 1.5,
    "leading-relaxed": 1.625,
    "leading-loose": 2,
  } as Record<string, number>,

  // Padding (all sides)
  padding: {
    "p-0": { top: 0, bottom: 0, left: 0, right: 0 },
    "p-1": { top: 4, bottom: 4, left: 4, right: 4 },
    "p-2": { top: 8, bottom: 8, left: 8, right: 8 },
    "p-3": { top: 12, bottom: 12, left: 12, right: 12 },
    "p-4": { top: 16, bottom: 16, left: 16, right: 16 },
    "p-5": { top: 20, bottom: 20, left: 20, right: 20 },
    "p-6": { top: 24, bottom: 24, left: 24, right: 24 },
    "p-8": { top: 32, bottom: 32, left: 32, right: 32 },
    "p-10": { top: 40, bottom: 40, left: 40, right: 40 },
    "p-12": { top: 48, bottom: 48, left: 48, right: 48 },
  } as Record<string, { top: number; bottom: number; left: number; right: number }>,

  // Padding X (horizontal)
  paddingX: {
    "px-0": { left: 0, right: 0 },
    "px-1": { left: 4, right: 4 },
    "px-2": { left: 8, right: 8 },
    "px-3": { left: 12, right: 12 },
    "px-4": { left: 16, right: 16 },
    "px-5": { left: 20, right: 20 },
    "px-6": { left: 24, right: 24 },
    "px-8": { left: 32, right: 32 },
  } as Record<string, { left: number; right: number }>,

  // Padding Y (vertical)
  paddingY: {
    "py-0": { top: 0, bottom: 0 },
    "py-1": { top: 4, bottom: 4 },
    "py-2": { top: 8, bottom: 8 },
    "py-3": { top: 12, bottom: 12 },
    "py-4": { top: 16, bottom: 16 },
    "py-5": { top: 20, bottom: 20 },
    "py-6": { top: 24, bottom: 24 },
    "py-8": { top: 32, bottom: 32 },
  } as Record<string, { top: number; bottom: number }>,

  // Gap
  gap: {
    "gap-0": 0,
    "gap-1": 4,
    "gap-2": 8,
    "gap-3": 12,
    "gap-4": 16,
    "gap-5": 20,
    "gap-6": 24,
    "gap-8": 32,
    "gap-10": 40,
    "gap-12": 48,
  } as Record<string, number>,

  // Border radius
  radius: {
    "rounded-none": 0,
    "rounded-sm": 2,
    rounded: 4,
    "rounded-md": 6,
    "rounded-lg": 8,
    "rounded-xl": 12,
    "rounded-2xl": 16,
    "rounded-3xl": 24,
    "rounded-full": 9999,
  } as Record<string, number>,

  // Width
  width: {
    "w-4": 16,
    "w-5": 20,
    "w-6": 24,
    "w-8": 32,
    "w-10": 40,
    "w-12": 48,
    "w-16": 64,
    "w-20": 80,
    "w-24": 96,
    "w-32": 128,
    "w-40": 160,
    "w-48": 192,
    "w-56": 224,
    "w-64": 256,
  } as Record<string, number>,

  // Height
  height: {
    "h-4": 16,
    "h-5": 20,
    "h-6": 24,
    "h-8": 32,
    "h-10": 40,
    "h-12": 48,
    "h-16": 64,
    "h-20": 80,
    "h-24": 96,
    "h-32": 128,
  } as Record<string, number>,
};

/**
 * Parse Tailwind className string and extract design properties.
 */
export function parseTailwind(classString: string): Partial<DesignNode> {
  const classes = classString.split(/\s+/).filter(Boolean);
  const result: Partial<DesignNode> = {};

  // Track padding parts to merge
  let padding: { top?: number; bottom?: number; left?: number; right?: number } = {};

  for (const cls of classes) {
    // Font size
    if (tailwindMap.fontSize[cls]) {
      result.fontSize = tailwindMap.fontSize[cls];
    }

    // Font weight
    if (tailwindMap.fontWeight[cls]) {
      result.fontWeight = tailwindMap.fontWeight[cls];
    }

    // Line height
    if (tailwindMap.lineHeight[cls]) {
      result.lineHeight = tailwindMap.lineHeight[cls];
    }

    // Padding (all sides)
    if (tailwindMap.padding[cls]) {
      padding = { ...padding, ...tailwindMap.padding[cls] };
    }

    // Padding X
    if (tailwindMap.paddingX[cls]) {
      padding = { ...padding, ...tailwindMap.paddingX[cls] };
    }

    // Padding Y
    if (tailwindMap.paddingY[cls]) {
      padding = { ...padding, ...tailwindMap.paddingY[cls] };
    }

    // Gap
    if (tailwindMap.gap[cls]) {
      result.gap = tailwindMap.gap[cls];
    }

    // Border radius
    if (tailwindMap.radius[cls]) {
      result.cornerRadius = tailwindMap.radius[cls];
    }

    // Width
    if (tailwindMap.width[cls]) {
      result.width = tailwindMap.width[cls];
    }

    // Height
    if (tailwindMap.height[cls]) {
      result.height = tailwindMap.height[cls];
    }

    // Handle arbitrary values like text-[14px], p-[16px], etc.
    const arbitraryMatch = cls.match(/^(text|p|px|py|pt|pb|pl|pr|gap|rounded|w|h)-\[(\d+)px\]$/);
    if (arbitraryMatch) {
      const [, prefix, value] = arbitraryMatch;
      const numValue = parseInt(value, 10);

      switch (prefix) {
        case "text":
          result.fontSize = numValue;
          break;
        case "p":
          padding = { top: numValue, bottom: numValue, left: numValue, right: numValue };
          break;
        case "px":
          padding = { ...padding, left: numValue, right: numValue };
          break;
        case "py":
          padding = { ...padding, top: numValue, bottom: numValue };
          break;
        case "pt":
          padding = { ...padding, top: numValue };
          break;
        case "pb":
          padding = { ...padding, bottom: numValue };
          break;
        case "pl":
          padding = { ...padding, left: numValue };
          break;
        case "pr":
          padding = { ...padding, right: numValue };
          break;
        case "gap":
          result.gap = numValue;
          break;
        case "rounded":
          result.cornerRadius = numValue;
          break;
        case "w":
          result.width = numValue;
          break;
        case "h":
          result.height = numValue;
          break;
      }
    }
  }

  // Assign padding if any values were set
  if (Object.keys(padding).length > 0) {
    result.padding = padding;
  }

  return result;
}

