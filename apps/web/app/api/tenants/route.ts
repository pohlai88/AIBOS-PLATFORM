/**
 * Tenants API Route
 * 
 * Example BFF endpoint that uses the Kernel Client SDK
 */

import { NextRequest, NextResponse } from "next/server";
import { kernelClient } from "@/lib/kernel-client";
import { getServerSession } from "@/lib/auth";
import { KernelError } from "@aibos/sdk";

/**
 * GET /api/tenants
 * 
 * List all tenants for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch tenants from Kernel using the SDK
    const result = await kernelClient.tenants.list({
      page: 1,
      pageSize: 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof KernelError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          traceId: error.traceId,
        },
        { status: error.statusCode }
      );
    }

    console.error("[API] Failed to fetch tenants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants
 * 
 * Create a new tenant
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body
    if (!body.name) {
      return NextResponse.json(
        { error: "Tenant name is required" },
        { status: 400 }
      );
    }

    // Create tenant using Kernel SDK
    const tenant = await kernelClient.tenants.create({
      name: body.name,
      config: body.config || {},
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    if (error instanceof KernelError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          traceId: error.traceId,
        },
        { status: error.statusCode }
      );
    }

    console.error("[API] Failed to create tenant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

