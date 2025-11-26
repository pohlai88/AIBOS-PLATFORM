import { enforceHardBlocks } from "./guards/hard-blocks";
import { validateActionInput } from "./validators/input.validator";
import { validateActionOutput } from "./validators/output.validator";
import { safeAwait } from "../hardening/guards/safe-await";

export async function executeInSandbox(actionFn: Function, ctx: any) {
  // 1. Block dangerous constructs
  enforceHardBlocks(actionFn);

  // 2. Freeze ctx so actions cannot mutate it
  const frozenCtx = Object.freeze({ ...ctx });

  // 3. Validate input schema (if defined)
  if (ctx.schema?.input) {
    validateActionInput(ctx.schema.input, ctx.input);
  }

  // 4. Execute action inside controlled environment
  const [err, output] = await safeAwait(
    Promise.resolve(actionFn(frozenCtx))
  );

  if (err) throw err;

  // 5. Validate output schema (if defined)
  if (ctx.schema?.output) {
    validateActionOutput(ctx.schema.output, output);
  }

  // 6. Freeze output so actions cannot leak prototypes
  return Object.freeze(output);
}

