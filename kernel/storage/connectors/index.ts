/**
 * 🔌 Storage Connectors — Multi-Cloud Support
 * 
 * AI-BOS supports 6 storage providers out of the box:
 * 
 * 1. ✅ Supabase (PostgreSQL SaaS)
 * 2. ✅ AWS RDS (PostgreSQL, Aurora)
 * 3. ✅ Azure SQL Database
 * 4. ✅ Google Cloud SQL (PostgreSQL)
 * 5. ✅ Neon (Serverless PostgreSQL)
 * 6. ✅ Local SQLite (zero-cost development)
 * 
 * All connectors implement the same StorageContract interface,
 * enabling true multi-cloud portability with ZERO code changes.
 */

export { SupabaseConnector, createSupabaseConnector, type SupabaseConfig } from "./supabase.connector";
export { AWSRDSConnector, createAWSConnector, type AWSRDSConfig } from "./aws.connector";
export { AzureSQLConnector, createAzureConnector, type AzureSQLConfig } from "./azure.connector";
export { GCPCloudSQLConnector, createGCPConnector, type GCPCloudSQLConfig } from "./gcp.connector";
export { NeonConnector, createNeonConnector, type NeonConfig } from "./neon.connector";
export { LocalConnector, createLocalConnector, type LocalConfig } from "./local.connector";

import { StorageContract } from "../types";
import { createSupabaseConnector, type SupabaseConfig } from "./supabase.connector";
import { createAWSConnector, type AWSRDSConfig } from "./aws.connector";
import { createAzureConnector, type AzureSQLConfig } from "./azure.connector";
import { createGCPConnector, type GCPCloudSQLConfig } from "./gcp.connector";
import { createNeonConnector, type NeonConfig } from "./neon.connector";
import { createLocalConnector, type LocalConfig } from "./local.connector";

/**
 * Storage provider type
 */
export type StorageProvider = "supabase" | "aws" | "azure" | "gcp" | "neon" | "local";

/**
 * Union type for all provider configurations
 */
export type AnyProviderConfig =
  | SupabaseConfig
  | AWSRDSConfig
  | AzureSQLConfig
  | GCPCloudSQLConfig
  | NeonConfig
  | LocalConfig;

/**
 * Factory function to create any storage connector
 */
export function createStorageConnector(
  provider: StorageProvider,
  config: AnyProviderConfig
): StorageContract {
  switch (provider) {
    case "supabase":
      return createSupabaseConnector(config as SupabaseConfig);
    
    case "aws":
      return createAWSConnector(config as AWSRDSConfig);
    
    case "azure":
      return createAzureConnector(config as AzureSQLConfig);
    
    case "gcp":
      return createGCPConnector(config as GCPCloudSQLConfig);
    
    case "neon":
      return createNeonConnector(config as NeonConfig);
    
    case "local":
      return createLocalConnector(config as LocalConfig);
    
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

/**
 * Get provider display name
 */
export function getProviderName(provider: StorageProvider): string {
  const names: Record<StorageProvider, string> = {
    supabase: "Supabase PostgreSQL",
    aws: "AWS RDS / Aurora",
    azure: "Azure SQL Database",
    gcp: "Google Cloud SQL",
    neon: "Neon Serverless PostgreSQL",
    local: "Local SQLite",
  };
  return names[provider];
}

/**
 * Get provider features
 */
export function getProviderFeatures(provider: StorageProvider): {
  serverless: boolean;
  autoscaling: boolean;
  readReplicas: boolean;
  branches: boolean;
  managed: boolean;
  free: boolean;
} {
  const features = {
    supabase: {
      serverless: false,
      autoscaling: true,
      readReplicas: true,
      branches: false,
      managed: true,
      free: true, // Free tier available
    },
    aws: {
      serverless: true, // Aurora Serverless
      autoscaling: true,
      readReplicas: true,
      branches: false,
      managed: true,
      free: true, // Free tier available (12 months)
    },
    azure: {
      serverless: true, // Serverless tier available
      autoscaling: true,
      readReplicas: true,
      branches: false,
      managed: true,
      free: true, // Free tier available
    },
    gcp: {
      serverless: false,
      autoscaling: true,
      readReplicas: true,
      branches: false,
      managed: true,
      free: true, // Always free tier available
    },
    neon: {
      serverless: true,
      autoscaling: true,
      readReplicas: true,
      branches: true, // Database branching!
      managed: true,
      free: true, // Generous free tier
    },
    local: {
      serverless: false,
      autoscaling: false,
      readReplicas: false,
      branches: false,
      managed: false,
      free: true, // Always free
    },
  };

  return features[provider];
}

/**
 * Recommend provider based on requirements
 */
export function recommendProvider(requirements: {
  budget?: "free" | "low" | "medium" | "high";
  scale?: "small" | "medium" | "large" | "enterprise";
  region?: string;
  compliance?: string[];
  features?: Array<"serverless" | "branches" | "replicas">;
}): StorageProvider[] {
  const { budget = "free", scale = "small", features = [] } = requirements;

  const recommendations: StorageProvider[] = [];

  // Free tier priority
  if (budget === "free") {
    recommendations.push("local", "supabase", "neon");
  }

  // Serverless requirement
  if (features.includes("serverless")) {
    recommendations.push("neon", "aws", "azure");
  }

  // Branching requirement (for dev workflows)
  if (features.includes("branches")) {
    recommendations.push("neon");
  }

  // Enterprise scale
  if (scale === "enterprise") {
    recommendations.push("aws", "gcp", "azure");
  }

  // SME scale
  if (scale === "small" || scale === "medium") {
    recommendations.push("supabase", "neon", "local");
  }

  // Remove duplicates, preserve order
  return [...new Set(recommendations)];
}

