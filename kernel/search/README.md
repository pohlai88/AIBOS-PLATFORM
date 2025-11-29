# Semantic Search

**Status:** ✅ **IMPLEMENTED**  
**Priority:** 🚀 **High** - High value for AI agents  
**Reference:** GitHub MCP Server semantic search patterns

---

## Overview

The Semantic Search system provides natural language queries to search codebases, enabling AI agents to find relevant code quickly and accurately.

---

## Features

- ✅ **Natural Language Queries** - Search using plain English
- ✅ **Semantic Matching** - Not just keyword matching
- ✅ **Context-Aware** - Understands code structure
- ✅ **File Type Filtering** - Filter by file extensions
- ✅ **Scope Limiting** - Search specific directories
- ✅ **Relevance Ranking** - Results sorted by relevance
- ✅ **Code Snippets** - Returns relevant code snippets with line numbers
- ✅ **MCP Integration** - Available as MCP tool
- ✅ **REST API** - HTTP endpoints for search

---

## Usage

### REST API

```bash
# Search codebase
POST /search/semantic
{
  "query": "function that validates user input",
  "scope": ["kernel/policy"],
  "maxResults": 10,
  "fileTypes": ["ts", "tsx"]
}

# Response
{
  "query": "function that validates user input",
  "results": [
    {
      "filePath": "kernel/policy/validator.ts",
      "fileName": "validator.ts",
      "fileType": "ts",
      "snippets": [
        {
          "line": 45,
          "content": "export function validateUserInput(input: unknown): boolean {",
          "score": 1.0
        }
      ],
      "relevanceScore": 0.95,
      "matchType": "exact"
    }
  ],
  "stats": {
    "totalResults": 1,
    "indexedFiles": 150,
    "indexedLines": 5000
  }
}
```

### MCP Tool

```typescript
// Use as MCP tool
const result = await executeSemanticSearch({
  query: "error handling for database connections",
  scope: ["kernel/storage"],
  maxResults: 5,
});
```

### Programmatic Usage

```typescript
import { semanticSearchService } from "./search";

const results = await semanticSearchService.search({
  query: "function that rotates secrets",
  scope: ["kernel/security"],
  maxResults: 10,
  fileTypes: ["ts"],
});

for (const result of results) {
  console.log(`Found in ${result.filePath}:`);
  for (const snippet of result.snippets) {
    console.log(`  Line ${snippet.line}: ${snippet.content}`);
  }
}
```

---

## Search Query Examples

### Function Search
```
"function that validates user input"
"method that handles authentication"
"async function that fetches data"
```

### Class Search
```
"class that manages database connections"
"interface for policy evaluation"
```

### Error Handling
```
"error handling for database connections"
"exception handling in API routes"
```

### Test Files
```
"test for policy engine"
"spec for agent memory"
```

---

## Indexing

The codebase is automatically indexed on first search. You can manually trigger re-indexing:

```bash
POST /search/index
{
  "scope": ["kernel/policy", "kernel/agents"]
}
```

### Supported File Types

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- Python (`.py`)
- Go (`.go`)
- Rust (`.rs`)
- Java (`.java`)
- C/C++ (`.cpp`, `.c`)

---

## Relevance Scoring

Results are ranked by:

1. **Relevance Score** (0-1) - Based on keyword matches and semantic similarity
2. **Match Type** - `exact` > `semantic` > `contextual`
3. **Snippet Count** - More snippets = higher relevance

---

## Best Practices

1. **Use Specific Queries** - More specific queries yield better results
2. **Limit Scope** - Use `scope` to narrow search to relevant directories
3. **Filter File Types** - Use `fileTypes` to focus on specific languages
4. **Re-index Regularly** - Re-index after major code changes

---

## Future Enhancements

- **Embedding-Based Search** - Use vector embeddings for better semantic understanding
- **Cross-File Context** - Understand relationships between files
- **Code Understanding** - Better extraction of functions, classes, and their relationships
- **Incremental Indexing** - Only re-index changed files
- **Search History** - Track and learn from search patterns

---

## References

- **Feature Gap Analysis:** See `FEATURE-GAP-ANALYSIS.md` for context
- **Market Strategy:** See `MARKET-STRATEGY-REPORT.md` for prioritization
- **GitHub MCP Server:** https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **MCP Integration:** See `kernel/search/mcp-semantic-search-tool.ts`

---

**Last Updated:** November 29, 2025  
**Status:** ✅ Implemented - Ready for use

