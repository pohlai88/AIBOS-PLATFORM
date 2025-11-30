"use client";

import * as React from "react";
import {
  FinanceIconPreview,
  WarehouseIconPreview,
  SalesIconPreview,
  DashboardIconPreview,
  AIIconPreview,
} from "@aibos/ui/components/shared/primitives/icons";

type IconWeight = "outline" | "solid" | "duotone";
type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
};

interface IconShowcase {
  name: string;
  component: React.ComponentType<any>;
  description: string;
  uniqueFeatures: string[];
}

const icons: IconShowcase[] = [
  {
    name: "Finance",
    component: FinanceIconPreview,
    description: "Modern dollar sign with growth arrow and data visualization",
    uniqueFeatures: [
      "Growth indicator",
      "Chart integration",
      "Distinctive styling",
    ],
  },
  {
    name: "Warehouse",
    component: WarehouseIconPreview,
    description:
      "Smart container system with grid pattern and inventory indicators",
    uniqueFeatures: ["Grid system", "Inventory dots", "Modern architecture"],
  },
  {
    name: "Sales",
    component: SalesIconPreview,
    description: "Handshake with growth sparkle and sales trend visualization",
    uniqueFeatures: ["Growth sparkle", "Trend arrow", "Partnership symbol"],
  },
  {
    name: "Dashboard",
    component: DashboardIconPreview,
    description: "Modern analytics grid with data visualization elements",
    uniqueFeatures: ["Grid layout", "Data elements", "Multi-panel design"],
  },
  {
    name: "AI Assistant",
    component: AIIconPreview,
    description: "Neural network brain with connections and energy spark",
    uniqueFeatures: ["Neural network", "Connection nodes", "AI energy spark"],
  },
];

export default function FlatIconsPage() {
  const [selectedWeight, setSelectedWeight] =
    React.useState<IconWeight>("outline");
  const [selectedSize, setSelectedSize] = React.useState<IconSize>("md");
  const [selectedColor, setSelectedColor] = React.useState<string>("default");

  const colorClasses: Record<string, string> = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Flat Icon System Preview</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Distinctive flat icons that stand out from generic
            Tailwind/Heroicons
          </p>
          <p className="text-sm text-muted-foreground">
            Based on Microsoft Fluent Design + Google Material Design principles
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weight Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Weight Variant
              </label>
              <div className="flex gap-2">
                {(["outline", "solid", "duotone"] as IconWeight[]).map(
                  (weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedWeight === weight
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {weight.charAt(0).toUpperCase() + weight.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="flex gap-2 flex-wrap">
                {(["xs", "sm", "md", "lg", "xl", "2xl"] as IconSize[]).map(
                  (size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2">
                {Object.entries(colorClasses).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedColor(key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                      selectedColor === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {icons.map((icon) => {
            const IconComponent = icon.component;
            return (
              <div
                key={icon.name}
                className="p-6 bg-card rounded-lg border hover:border-primary/50 transition-colors"
              >
                {/* Icon Display */}
                <div className="flex items-center justify-center mb-4 p-8 bg-muted/30 rounded-lg">
                  <IconComponent
                    size={sizeMap[selectedSize]}
                    weight={selectedWeight}
                    className={colorClasses[selectedColor]}
                  />
                </div>

                {/* Icon Info */}
                <h3 className="text-xl font-semibold mb-2">{icon.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {icon.description}
                </p>

                {/* Unique Features */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Unique Features:
                  </p>
                  <ul className="space-y-1">
                    {icon.uniqueFeatures.map((feature, idx) => (
                      <li key={idx} className="text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Code Preview */}
                <div className="mt-4 p-3 bg-muted/50 rounded text-xs font-mono overflow-x-auto">
                  <code>
                    {`<${icon.name}Icon\n  size={${sizeMap[selectedSize]}}\n  weight="${selectedWeight}"\n/>`}
                  </code>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-12 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">
            What Makes These Icons Unique?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">
                ❌ Generic Tailwind/Heroicons
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Simple, basic shapes</li>
                <li>• No distinctive features</li>
                <li>• Looks like every other icon library</li>
                <li>• Minimal visual interest</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                ✅ Our Distinctive Flat Icons
              </h3>
              <ul className="text-sm space-y-1">
                <li>• Unique design elements (sparkles, growth arrows)</li>
                <li>• Integrated data visualization</li>
                <li>• Modern, professional appearance</li>
                <li>• Stands out while staying flat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
