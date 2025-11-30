export function enforceHardBlocks(fn: Function) {
  const fnString = fn.toString();

  for (const blocked of [
    "require(",
    "import(",
    "eval(",
    "Function(",
    "process.",
    "globalThis.",
    "module.exports",
  ]) {
    if (fnString.includes(blocked)) {
      throw new Error(`Sandbox security: action contains forbidden code: ${blocked}`);
    }
  }
}

