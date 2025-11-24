import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile local packages from monorepo (Next.js 16 feature)
  // This replaces next-transpile-modules package
  transpilePackages: [
    '@aibos/ui',
    '@aibos/utils',
    '@aibos/types'
  ],

  // Optimize package imports for large libraries
  // Note: @headlessui/react is already optimized by default in Next.js 16
  experimental: {
    optimizePackageImports: [
      // Add other large icon/component libraries here if needed
    ],
  },

  // Output file tracing for monorepo builds
  // Ensures files outside app directory are included in builds
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
