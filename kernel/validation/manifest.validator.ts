export async function validateManifest(manifest: any) {
  const errors: string[] = [];

  if (!manifest.name) errors.push("Missing 'name'");
  if (!manifest.version) errors.push("Missing 'version'");
  if (!manifest.entrypoints) errors.push("Missing 'entrypoints'");

  if (manifest.entrypoints) {
    if (!manifest.entrypoints.actions)
      errors.push("Missing 'entrypoints.actions'");
    if (!manifest.entrypoints.metadata)
      errors.push("Missing 'entrypoints.metadata'");
    if (!manifest.entrypoints.ui)
      errors.push("Missing 'entrypoints.ui'");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
