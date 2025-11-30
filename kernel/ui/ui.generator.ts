import { uiRegistry } from "./ui.registry";
import { defaultUIForModel } from "./ui.defaults";
import { metadataRegistry } from "../registry/metadata.registry";

export function getUISchema(model: string) {
  const metadata = metadataRegistry.getModel(model);
  if (!metadata) throw new Error(`No metadata for model '${model}'`);

  const defaultSchema = defaultUIForModel(metadata);
  const custom = uiRegistry.get(model);

  return custom
    ? deepMerge(defaultSchema, custom)
    : defaultSchema;
}

function deepMerge(base: any, override: any) {
  return {
    ...base,
    ...override,
    form: {
      ...base.form,
      ...override.form,
      fields: {
        ...base.form.fields,
        ...override.form?.fields
      }
    },
    table: {
      ...base.table,
      ...override.table
    }
  };
}

