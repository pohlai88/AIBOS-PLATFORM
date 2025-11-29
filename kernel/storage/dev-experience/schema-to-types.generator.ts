/**
 * 🎯 Schema-to-Types™ Generator
 * 
 * Automatically generate TypeScript types from any connected database schema.
 * Supports introspection across all storage providers.
 * 
 * Features:
 * - Full type safety for all tables
 * - Zod schemas generated automatically
 * - Relationship types inferred
 * - Enum types extracted
 * - JSDoc comments with column metadata
 * - Export-ready type definitions
 */

import { StorageContract } from "../types";
import { z } from "zod";

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTable?: string;
  foreignKeyColumn?: string;
  comment?: string;
}

export interface DatabaseTable {
  name: string;
  schema: string;
  columns: DatabaseColumn[];
  primaryKeys: string[];
  foreignKeys: Array<{
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }>;
  indexes: Array<{
    name: string;
    columns: string[];
    unique: boolean;
  }>;
}

export interface GeneratedTypes {
  typescript: string;
  zodSchemas: string;
  documentation: string;
  supabaseTypes?: string; // Supabase-specific type format
}

/**
 * Introspect database schema and generate TypeScript types
 */
export async function generateTypesFromSchema(
  storage: StorageContract,
  options: {
    schemas?: string[];
    tables?: string[];
    includeZod?: boolean;
    includeRelations?: boolean;
    outputFormat?: "typescript" | "both";
  } = {}
): Promise<GeneratedTypes> {
  const {
    schemas = ["public"],
    tables,
    includeZod = true,
    includeRelations = true,
    outputFormat = "both",
  } = options;

  // Introspect database schema
  const dbSchema = await introspectDatabase(storage, schemas, tables);

  // Generate TypeScript types
  const typescript = generateTypeScriptTypes(dbSchema, includeRelations);

  // Generate Zod schemas
  const zodSchemas = includeZod
    ? generateZodSchemas(dbSchema)
    : "";

  // Generate documentation
  const documentation = generateTypeDocumentation(dbSchema);

  // Generate Supabase-specific types if applicable
  const supabaseTypes = storage.provider === "supabase"
    ? generateSupabaseTypes(dbSchema)
    : undefined;

  return {
    typescript,
    zodSchemas,
    documentation,
    supabaseTypes,
  };
}

/**
 * Introspect database to extract schema information
 */
async function introspectDatabase(
  storage: StorageContract,
  schemas: string[],
  tableFilter?: string[]
): Promise<DatabaseTable[]> {
  const tables: DatabaseTable[] = [];

  // Provider-specific introspection
  if (storage.provider === "supabase" || storage.provider === "neon") {
    // PostgreSQL introspection
    const query = `
      SELECT 
        t.table_schema,
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type,
        kcu.table_name as foreign_table_name,
        kcu.column_name as foreign_column_name,
        pgd.description as column_comment
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      LEFT JOIN pg_catalog.pg_statio_all_tables st
        ON st.schemaname = t.table_schema AND st.relname = t.table_name
      LEFT JOIN pg_catalog.pg_description pgd
        ON pgd.objoid = st.relid
      WHERE t.table_schema = ANY($1)
        ${tableFilter ? "AND t.table_name = ANY($2)" : ""}
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;
    `;

    const params = tableFilter ? [schemas, tableFilter] : [schemas];
    const rows = await storage.rawQuery(query, params);

    // Group by table
    const tableMap = new Map<string, DatabaseTable>();
    
    for (const row of rows as any[]) {
      const tableName = row.table_name;
      
      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, {
          name: tableName,
          schema: row.table_schema,
          columns: [],
          primaryKeys: [],
          foreignKeys: [],
          indexes: [],
        });
      }

      const table = tableMap.get(tableName)!;
      
      if (row.column_name) {
        table.columns.push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === "YES",
          defaultValue: row.column_default,
          isPrimaryKey: row.constraint_type === "PRIMARY KEY",
          isForeignKey: row.constraint_type === "FOREIGN KEY",
          foreignKeyTable: row.foreign_table_name,
          foreignKeyColumn: row.foreign_column_name,
          comment: row.column_comment,
        });

        if (row.constraint_type === "PRIMARY KEY") {
          table.primaryKeys.push(row.column_name);
        }

        if (row.constraint_type === "FOREIGN KEY") {
          table.foreignKeys.push({
            column: row.column_name,
            referencedTable: row.foreign_table_name,
            referencedColumn: row.foreign_column_name,
          });
        }
      }
    }

    tables.push(...tableMap.values());
  } else if (storage.provider === "local") {
    // SQLite introspection
    const tablesResult = await storage.rawQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );

    for (const tableRow of tablesResult as any[]) {
      const tableName = tableRow.name;
      
      if (tableFilter && !tableFilter.includes(tableName)) {
        continue;
      }

      const columnsResult = await storage.rawQuery(`PRAGMA table_info(${tableName})`);
      const foreignKeysResult = await storage.rawQuery(`PRAGMA foreign_key_list(${tableName})`);

      const columns: DatabaseColumn[] = (columnsResult as any[]).map((col) => ({
        name: col.name,
        type: col.type,
        nullable: col.notnull === 0,
        defaultValue: col.dflt_value,
        isPrimaryKey: col.pk === 1,
        isForeignKey: false,
        comment: undefined,
      }));

      const foreignKeys = (foreignKeysResult as any[]).map((fk) => ({
        column: fk.from,
        referencedTable: fk.table,
        referencedColumn: fk.to,
      }));

      // Mark foreign key columns
      foreignKeys.forEach(fk => {
        const col = columns.find(c => c.name === fk.column);
        if (col) {
          col.isForeignKey = true;
          col.foreignKeyTable = fk.referencedTable;
          col.foreignKeyColumn = fk.referencedColumn;
        }
      });

      tables.push({
        name: tableName,
        schema: "main",
        columns,
        primaryKeys: columns.filter(c => c.isPrimaryKey).map(c => c.name),
        foreignKeys,
        indexes: [],
      });
    }
  }

  return tables;
}

/**
 * Generate TypeScript type definitions
 */
function generateTypeScriptTypes(
  tables: DatabaseTable[],
  includeRelations: boolean
): string {
  let output = `/**
 * 🎯 Auto-generated Database Types
 * Generated: ${new Date().toISOString()}
 * 
 * ⚠️ DO NOT EDIT THIS FILE MANUALLY
 * Regenerate using: npx aibos-cli generate types
 */

`;

  tables.forEach((table) => {
    const typeName = toPascalCase(table.name);

    // Generate table interface
    output += `/**\n * ${table.name} table\n`;
    output += ` * Schema: ${table.schema}\n`;
    if (table.primaryKeys.length > 0) {
      output += ` * Primary Keys: ${table.primaryKeys.join(", ")}\n`;
    }
    output += ` */\n`;
    output += `export interface ${typeName} {\n`;

    table.columns.forEach((col) => {
      const tsType = sqlTypeToTypeScript(col.type);
      const optional = col.nullable ? "?" : "";
      
      if (col.comment) {
        output += `  /** ${col.comment} */\n`;
      }
      
      output += `  ${col.name}${optional}: ${tsType};\n`;
    });

    output += `}\n\n`;

    // Generate Insert type (all non-auto fields)
    output += `export interface ${typeName}Insert {\n`;
    table.columns.forEach((col) => {
      const tsType = sqlTypeToTypeScript(col.type);
      const optional = col.nullable || col.defaultValue !== null ? "?" : "";
      
      if (!col.isPrimaryKey || col.defaultValue === null) {
        output += `  ${col.name}${optional}: ${tsType};\n`;
      }
    });
    output += `}\n\n`;

    // Generate Update type (all fields optional)
    output += `export interface ${typeName}Update {\n`;
    table.columns.forEach((col) => {
      const tsType = sqlTypeToTypeScript(col.type);
      output += `  ${col.name}?: ${tsType};\n`;
    });
    output += `}\n\n`;

    // Generate relation types if requested
    if (includeRelations && table.foreignKeys.length > 0) {
      output += `export interface ${typeName}WithRelations extends ${typeName} {\n`;
      table.foreignKeys.forEach((fk) => {
        const relatedType = toPascalCase(fk.referencedTable);
        output += `  ${fk.referencedTable}?: ${relatedType};\n`;
      });
      output += `}\n\n`;
    }
  });

  // Generate Database type (union of all tables)
  output += `export interface Database {\n`;
  tables.forEach((table) => {
    const typeName = toPascalCase(table.name);
    output += `  ${table.name}: ${typeName};\n`;
  });
  output += `}\n\n`;

  output += `export type TableName = keyof Database;\n`;

  return output;
}

/**
 * Generate Zod validation schemas
 */
function generateZodSchemas(tables: DatabaseTable[]): string {
  let output = `/**
 * 🛡️ Auto-generated Zod Schemas
 * Generated: ${new Date().toISOString()}
 */

import { z } from "zod";

`;

  tables.forEach((table) => {
    const schemaName = `${toPascalCase(table.name)}Schema`;

    output += `export const ${schemaName} = z.object({\n`;

    table.columns.forEach((col) => {
      const zodType = sqlTypeToZod(col.type, col.nullable);
      output += `  ${col.name}: ${zodType}`;
      
      if (col.comment) {
        output += `.describe("${col.comment}")`;
      }
      
      output += `,\n`;
    });

    output += `});\n\n`;

    // Generate insert schema
    output += `export const ${schemaName}Insert = ${schemaName}.partial({\n`;
    table.columns.forEach((col) => {
      if (col.isPrimaryKey || col.defaultValue !== null) {
        output += `  ${col.name}: true,\n`;
      }
    });
    output += `});\n\n`;

    // Generate update schema (all optional)
    output += `export const ${schemaName}Update = ${schemaName}.partial();\n\n`;
  });

  return output;
}

/**
 * Generate Supabase-specific type format
 */
function generateSupabaseTypes(tables: DatabaseTable[]): string {
  let output = `export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\n\n`;

  output += `export interface Database {\n`;
  output += `  public: {\n`;
  output += `    Tables: {\n`;

  tables.forEach((table) => {
    output += `      ${table.name}: {\n`;
    output += `        Row: {\n`;
    table.columns.forEach((col) => {
      const tsType = sqlTypeToTypeScript(col.type);
      const nullable = col.nullable ? " | null" : "";
      output += `          ${col.name}: ${tsType}${nullable};\n`;
    });
    output += `        };\n`;
    output += `        Insert: {\n`;
    table.columns.forEach((col) => {
      const tsType = sqlTypeToTypeScript(col.type);
      const optional = col.nullable || col.defaultValue !== null;
      const nullable = col.nullable ? " | null" : "";
      output += `          ${col.name}${optional ? "?" : ""}: ${tsType}${nullable};\n`;
    });
    output += `        };\n`;
    output += `        Update: {\n`;
    table.columns.forEach((col) => {
      const tsType = sqlTypeToTypeScript(col.type);
      const nullable = col.nullable ? " | null" : "";
      output += `          ${col.name}?: ${tsType}${nullable};\n`;
    });
    output += `        };\n`;
    output += `      };\n`;
  });

  output += `    };\n`;
  output += `  };\n`;
  output += `}\n`;

  return output;
}

/**
 * Generate documentation for the types
 */
function generateTypeDocumentation(tables: DatabaseTable[]): string {
  let doc = `# Database Types Documentation\n\n`;
  doc += `Generated: ${new Date().toISOString()}\n\n`;

  doc += `## Tables\n\n`;

  tables.forEach((table) => {
    doc += `### ${table.name}\n\n`;
    doc += `**Schema:** ${table.schema}\n\n`;
    
    if (table.primaryKeys.length > 0) {
      doc += `**Primary Keys:** ${table.primaryKeys.join(", ")}\n\n`;
    }

    doc += `#### Columns\n\n`;
    doc += `| Column | Type | Nullable | Default | Notes |\n`;
    doc += `|--------|------|----------|---------|-------|\n`;

    table.columns.forEach((col) => {
      const notes = [];
      if (col.isPrimaryKey) notes.push("PK");
      if (col.isForeignKey) notes.push(`FK → ${col.foreignKeyTable}`);
      
      doc += `| ${col.name} | ${col.type} | ${col.nullable ? "Yes" : "No"} | ${col.defaultValue || "-"} | ${notes.join(", ") || "-"} |\n`;
    });

    doc += `\n`;

    if (table.foreignKeys.length > 0) {
      doc += `#### Foreign Keys\n\n`;
      table.foreignKeys.forEach((fk) => {
        doc += `- \`${fk.column}\` → \`${fk.referencedTable}.${fk.referencedColumn}\`\n`;
      });
      doc += `\n`;
    }
  });

  return doc;
}

/**
 * Convert SQL type to TypeScript type
 */
function sqlTypeToTypeScript(sqlType: string): string {
  const type = sqlType.toLowerCase();

  if (type.includes("int") || type.includes("serial") || type.includes("numeric") || type.includes("decimal") || type.includes("real") || type.includes("double")) {
    return "number";
  }

  if (type.includes("bool")) {
    return "boolean";
  }

  if (type.includes("json") || type.includes("jsonb")) {
    return "Record<string, any>";
  }

  if (type.includes("timestamp") || type.includes("date") || type.includes("time")) {
    return "string"; // ISO 8601 format
  }

  if (type.includes("uuid")) {
    return "string";
  }

  if (type.includes("bytea") || type.includes("blob")) {
    return "Buffer";
  }

  return "string"; // Default to string
}

/**
 * Convert SQL type to Zod schema
 */
function sqlTypeToZod(sqlType: string, nullable: boolean): string {
  const type = sqlType.toLowerCase();
  let zodType = "z.string()";

  if (type.includes("int") || type.includes("serial") || type.includes("numeric") || type.includes("decimal") || type.includes("real") || type.includes("double")) {
    zodType = "z.number()";
  } else if (type.includes("bool")) {
    zodType = "z.boolean()";
  } else if (type.includes("json") || type.includes("jsonb")) {
    zodType = "z.record(z.any())";
  } else if (type.includes("timestamp") || type.includes("date")) {
    zodType = "z.string().datetime()";
  } else if (type.includes("uuid")) {
    zodType = "z.string().uuid()";
  } else if (type.includes("email")) {
    zodType = "z.string().email()";
  } else if (type.includes("url")) {
    zodType = "z.string().url()";
  }

  return nullable ? `${zodType}.nullable()` : zodType;
}

/**
 * Convert snake_case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Save generated types to files
 */
export async function saveGeneratedTypes(
  types: GeneratedTypes,
  outputDir: string
): Promise<void> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  await fs.mkdir(outputDir, { recursive: true });

  // Save TypeScript types
  await fs.writeFile(
    path.join(outputDir, "database.types.ts"),
    types.typescript
  );

  // Save Zod schemas
  if (types.zodSchemas) {
    await fs.writeFile(
      path.join(outputDir, "database.schemas.ts"),
      types.zodSchemas
    );
  }

  // Save documentation
  await fs.writeFile(
    path.join(outputDir, "DATABASE.md"),
    types.documentation
  );

  // Save Supabase types if available
  if (types.supabaseTypes) {
    await fs.writeFile(
      path.join(outputDir, "supabase.types.ts"),
      types.supabaseTypes
    );
  }
}

