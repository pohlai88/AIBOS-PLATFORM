/**
 * FuzzHarness - Fuzz testing for input validation
 * 
 * Hardening v2: Generate malformed inputs to find edge cases (internal testing only)
 */

export type FuzzStrategy = "string" | "number" | "object" | "array" | "boundary" | "json";

export class FuzzHarness {
  /**
   * Generate random JSON structure
   */
  static randomJson(depth = 2): unknown {
    if (depth <= 0) return Math.random().toString(36).slice(2);
    const obj: Record<string, unknown> = {};
    const keys = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < keys; i++) {
      obj[`k${i}`] = this.randomJson(depth - 1);
    }
    return obj;
  }

  /**
   * Generate multiple random payloads
   */
  static generatePayloads(count = 10): unknown[] {
    return Array.from({ length: count }, () => this.randomJson(3));
  }

  /**
   * Generate fuzzed string values
   */
  static fuzzString(): string[] {
    return [
      "",
      " ",
      "\n\t\r",
      "a".repeat(10000),
      "<script>alert(1)</script>",
      "'; DROP TABLE users; --",
      "../../../etc/passwd",
      "\0\0\0",
      "🔥".repeat(100),
      String.fromCharCode(...Array(256).keys()),
      "null",
      "undefined",
      "true",
      "false",
      "NaN",
      "Infinity",
      "-Infinity",
    ];
  }

  /**
   * Generate fuzzed number values
   */
  static fuzzNumber(): number[] {
    return [
      0,
      -1,
      -0,
      1,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Infinity,
      -Infinity,
      NaN,
      0.1 + 0.2, // floating point edge case
      1e308,
      1e-308,
    ];
  }

  /**
   * Generate fuzzed object values
   */
  static fuzzObject(): any[] {
    return [
      null,
      undefined,
      {},
      { __proto__: { admin: true } },
      { constructor: { prototype: {} } },
      { toString: () => { throw new Error(); } },
      Object.create(null),
      { get trap() { throw new Error("getter trap"); } },
    ];
  }

  /**
   * Generate fuzzed array values
   */
  static fuzzArray(): any[][] {
    return [
      [],
      [null],
      [undefined],
      Array(10000).fill(0),
      [{ circular: null as any }],
      Array(100).fill({}).map((_, i) => ({ id: i })),
    ];
  }

  /**
   * Run fuzz test on a function
   */
  static async fuzzTest(
    fn: (input: any) => any,
    strategy: FuzzStrategy = "string"
  ): Promise<{ passed: number; failed: { input: any; error: string }[] }> {
    const inputs = this.getInputs(strategy);
    const results = { passed: 0, failed: [] as { input: any; error: string }[] };

    for (const input of inputs) {
      try {
        await fn(input);
        results.passed++;
      } catch (err: any) {
        results.failed.push({ input, error: err.message });
      }
    }

    return results;
  }

  /**
   * Get inputs for strategy
   */
  static getInputs(strategy: FuzzStrategy): any[] {
    switch (strategy) {
      case "string": return this.fuzzString();
      case "number": return this.fuzzNumber();
      case "object": return this.fuzzObject();
      case "array": return this.fuzzArray();
      case "boundary": return [...this.fuzzString(), ...this.fuzzNumber()];
      case "json": return this.generatePayloads(20);
      default: return [];
    }
  }

  /**
   * Generate payload that violates a schema
   */
  static generateSchemaViolations(schema: Record<string, any>): any[] {
    const violations: any[] = [];
    
    // Missing required fields
    if (schema.required) {
      for (const field of schema.required) {
        const obj: any = {};
        for (const key of schema.required) {
          if (key !== field) obj[key] = "valid";
        }
        violations.push(obj);
      }
    }

    // Wrong types
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties as Record<string, any>)) {
        const obj: any = {};
        obj[key] = prop.type === "string" ? 12345 : "wrong-type";
        violations.push(obj);
      }
    }

    return violations;
  }
}
