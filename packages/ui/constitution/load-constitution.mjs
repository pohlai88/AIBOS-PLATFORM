/**
 * AI-BOS Constitution Loader
 * 
 * Loads and parses YAML constitution files.
 * Provides centralized access to constitution rules for all validators.
 * 
 * @module load-constitution
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load a constitution file by name
 * 
 * @param {string} name - Constitution name (e.g., "tokens", "components", "rsc")
 * @returns {Object} Parsed YAML constitution
 * @throws {Error} If constitution file not found or invalid
 */
export function loadConstitution(name) {
  const constitutionPath = path.join(
    __dirname,
    `${name}.yml`
  );

  if (!fs.existsSync(constitutionPath)) {
    throw new Error(
      `Constitution file not found: ${constitutionPath}. ` +
      `Available: tokens.yml, components.yml, rsc.yml`
    );
  }

  try {
    const fileContent = fs.readFileSync(constitutionPath, "utf8");
    const constitution = yaml.parse(fileContent);
    
    // Validate constitution structure
    if (!constitution.constitution && !constitution.constitutions) {
      throw new Error(
        `Invalid constitution structure in ${name}.yml. ` +
        `Expected 'constitution' or 'constitutions' key.`
      );
    }

    return constitution;
  } catch (error) {
    if (error instanceof yaml.YAMLError) {
      throw new Error(
        `Failed to parse ${name}.yml: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Load the constitution index
 * 
 * @returns {Object} Constitution index with all constitutions and validators
 */
export function loadConstitutionIndex() {
  const indexPath = path.join(__dirname, "constitution-index.yml");
  
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Constitution index not found: ${indexPath}`
    );
  }

  try {
    const fileContent = fs.readFileSync(indexPath, "utf8");
    return yaml.parse(fileContent);
  } catch (error) {
    if (error instanceof yaml.YAMLError) {
      throw new Error(
        `Failed to parse constitution-index.yml: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Get all constitution names from index
 * 
 * @returns {string[]} Array of constitution names
 */
export function getConstitutionNames() {
  const index = loadConstitutionIndex();
  return index.constitutions.map(c => c.name);
}

/**
 * Get validator module path for a constitution
 * 
 * @param {string} constitutionName - Constitution name
 * @returns {string|null} Validator module path or null
 */
export function getValidatorForConstitution(constitutionName) {
  const index = loadConstitutionIndex();
  const constitution = index.constitutions.find(c => c.name === constitutionName);
  return constitution?.validator || null;
}

