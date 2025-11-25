/**
 * Constitution Loader
 * 
 * Loads constitution YAML files from packages/ui/constitution/
 * 
 * @module load-constitution
 */

import fs from "fs";
import yaml from "yaml";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../../");

/**
 * Load a constitution YAML file
 * 
 * @param {string} name - Constitution name (without .yml extension)
 * @returns {Object} Parsed YAML content
 */
export function loadConstitution(name) {
  const file = fs.readFileSync(
    path.join(workspaceRoot, `packages/ui/constitution/${name}.yml`),
    "utf8"
  );
  return yaml.parse(file);
}

/**
 * Load constitution index
 * 
 * @returns {Object} Constitution index
 */
export function loadConstitutionIndex() {
  const indexPath = path.join(__dirname, "constitution-index.yml");
  const file = fs.readFileSync(indexPath, "utf8");
  return yaml.parse(file);
}
