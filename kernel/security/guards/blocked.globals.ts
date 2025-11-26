/**
 * List of forbidden global APIs inside the sandbox.
 * This prevents engines from escaping or reaching Node internals.
 */

export const BLOCKED_GLOBALS = [
  "process",
  "require",
  "Function",
  "eval",
  "global",
  "globalThis",
  "module",
  "exports",
  "constructor",
  "Deno",
  "__dirname",
  "__filename"
];

