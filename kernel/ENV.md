# Kernel Environment Variables

Create a `.env` file in `kernel/` with these variables:

```env
# ============================================================
# AI-BOS Kernel Environment Variables
# ============================================================

# ─────────────────────────────────────────────────────────────
# Core
# ─────────────────────────────────────────────────────────────
KERNEL_PORT=5656

# ─────────────────────────────────────────────────────────────
# Storage Mode
# ─────────────────────────────────────────────────────────────
# IN_MEMORY = Local development (no external deps)
# SUPABASE  = Production (requires Postgres + Redis)
KERNEL_STORAGE_MODE=SUPABASE

# ─────────────────────────────────────────────────────────────
# Supabase / PostgreSQL
# ─────────────────────────────────────────────────────────────
SUPABASE_PROJECT_REF=cnlutbuzjqtuicngldak
SUPABASE_URL=https://cnlutbuzjqtuicngldak.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNubHV0YnV6anF0dWljbmdsZGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzQxMjEsImV4cCI6MjA3OTc1MDEyMX0.E7RNplzVDXpCaC1jhht4S5114v8jnIYvOI5F5Dk98hY

# Direct Postgres connection (Transaction pooler - port 6543)
SUPABASE_DB_URL=postgres://postgres.cnlutbuzjqtuicngldak:Weepohlai88!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Pool settings
DB_POOL_MAX=10                    # Max connections in pool
DB_POOL_IDLE_TIMEOUT=30000        # Idle timeout (ms)
DB_QUERY_TIMEOUT_MS=5000          # Query timeout (ms)
DB_CONNECTION_TIMEOUT_MS=5000     # Connection timeout (ms)

# ─────────────────────────────────────────────────────────────
# Redis (Upstash)
# ─────────────────────────────────────────────────────────────
# Note: "rediss://" (with double s) = TLS enabled
REDIS_URL=rediss://default:AZ1YAAIncDJjMTBlOWZiMDQxNGI0MjQ1YjA0MWI2NTQ3MzBkZGQxNnAyNDAyODA@picked-drake-40280.upstash.io:6379
REDIS_TLS=true
REDIS_MAX_RETRIES=5
REDIS_RETRY_DELAY_MS=500
REDIS_COMMAND_TIMEOUT_MS=2000

# Upstash REST API (optional - for Edge Functions)
UPSTASH_REDIS_REST_URL=https://picked-drake-40280.upstash.io
UPSTASH_REDIS_REST_TOKEN=AZ1YAAIncDJjMTBlOWZiMDQxNGI0MjQ1YjA0MWI2NTQ3MzBkZGQxNnAyNDAyODA

# ─────────────────────────────────────────────────────────────
# AI / LLM (Lynx)
# ─────────────────────────────────────────────────────────────
# Local Ollama (primary)
OLLAMA_URL=http://localhost:11434
LYNX_MODEL=deepseek-r1:7b

# OpenAI fallback
OPENAI_API_KEY=sk-...
OPENAI_FALLBACK_MODEL=gpt-4o-mini

# ─────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────
AUTH_ENABLE=true
AUTH_JWT_ISSUER=aibos-kernel
AUTH_JWT_AUDIENCE=aibos-clients
AUTH_JWT_SECRET=super-secret-change-me    # Move to Vault/KMS in prod
AUTH_API_KEY_HASH_SECRET=change-me-too    # For hashing API keys
```

## Quick Setup

### Development (IN_MEMORY)

```env
KERNEL_STORAGE_MODE=IN_MEMORY
KERNEL_PORT=5656
```

### Production (SUPABASE)

```env
KERNEL_STORAGE_MODE=SUPABASE
SUPABASE_DB_URL=postgres://postgres.cnlutbuzjqtuicngldak:Weepohlai88!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
REDIS_URL=redis://...
```

## Supabase Project Info

| Key         | Value                                      |
| ----------- | ------------------------------------------ |
| Project Ref | `cnlutbuzjqtuicngldak`                     |
| API URL     | `https://cnlutbuzjqtuicngldak.supabase.co` |
| Region      | `ap-southeast-1` (Singapore)               |

## Where to get credentials

| Service       | Dashboard                                                                     |
| ------------- | ----------------------------------------------------------------------------- |
| Supabase      | https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/settings/database |
| Upstash Redis | https://console.upstash.com                                                   |

## Notes

- **Database Password**: Get from Supabase Dashboard → Settings → Database → Database password
- **Redis**: Upstash is recommended for serverless Redis with Supabase
- **Port 6543**: Transaction pooler (recommended for serverless)
- **Port 5432**: Direct connection (for migrations)
