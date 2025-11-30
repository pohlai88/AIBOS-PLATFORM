// kernel/storage/supabase.ts

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { KernelError } from "../errors/KernelError";

// You can later define a typed Database interface:
// type Database = ...
// and do: SupabaseClient<Database>

let supabase: SupabaseClient | null = null;

const MAX_RETRIES = 5;

export function initSupabaseClient() {
  if (supabase) return supabase;

  // Local development defaults
  const url =
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_LOCAL_URL ||
    "http://127.0.0.1:54321";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_LOCAL_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"; // Supabase local default

  supabase = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });

  return supabase;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new KernelError("SUPABASE_NOT_INITIALIZED", {
      message: "Call initSupabaseClient() during kernel bootstrap",
    });
  }
  return supabase;
}

// Generic retry wrapper for Supabase operations
export async function withSupabaseRetry<T>(
  op: (client: SupabaseClient) => Promise<T>,
): Promise<T> {
  const client = getSupabaseClient();
  let attempt = 0;

  // Simple exponential backoff
  while (attempt < MAX_RETRIES) {
    try {
      return await op(client);
    } catch (error) {
      attempt++;
      if (attempt >= MAX_RETRIES) {
        throw new KernelError("SUPABASE_OPERATION_FAILED", {
          message: "Supabase operation failed after retries",
          metadata: { attempts: attempt },
          cause: error instanceof Error ? error : new Error(String(error)),
        });
      }
      await new Promise((r) => setTimeout(r, 100 * attempt));
    }
  }

  // Should never reach here
  throw new KernelError("SUPABASE_RETRY_LOGIC_BROKEN", {
    message: "Supabase retry logic reached unreachable code",
  });
}

export async function checkSupabaseHealth() {
  try {
    const client = getSupabaseClient();

    // You can later create a dedicated table like `kernel_health_ping`.
    // For now, this is a placeholder you can adapt.
    const { error } = await client
      .from("kernel_health_ping")
      .select("id")
      .limit(1);

    if (error) {
      return { status: "error" as const, error };
    }
    return { status: "ok" as const };
  } catch (error) {
    return {
      status: "error" as const,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

