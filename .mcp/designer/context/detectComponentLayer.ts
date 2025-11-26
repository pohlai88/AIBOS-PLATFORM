/**
 * Component Layer Detection
 * Classifies components into L1 (primitives), L2 (composed), L3 (widgets).
 */

export type ComponentLayer = "L1" | "L2" | "L3";

// Layer 1: Primitives - atomic building blocks
const L1_COMPONENTS = new Set([
  // Core primitives
  "Button",
  "Input",
  "Textarea",
  "Select",
  "Checkbox",
  "Radio",
  "Switch",
  "Slider",
  // Typography
  "Text",
  "Heading",
  "Label",
  "Code",
  "Link",
  // Layout
  "Box",
  "Flex",
  "Grid",
  "Stack",
  "Container",
  "Divider",
  "Spacer",
  // Surfaces
  "Card",
  "Surface",
  "Paper",
  "Panel",
  // Media
  "Icon",
  "Avatar",
  "Image",
  "Badge",
  // Feedback
  "Spinner",
  "Progress",
  "Skeleton",
]);

// Layer 2: Composed - combinations of primitives
const L2_COMPONENTS = new Set([
  // Forms
  "FormField",
  "FormRow",
  "FormGroup",
  "InputGroup",
  "SearchInput",
  // Navigation
  "NavItem",
  "SidebarItem",
  "MenuItem",
  "BreadcrumbItem",
  "TabItem",
  // Layout compositions
  "PanelHeader",
  "PanelFooter",
  "CardHeader",
  "CardBody",
  "CardFooter",
  // Data display
  "TableRow",
  "TableCell",
  "ListItem",
  "DataCell",
  // Dialogs
  "ModalHeader",
  "ModalBody",
  "ModalFooter",
  "AlertDialog",
  "ConfirmDialog",
]);

// Layer 3: Widgets - feature-complete components
const L3_COMPONENTS = new Set([
  // Dashboard
  "DashboardCard",
  "StatsCard",
  "MetricWidget",
  "AnalyticsChart",
  "ActivityFeed",
  // Auth
  "LoginForm",
  "LoginWidget",
  "SignupForm",
  "PasswordReset",
  // User
  "UserCard",
  "UserBadge",
  "UserAvatar",
  "ProfileCard",
  // Data
  "DataTable",
  "DataGrid",
  "FilterPanel",
  "SearchPanel",
  // Commerce
  "ProductCard",
  "PricingCard",
  "CartItem",
  "CheckoutForm",
]);

/**
 * Detect component layer from component name.
 */
export function detectComponentLayer(componentName: string): ComponentLayer {
  // Remove common suffixes for matching
  const baseName = componentName
    .replace(/Component$/, "")
    .replace(/Wrapper$/, "")
    .replace(/Container$/, "");

  if (L1_COMPONENTS.has(baseName)) return "L1";
  if (L2_COMPONENTS.has(baseName)) return "L2";
  if (L3_COMPONENTS.has(baseName)) return "L3";

  // Heuristics for unknown components
  if (baseName.endsWith("Button") || baseName.endsWith("Input")) return "L1";
  if (baseName.endsWith("Item") || baseName.endsWith("Row")) return "L2";
  if (baseName.endsWith("Widget") || baseName.endsWith("Card")) return "L3";

  // Default to L3 for unknown components
  return "L3";
}

/**
 * Get layer-specific design rules.
 */
export function getLayerRules(layer: ComponentLayer): string[] {
  switch (layer) {
    case "L1":
      return [
        "strict-token-usage",
        "no-semantic-tokens",
        "no-hardcoded-values",
        "primitive-only-props",
        "no-business-logic",
      ];
    case "L2":
      return [
        "composed-from-l1",
        "semantic-tokens-allowed",
        "layout-tokens-required",
        "no-feature-logic",
      ];
    case "L3":
      return [
        "feature-complete",
        "theme-tokens-allowed",
        "business-logic-allowed",
        "accessibility-required",
      ];
  }
}

/**
 * Check if a component can use another layer's components.
 */
export function canUseLayer(userLayer: ComponentLayer, targetLayer: ComponentLayer): boolean {
  const layerOrder = { L1: 1, L2: 2, L3: 3 };
  // Higher layers can use lower layers
  return layerOrder[userLayer] >= layerOrder[targetLayer];
}

