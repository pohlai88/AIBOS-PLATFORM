/**
 * Authentication Utilities for BFF Layer
 */

import { cookies } from "next/headers";

export interface Session {
  user: {
    id: string;
    email: string;
    tenant_id: string;  // Multi-tenant isolation
    role?: string;
  };
  accessToken: string;
}

/**
 * Get server-side session
 * 
 * In production, this would integrate with Supabase Auth or your auth provider
 */
export async function getServerSession(): Promise<Session | null> {
  // TODO: Integrate with Supabase Auth
  // For now, this is a placeholder

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return null;
  }

  // In production, verify and decode the session token
  // JWT should contain: user_id, email, tenant_id, role
  // Example: const decoded = jwt.verify(sessionCookie, JWT_SECRET);

  // For now, return a mock session for development
  return {
    user: {
      id: "user-123",
      email: "dev@example.com",
      tenant_id: "tenant-demo-001",  // Multi-tenant ID from JWT
      role: "user",
    },
    accessToken: "mock-jwt-token",
  };
}

/**
 * Require authentication
 * 
 * Throws an error if user is not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

