/**
 * Health Check API Route
 * 
 * Checks health of the BFF and Kernel backend
 */

import { NextResponse } from "next/server";
import { kernelClient } from "@/lib/kernel-client";

export async function GET() {
  try {
    // Check Kernel health
    const kernelHealth = await kernelClient.health.check();

    // Overall status
    const overallStatus = kernelHealth.status === "healthy" ? "healthy" : "degraded";

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        bff: {
          status: "healthy",
        },
        kernel: {
          status: kernelHealth.status,
          version: kernelHealth.version,
          checks: kernelHealth.checks,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "down",
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          bff: {
            status: "healthy",
          },
          kernel: {
            status: "down",
            error: error.message,
          },
        },
      },
      { status: 503 }
    );
  }
}

