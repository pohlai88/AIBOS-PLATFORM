# Kernel Configuration Guide

## Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Choose your storage mode:**
   - `IN_MEMORY`: Fast, for local development (no setup needed)
   - `SUPABASE`: Production PostgreSQL + Redis (requires setup)

3. **Start the kernel:**
   ```bash
   pnpm dev
   ```

---

## Storage Modes

### Development Mode (IN_MEMORY)

**Best for:** Local development, testing, quick prototyping

```env
KERNEL_STORAGE_MODE=IN_MEMORY
AUTH_ENABLE=false
```

- ✅ Zero configuration
- ✅ Fast startup
- ⚠️ Data is ephemeral (lost on restart)
- ⚠️ No distributed locks (single instance only)

### Production Mode (SUPABASE)

**Best for:** Production deployments, staging environments

```env
KERNEL_STORAGE_MODE=SUPABASE
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AUTH_ENABLE=true
```

- ✅ Persistent data
- ✅ Distributed locks via Redis
- ✅ Connection pooling
- ✅ Production-ready
- ⚠️ Requires Supabase/PostgreSQL setup
- ⚠️ Requires Redis setup

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for provisioning (~2 minutes)

### 2. Get Database URL

Navigate to: **Settings → Database → Connection String**

Choose **URI** format and copy:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Add to your `.env.local`:

```env
SUPABASE_DB_URL=postgresql://postgres:...
DATABASE_URL=postgresql://postgres:...
```

### 3. Run Migrations

```bash
pnpm run db:migrate
```

This creates all necessary tables and indexes.

---

## Redis Setup

### Option 1: Upstash (Recommended)

1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the connection string (starts with `redis://`)

```env
REDIS_URL=redis://default:[PASSWORD]@[HOST]:6379
REDIS_TLS=true
```

### Option 2: Local Redis (Development)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

```env
REDIS_URL=redis://localhost:6379
REDIS_TLS=false
```

---

## Authentication

### Development (No Auth)

```env
AUTH_ENABLE=false
```

All requests are treated as anonymous. Good for local development.

### Production (Auth Required)

```env
AUTH_ENABLE=true
AUTH_JWT_ISSUER=https://your-domain.com
AUTH_JWT_AUDIENCE=aibos-production
AUTH_JWT_SECRET=<generate-secure-secret>
AUTH_API_KEY_HASH_SECRET=<generate-secure-secret>
```

**Generate secure secrets:**

```bash
# macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Environment Variables Reference

### Core

| Variable              | Default     | Description                                |
| --------------------- | ----------- | ------------------------------------------ |
| `KERNEL_PORT`         | `5656`      | HTTP port for the Kernel API               |
| `KERNEL_STORAGE_MODE` | `IN_MEMORY` | Storage backend: `IN_MEMORY` or `SUPABASE` |

### Database

| Variable               | Default | Description                  |
| ---------------------- | ------- | ---------------------------- |
| `DATABASE_URL`         | -       | PostgreSQL connection string |
| `SUPABASE_DB_URL`      | -       | Alias for `DATABASE_URL`     |
| `DB_POOL_MAX`          | `10`    | Max connections in pool      |
| `DB_POOL_IDLE_TIMEOUT` | `30000` | Idle timeout (ms)            |
| `DB_QUERY_TIMEOUT_MS`  | `5000`  | Query timeout (ms)           |

### Redis

| Variable               | Default | Description             |
| ---------------------- | ------- | ----------------------- |
| `REDIS_URL`            | -       | Redis connection string |
| `REDIS_TLS`            | `false` | Enable TLS for Redis    |
| `REDIS_MAX_RETRIES`    | `5`     | Max retry attempts      |
| `REDIS_RETRY_DELAY_MS` | `500`   | Retry delay (ms)        |

### Authentication

| Variable                   | Default         | Description            |
| -------------------------- | --------------- | ---------------------- |
| `AUTH_ENABLE`              | `true`          | Enable authentication  |
| `AUTH_JWT_ISSUER`          | `aibos-kernel`  | JWT issuer claim       |
| `AUTH_JWT_AUDIENCE`        | `aibos-clients` | JWT audience claim     |
| `AUTH_JWT_SECRET`          | `dev-secret`    | JWT signing secret     |
| `AUTH_API_KEY_HASH_SECRET` | -               | API key hashing secret |

### Observability

| Variable         | Default | Description                                 |
| ---------------- | ------- | ------------------------------------------- |
| `LOG_LEVEL`      | `info`  | Log level: `debug`, `info`, `warn`, `error` |
| `ENABLE_METRICS` | `true`  | Enable Prometheus metrics                   |
| `METRICS_PORT`   | `9090`  | Prometheus metrics port                     |

### CORS

| Variable          | Default | Description                     |
| ----------------- | ------- | ------------------------------- |
| `ALLOWED_ORIGINS` | -       | Comma-separated allowed origins |

---

## Troubleshooting

### Database Connection Fails

```
Error: DB_CONNECT_FAILED
```

**Solutions:**

1. Check `DATABASE_URL` format
2. Verify password doesn't contain special chars (URL encode if needed)
3. Ensure Supabase project is active
4. Check firewall/network access

### Redis Connection Fails

```
Error: Redis connection degraded
```

**Solutions:**

1. Check `REDIS_URL` format
2. Verify Redis server is running
3. Check `REDIS_TLS` setting matches your Redis config
4. For Upstash, ensure you're using the REST API URL, not the connection string

### Auth Token Invalid

```
Error: Unauthorized (invalid_jwt)
```

**Solutions:**

1. Ensure `AUTH_JWT_SECRET` matches between services
2. Check JWT hasn't expired
3. Verify `AUTH_JWT_ISSUER` and `AUTH_JWT_AUDIENCE` match token claims

---

## Production Checklist

- [ ] `KERNEL_STORAGE_MODE=SUPABASE`
- [ ] `DATABASE_URL` set with real PostgreSQL
- [ ] `REDIS_URL` set with real Redis
- [ ] `AUTH_ENABLE=true`
- [ ] `AUTH_JWT_SECRET` is a secure random value (32+ bytes)
- [ ] `AUTH_API_KEY_HASH_SECRET` is a secure random value
- [ ] `LOG_LEVEL=info` or `warn` (not `debug`)
- [ ] `ALLOWED_ORIGINS` restricted to your domains only
- [ ] All migrations applied: `pnpm run db:migrate`
- [ ] Health check passes: `curl http://localhost:5656/health`

---

## Next Steps

- [Migration Guide](./migrations/README.md)
- [API Documentation](./http/openapi.ts)
- [Architecture Overview](../apps/docs/pages/02-architecture/backend/)
