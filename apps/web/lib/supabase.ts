import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Client for Web App
 * 
 * This client is used for:
 * - Storage operations (file uploads, signed URLs)
 * - Direct database queries (when bypassing Kernel)
 * - Real-time subscriptions
 */

// Client-side Supabase client (uses anon key)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Server-side Supabase client (uses service role key)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Generate a signed URL for a file in Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path within bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }

  return data?.signedUrl || null;
}

/**
 * Upload a file to Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path within bucket
 * @param file - File or Blob to upload
 * @param options - Upload options
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
    contentType?: string;
  }
) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || "3600",
      upsert: options?.upsert || false,
      contentType: options?.contentType,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path within bucket
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = createServerClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  return true;
}

/**
 * Download a file from Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path within bucket
 */
export async function downloadFile(bucket: string, path: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return data;
}

