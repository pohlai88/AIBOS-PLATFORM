// tests/integration/slices/accounting.read.journal_entries.test.ts
/**
 * Integration test for accounting.read.journal_entries
 * 
 * Tests:
 * - Contract validation (input/output)
 * - Tenant isolation
 * - Event emission
 * - Error handling
 * 
 * Maturity Level: 3 (Observable)
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { kernelContainer } from "../../../core/container";
import { actionDispatcher } from "../../../dispatcher/action.dispatcher";
import {
  seedTestData,
  cleanupTestData,
} from "../../utils/test-db";
import { buildTestContext } from "../../utils/test-context";
import {
  globalEventTracker,
  resetEvents,
} from "../../utils/event-tracker";

describe("Slice: accounting.read.journal_entries (Level 3 - Observable)", () => {
  beforeAll(async () => {
    // Seed test data for both tenants
    await seedTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();

    // Shutdown container
    await kernelContainer.shutdown();
  });

  it("should validate input schema - reject invalid page number", async () => {
    const context = await buildTestContext({
      input: { page: -1 }, // Invalid: page must be >= 1
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
    });

    const result = await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: -1 },
      context
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INPUT_VALIDATION_FAILED");
  });

  it("should return data for valid request", async () => {
    const context = await buildTestContext({
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
    });

    const result = await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: 1, pageSize: 10 },
      context
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("items");
    expect(Array.isArray(result.data.items)).toBe(true);
  });

  it("should enforce tenant isolation", async () => {
    // Query as tenant-a
    const contextA = await buildTestContext({
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
    });

    const resultA = await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: 1, pageSize: 100 },
      contextA
    );

    expect(resultA.success).toBe(true);

    // All returned entries should belong to tenant-a
    const allTenantA = resultA.data.items.every(
      (entry: any) => entry.tenantId === "tenant-a"
    );
    expect(allTenantA).toBe(true);

    // Query as tenant-b
    const contextB = await buildTestContext({
      tenant: "tenant-b",
      user: { id: "user-2", permissions: ["*"] },
    });

    const resultB = await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: 1, pageSize: 100 },
      contextB
    );

    expect(resultB.success).toBe(true);

    // All returned entries should belong to tenant-b
    const allTenantB = resultB.data.items.every(
      (entry: any) => entry.tenantId === "tenant-b"
    );
    expect(allTenantB).toBe(true);

    // No overlap between tenant data
    const idsA = new Set(resultA.data.items.map((e: any) => e.id));
    const idsB = new Set(resultB.data.items.map((e: any) => e.id));
    const intersection = [...idsA].filter((id) => idsB.has(id));
    expect(intersection.length).toBe(0);
  });

  it("should emit events during execution", async () => {
    resetEvents();

    const context = await buildTestContext({
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
      emit: (event, payload) => {
        globalEventTracker.track(event, payload);
      },
    });

    await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: 1 },
      context
    );

    // Verify events were emitted
    expect(globalEventTracker.count()).toBeGreaterThan(0);
  });

  it("should handle missing action gracefully", async () => {
    const context = await buildTestContext({
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
    });

    const result = await actionDispatcher.dispatch(
      "non.existent.action",
      { page: 1 },
      context
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("ACTION_NOT_FOUND");
  });

  it("should include metadata in response", async () => {
    const context = await buildTestContext({
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
    });

    const result = await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: 1 },
      context
    );

    expect(result.meta).toBeDefined();
    expect(result.meta.actionId).toBe("accounting.read.journal_entries");
    expect(result.meta.duration).toBeGreaterThanOrEqual(0);
    expect(result.meta.timestamp).toBeDefined();
    expect(result.meta.requestId).toBeDefined();
  });

  it("should support pagination", async () => {
    const context = await buildTestContext({
      tenant: "tenant-a",
      user: { id: "user-1", permissions: ["*"] },
    });

    const result = await actionDispatcher.dispatch(
      "accounting.read.journal_entries",
      { page: 1, pageSize: 1 },
      context
    );

    expect(result.success).toBe(true);
    expect(result.data.items.length).toBeLessThanOrEqual(1);
    expect(result.data.page).toBe(1);
    expect(result.data.pageSize).toBe(1);
  });
});
