import * as fs from "fs";
import * as path from "path";
import { metadataRegistry } from "./metadata.registry";
import { validateMetadata } from "../validation/metadata.validator";
import { createContextLogger } from "../observability/logger";

const logger = createContextLogger({ module: "kernel:registry:metadata" });

export async function loadMetadata(enginePath: string) {
  const dir = path.join(enginePath, "metadata");
  if (!fs.existsSync(dir)) return {};

  const files = fs.readdirSync(dir);
  const loaded: any = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const schema = JSON.parse(
      fs.readFileSync(path.join(dir, file), "utf-8")
    );

    const modelName = schema.model || file.replace(".json", "");

    const validation = validateMetadata(schema);
    if (!validation.ok) {
      logger.error({ model: modelName, errors: validation.errors }, "metadata.validation.failed");
      continue;
    }

    metadataRegistry.registerModel(modelName, schema);
    loaded[modelName] = schema;
  }

  return loaded;
}

