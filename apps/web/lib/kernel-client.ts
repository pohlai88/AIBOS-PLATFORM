/**
 * Kernel Client for Web App
 * 
 * Singleton instance of the Kernel SDK configured for the BFF layer
 */

import { KernelClient } from "@aibos/sdk";

if (!process.env.KERNEL_URL) {
    throw new Error("KERNEL_URL environment variable is required");
}

export const kernelClient = new KernelClient({
    baseUrl: process.env.KERNEL_URL,
    apiKey: process.env.KERNEL_API_KEY,
    timeout: 30000,
    retry: true,
    maxRetries: 3,
});

/**
 * Create a Kernel client with user authentication
 * 
 * Use this when you need to forward user JWT tokens to the Kernel
 */
export function createKernelClientWithAuth(getToken: () => Promise<string> | string) {
    return new KernelClient({
        baseUrl: process.env.KERNEL_URL!,
        getToken,
        timeout: 30000,
        retry: true,
        maxRetries: 3,
    });
}

