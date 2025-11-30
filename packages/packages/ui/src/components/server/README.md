# Server Components

**Official Next.js RSC Architecture - Server-Side Rendering Components**

This directory contains React Server Components that run exclusively on the server and provide
optimal performance through server-side rendering.

## 🎯 RSC Architecture Foundation

Based on
[Next.js Official Documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components):

### **When to Use Server Components:**

- ✅ **Fetch data** from databases or APIs close to the source
- ✅ **Use API keys, tokens, and secrets** without exposing them to client
- ✅ **Reduce JavaScript bundle size** - No client-side JavaScript needed
- ✅ **Improve First Contentful Paint (FCP)** - Faster initial page loads
- ✅ **Stream content progressively** to the client
- ✅ **SEO optimization** - Fully rendered HTML for search engines

### **Required Patterns:**

```tsx
// NO 'use client' directive - Server Component by default

import { getUser } from '@/lib/data'

export default async function ServerComponent({ userId }: { userId: string }) {
  // ✅ Direct data fetching on server
  const user = await getUser(userId)

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

## 📁 Directory Structure

### `/data/` - Data-Fetching Components

Components that fetch and display data from databases, APIs, or external services.

**Examples:** User profiles, Product listings, Blog posts, Analytics dashboards

### `/display/` - Static Display Components

Components that render static content, layouts, and non-interactive UI elements.

**Examples:** Headers, Footers, Static content blocks, Information displays

### `/layout/` - Layout Components

Server-side layout components that structure pages and provide consistent UI patterns.

**Examples:** Page layouts, Navigation structures, Sidebar layouts, Grid systems

## 🚨 Critical Rules

### **✅ MUST DO:**

- NO `'use client'` directive (Server Components by default)
- Use `async/await` for data fetching
- Access server-only resources (databases, file system, environment variables)
- Return serializable JSX (no functions, classes, or complex objects as props)
- Use server-only packages when needed (`import 'server-only'`)

### **❌ NEVER DO:**

- Browser APIs (`window`, `localStorage`, `document`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, `useCallback`, etc.)
- Client-side state management
- Browser-specific functionality

## 🔄 Server → Client Data Flow

```tsx
// ✅ Server Component fetches data and passes to Client Component
// app/dashboard/page.tsx (Server Component)
import ClientChart from './client-chart'
import { getAnalytics } from '@/lib/analytics'

export default async function DashboardPage() {
  // Server-side data fetching with secrets
  const analytics = await getAnalytics({
    apiKey: process.env.ANALYTICS_API_KEY, // Safe on server
  })

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass serializable data to Client Component */}
      <ClientChart data={analytics.chartData} />
    </div>
  )
}
```

## 🎨 Design System Integration

All Server Components must use the AI-BOS design system:

```tsx
import { colorTokens, spacingTokens, componentTokens } from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

export default async function ServerComponent() {
  const data = await fetchData()

  return (
    <div
      className={cn(
        componentTokens.card,
        colorTokens.bgElevated,
        'mcp-server-safe' // Mark as server component in globals.css
      )}
    >
      <h2 className={cn(colorTokens.text, spacingTokens.md)}>{data.title}</h2>
    </div>
  )
}
```

## 🔒 Security Best Practices

```tsx
import 'server-only' // Prevent accidental client usage

import { db } from '@/lib/database'

export default async function SecureComponent() {
  // ✅ Safe - runs only on server
  const sensitiveData = await db.query({
    apiKey: process.env.SECRET_API_KEY,
  })

  return (
    <div>
      {/* Only expose safe, serializable data */}
      <h1>{sensitiveData.publicTitle}</h1>
    </div>
  )
}
```

## 📋 Implementation Checklist

- [ ] NO `'use client'` directive
- [ ] Use `async/await` for data fetching
- [ ] Import server-safe utilities and tokens only
- [ ] Use `mcp-server-*` classes for MCP validation
- [ ] Handle data fetching errors properly
- [ ] Return serializable JSX only
- [ ] Add proper TypeScript types
- [ ] Consider caching and revalidation strategies
- [ ] Use `import 'server-only'` for sensitive modules

## ⚡ Performance Optimization

```tsx
import { unstable_cache } from 'next/cache'

// Cache expensive operations
const getCachedData = unstable_cache(
  async (id: string) => {
    return await expensiveDataFetch(id)
  },
  ['data-cache'],
  { revalidate: 3600 } // 1 hour
)

export default async function OptimizedComponent({ id }: { id: string }) {
  const data = await getCachedData(id)

  return <div>{data.content}</div>
}
```

## 🔗 Related Documentation

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data)
- [AI-BOS Design System](../../design/README.md)
