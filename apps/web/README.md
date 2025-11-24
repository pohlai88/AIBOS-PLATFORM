# AIBOS Web Application

Main Next.js 16 application for the AIBOS Platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# From root directory
pnpm install
```

### Development

```bash
# Start dev server
pnpm dev

# Or from root
cd apps/web && pnpm dev
```

The application will be available at `http://localhost:3000`

## 📁 Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles & tokens
│   ├── favicon.ico        # Favicon
│   └── api/               # API routes
│       └── generate-ui/   # UI generation endpoint
├── public/                 # Static assets
├── package.json           # Dependencies
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── postcss.config.mjs     # PostCSS configuration
```

## 🔧 Configuration

### Next.js Config

- **Monorepo Support:** Transpiles `@aibos/*` packages
- **MCP Support:** Automatically enabled in Next.js 16+
- **Output Tracing:** Configured for monorepo builds

### TypeScript

- Path aliases configured for `@aibos/*` packages
- Includes Next.js type definitions
- Excludes build artifacts

### PostCSS

- Tailwind v4 configuration
- Forms and Typography plugins enabled

## 🎨 Design System

The app uses the AIBOS design system:

- **Tokens:** Defined in `app/globals.css`
- **Components:** From `@aibos/ui` package
- **Dark Mode:** Supported via CSS variables
- **Safe Mode:** Compatible with `[data-safe-mode="true"]`

## 📡 API Routes

### `/api/generate-ui`

**POST** endpoint for generating UI components via MCP.

**Request:**
```json
{
  "componentName": "Button",
  "description": "A primary action button"
}
```

**Response:**
```json
{
  "success": true,
  "code": "// Generated component code..."
}
```

**Note:** Only available in development mode.

## 🔗 Next.js MCP

Next.js 16+ automatically exposes an MCP endpoint at `/_next/mcp` when the dev server is running.

**Available Tools:**
- Runtime diagnostics
- Route information
- Build status
- Documentation search

See [NEXTJS_MCP_GUIDE.md](./NEXTJS_MCP_GUIDE.md) for details.

## 🧪 Development

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code

### Workspace Dependencies

The app uses workspace packages:
- `@aibos/ui` - UI components
- `@aibos/utils` - Utility functions
- `@aibos/types` - TypeScript types
- `@aibos/config-eslint` - ESLint configuration

## 📝 Notes

- Build artifacts (`.next/`, `node_modules/`) are in `.gitignore`
- MCP endpoint only available when dev server is running
- API routes are development-only for security

