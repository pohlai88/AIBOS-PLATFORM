# Supabase MCP Server

> **Database and Storage Operations for AI-BOS**

---

## Overview

The Supabase MCP Server provides AI agents and the AI-BOS platform with direct access to Supabase database operations, storage management, and authentication capabilities through the Model Context Protocol.

### Features

- 🗄️ **Database Operations**: Query, insert, update, delete with filtering and pagination
- 📦 **Storage Management**: Upload, download, list files in Supabase Storage buckets
- 🔧 **RPC Functions**: Call custom PostgreSQL functions
- 📊 **Schema Introspection**: List tables and inspect table schemas
- ✅ **Type-Safe**: Full TypeScript support with Zod validation

---

## Installation

```bash
cd .mcp/supabase
pnpm install
```

---

## Configuration

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
```

### Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to **Settings → API**
3. Copy your **Project URL** → `SUPABASE_URL`
4. Copy your **anon/public key** → `SUPABASE_KEY` (for client-side operations)
5. Or copy your **service_role key** → `SUPABASE_KEY` (for admin operations, bypasses RLS)

---

## Usage

### Running the Server

```bash
# Development mode (with auto-reload)
pnpm dev

# Production mode
pnpm build
pnpm start
```

### Connecting via MCP Client

Add to your MCP client configuration (e.g., Claude Desktop, Cursor, VSCode):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["D:\\AIBOS-PLATFORM\\.mcp\\supabase\\dist\\server.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your-key-here"
      }
    }
  }
}
```

---

## Available Tools

### Database Operations

#### `supabase_query`
Execute SELECT queries with filtering, sorting, and pagination.

```typescript
{
  table: "users",
  select: "id, name, email",
  filters: { status: "active" },
  orderBy: "created_at",
  ascending: false,
  limit: 10,
  offset: 0
}
```

#### `supabase_insert`
Insert one or more rows.

```typescript
{
  table: "users",
  data: { name: "John", email: "john@example.com" }
}
```

#### `supabase_update`
Update rows matching filter conditions.

```typescript
{
  table: "users",
  filters: { id: 123 },
  data: { status: "inactive" }
}
```

#### `supabase_delete`
Delete rows matching filter conditions.

```typescript
{
  table: "users",
  filters: { id: 123 }
}
```

### Storage Operations

#### `supabase_storage_upload`
Upload files to Supabase Storage.

```typescript
{
  bucket: "avatars",
  path: "user123.png",
  data: "base64-encoded-content",
  contentType: "image/png"
}
```

#### `supabase_storage_download`
Download files from storage.

```typescript
{
  bucket: "avatars",
  path: "user123.png"
}
```

#### `supabase_storage_list`
List files in a bucket.

```typescript
{
  bucket: "avatars",
  path: "public/" // optional subfolder
}
```

### Schema & Metadata

#### `supabase_list_tables`
List all tables in the database.

```typescript
{}
```

#### `supabase_table_schema`
Get column definitions for a table.

```typescript
{
  table: "users"
}
```

### Custom Functions

#### `supabase_rpc`
Call PostgreSQL RPC functions.

```typescript
{
  function: "calculate_total",
  params: { user_id: 123 }
}
```

---

## Available Resources

### `supabase://tables`
Returns a list of all database tables.

### `supabase://buckets`
Returns a list of all storage buckets.

---

## Security Considerations

### Row Level Security (RLS)

- Use the **anon key** for client-side operations (respects RLS policies)
- Use the **service_role key** for admin operations (bypasses RLS)

### Best Practices

1. **Never expose service_role key** to client-side code
2. **Enable RLS** on all tables in production
3. **Use policies** to restrict data access per user/tenant
4. **Validate inputs** using Zod schemas before database operations
5. **Use prepared statements** (Supabase client handles this automatically)

---

## Integration with AI-BOS Kernel

The Supabase connector is already integrated in the kernel:

```typescript
// kernel/storage/connectors/supabase.connector.ts
import { supabaseConnector } from './connectors/supabase.connector';

// Use via storage abstraction
const data = await storage.findMany('users', {
  where: { status: 'active' },
  limit: 10
});
```

---

## Troubleshooting

### Error: "Invalid Supabase configuration"

- Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set
- Verify the URL format: `https://[project-ref].supabase.co`

### Error: "Table does not exist"

- Check that the table exists in your Supabase dashboard
- Verify you're using the correct table name (case-sensitive)

### Error: "Permission denied"

- Check your Row Level Security (RLS) policies
- Verify you're using the correct API key (anon vs service_role)

---

## Examples

### Example 1: Query with Filters

```typescript
// Get active users created in the last 7 days
{
  tool: "supabase_query",
  arguments: {
    table: "users",
    select: "id, name, email, created_at",
    filters: {
      status: "active",
      created_at: ">2024-11-21"
    },
    orderBy: "created_at",
    ascending: false,
    limit: 50
  }
}
```

### Example 2: Bulk Insert

```typescript
{
  tool: "supabase_insert",
  arguments: {
    table: "logs",
    data: [
      { event: "user_login", user_id: 123 },
      { event: "page_view", user_id: 456 }
    ]
  }
}
```

### Example 3: File Upload

```typescript
{
  tool: "supabase_storage_upload",
  arguments: {
    bucket: "documents",
    path: "reports/2024-q4.pdf",
    data: "base64-pdf-content",
    contentType: "application/pdf"
  }
}
```

---

## Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Testing

```bash
# Run integration tests (requires test database)
pnpm test
```

---

## Roadmap

- [ ] Real-time subscriptions support
- [ ] Batch operations optimization
- [ ] Connection pooling
- [ ] Schema migrations via MCP
- [ ] Edge Functions integration

---

**Status:** ✅ **Production Ready**  
**Version:** 1.0.0  
**Last Updated:** 2025-11-28  
**Maintainer:** AI-BOS Platform Team
