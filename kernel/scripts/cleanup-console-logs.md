# Console.log Bulk Cleanup Script

## Overview

This document outlines a regex-based cleanup strategy for bulk replacement of remaining `console.log` instances with `baseLogger`.

## Strategy

### Phase 1: Manual Cleanup (✅ COMPLETE)
- ✅ Bootstrap files
- ✅ API files  
- ✅ Core modules
- ✅ Jobs
- ✅ Actions
- ✅ Observability
- ✅ Events bootstrap
- ✅ AI client (lynx)
- ✅ Secret rotation

### Phase 2: Bulk Cleanup (Script)

#### Exclusions
- `tests/` - Test files (intentional console output)
- `examples/` - Example/demo files
- `storage/dev-experience/DEMO.ts` - Demo file (112 instances)
- `scripts/` - Utility scripts (may be intentional)

#### Replacement Rules

1. **Default Replacement:**
   ```typescript
   console.log(...) → baseLogger.info({ ... }, "...")
   console.info(...) → baseLogger.info({ ... }, "...")
   console.warn(...) → baseLogger.warn({ ... }, "...")
   console.error(...) → baseLogger.error({ ... }, "...")
   console.debug(...) → baseLogger.debug({ ... }, "...")
   ```

2. **Import Addition:**
   - Check if `baseLogger` import exists
   - If not, add: `import { baseLogger } from "../observability/logger";` (adjust path)

3. **Context Extraction:**
   - Extract object literals as context
   - Extract variables as context fields
   - Preserve string messages as log messages

#### Regex Patterns

```regex
# Find console.log with object literal
console\.log\(([^,]+),\s*(\{[^}]+\})\)
→ baseLogger.info($2, $1)

# Find console.log with string only
console\.log\((["'`][^"'`]+["'`])\)
→ baseLogger.info($1)

# Find console.error with error object
console\.error\(([^,]+),\s*(err|error)\)
→ baseLogger.error({ err: $2 }, $1)
```

## Implementation Script (Node.js)

```javascript
const fs = require('fs');
const path = require('path');

const EXCLUDE_PATTERNS = [
  /tests\//,
  /examples\//,
  /storage\/dev-experience\/DEMO\.ts$/,
  /scripts\/migrate\.ts$/,
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function hasBaseLoggerImport(content) {
  return /import.*baseLogger.*from.*observability\/logger/.test(content);
}

function addBaseLoggerImport(content, filePath) {
  const relativePath = calculateRelativePath(filePath, 'observability/logger');
  return `import { baseLogger } from "${relativePath}";\n${content}`;
}

function replaceConsoleLog(content) {
  // Replace console.log with baseLogger.info
  content = content.replace(
    /console\.log\(([^)]+)\)/g,
    (match, args) => {
      // Parse arguments and extract context
      // This is simplified - full implementation needed
      return `baseLogger.info(${args})`;
    }
  );
  
  // Similar for console.error, console.warn, etc.
  return content;
}

function processFile(filePath) {
  if (shouldExclude(filePath)) {
    console.log(`Skipping: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!hasBaseLoggerImport(content)) {
    content = addBaseLoggerImport(content, filePath);
  }
  
  content = replaceConsoleLog(content);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}
```

## Manual Review Checklist

After bulk cleanup, review:

1. **Log Levels:**
   - ✅ `console.error` → `baseLogger.error`
   - ✅ `console.warn` → `baseLogger.warn`
   - ✅ `console.info` → `baseLogger.info`
   - ✅ `console.debug` → `baseLogger.debug`
   - ⚠️ `console.log` → `baseLogger.info` (verify level)

2. **Context Extraction:**
   - Object literals moved to context parameter
   - Variables extracted as context fields
   - Error objects properly wrapped

3. **Import Paths:**
   - Relative paths correct for each file
   - No duplicate imports

4. **String Formatting:**
   - Pino-style message format (first string param)
   - Context as second object param

## Testing

After cleanup:
1. Run tests: `npm test`
2. Check logs: Verify structured logging works
3. Check production: Monitor log output in staging

## Rollback

If issues found:
```bash
git revert HEAD
# Or
git checkout HEAD~1 -- kernel/
```

