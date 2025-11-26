import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------
// RULE TYPES
// ---------------------------------------------------------------

export interface TypographyRules {
  minFontSize: number;
  recommendedFontSize?: number;
  modularScale: number;
  allowedWeights: number[];
  lineHeightRange: { min: number; max: number };
  maxHeadingJump?: number;
}

export interface SpacingRules {
  gridStep: number;
  allowedSpacing: number[];
  siblingAlignmentTolerance?: number;
}

export interface LayoutRules {
  maxFrameWidth: number;
  minFrameWidth: number;
  minFramePadding: number;
  alignmentTolerance?: number;
}

export interface GeometryRules {
  minButtonPaddingY?: number;
  minButtonPaddingX?: number;
  allowedIconSizes: number[];
  allowedRadius: number[];
}

export interface VisualRules {
  allowedSurfaceRoles: string[];
  forbiddenEffects: string[];
}

export interface DesignerRules {
  typography: TypographyRules;
  spacing: SpacingRules;
  layout: LayoutRules;
  geometry: GeometryRules;
  visual: VisualRules;
}

// ---------------------------------------------------------------
// DEFAULT RULES (fallback)
// ---------------------------------------------------------------

const defaultTypography: TypographyRules = {
  minFontSize: 12,
  recommendedFontSize: 14,
  modularScale: 1.25,
  allowedWeights: [400, 500, 600, 700],
  lineHeightRange: { min: 1.2, max: 1.6 },
  maxHeadingJump: 1,
};

const defaultSpacing: SpacingRules = {
  gridStep: 4,
  allowedSpacing: [4, 8, 12, 16, 20, 24, 32, 40],
  siblingAlignmentTolerance: 2,
};

const defaultLayout: LayoutRules = {
  maxFrameWidth: 1440,
  minFrameWidth: 240,
  minFramePadding: 16,
  alignmentTolerance: 2,
};

const defaultGeometry: GeometryRules = {
  minButtonPaddingY: 8,
  minButtonPaddingX: 12,
  allowedIconSizes: [14, 16, 20, 24, 32],
  allowedRadius: [2, 4, 6, 8, 12],
};

const defaultVisual: VisualRules = {
  allowedSurfaceRoles: ["primary", "secondary", "muted", "elevated"],
  forbiddenEffects: ["innerShadow", "hardShadow"],
};

// ---------------------------------------------------------------
// LOADER FUNCTIONS
// ---------------------------------------------------------------

function loadJson<T>(theme: string, filename: string, fallback: T): T {
  const filepath = join(__dirname, theme, filename);

  if (!existsSync(filepath)) {
    // Try default theme
    const defaultPath = join(__dirname, "default", filename);
    if (existsSync(defaultPath)) {
      const content = readFileSync(defaultPath, "utf-8");
      return JSON.parse(content) as T;
    }
    return fallback;
  }

  try {
    const content = readFileSync(filepath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export function loadTypographyRules(theme = "default"): TypographyRules {
  return loadJson<TypographyRules>(theme, "rules.typography.json", defaultTypography);
}

export function loadSpacingRules(theme = "default"): SpacingRules {
  return loadJson<SpacingRules>(theme, "rules.spacing.json", defaultSpacing);
}

export function loadLayoutRules(theme = "default"): LayoutRules {
  return loadJson<LayoutRules>(theme, "rules.layout.json", defaultLayout);
}

export function loadGeometryRules(theme = "default"): GeometryRules {
  return loadJson<GeometryRules>(theme, "rules.geometry.json", defaultGeometry);
}

export function loadVisualRules(theme = "default"): VisualRules {
  return loadJson<VisualRules>(theme, "rules.visual.json", defaultVisual);
}

/**
 * Load all design rules for a specific theme.
 * Falls back to default theme if specific rules don't exist.
 */
export function loadDesignerRules(theme = "default"): DesignerRules {
  return {
    typography: loadTypographyRules(theme),
    spacing: loadSpacingRules(theme),
    layout: loadLayoutRules(theme),
    geometry: loadGeometryRules(theme),
    visual: loadVisualRules(theme),
  };
}

/**
 * Get list of available themes by checking config directories.
 */
export function getAvailableThemes(): string[] {
  const themes: string[] = ["default"];
  const knownThemes = ["dlbb", "client-template"];

  for (const theme of knownThemes) {
    const themePath = join(__dirname, theme);
    if (existsSync(themePath)) {
      themes.push(theme);
    }
  }

  return themes;
}
