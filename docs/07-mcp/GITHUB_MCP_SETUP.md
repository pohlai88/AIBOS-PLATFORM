# 🔐 GitHub MCP Setup Guide

**Purpose:** Configure GitHub MCP to access icon repositories and other stunning codebases  
**Last Updated:** 2025-01-27

---

## ⚠️ Current Status

GitHub MCP requires authentication to access repositories. The MCP server is configured, but you need to set up a GitHub Personal Access Token.

---

## 🚀 Setup Steps

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name: `Cursor MCP GitHub Access`
   - Set expiration (recommended: 90 days or custom)

3. **Select Scopes:**
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:org` - Read org and team membership (if needed)
   - ✅ `read:user` - Read user profile data

4. **Generate and Copy:**
   - Click "Generate token"
   - **IMPORTANT:** Copy the token immediately (you won't see it again)
   - Store it securely

---

### Step 2: Configure in Cursor

#### Option A: Environment Variable (Recommended)

1. **Create/Edit `.env.local` in project root:**
   ```bash
   GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
   ```

2. **Or set system environment variable:**
   ```bash
   # Windows (PowerShell)
   $env:GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
   
   # macOS/Linux
   export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
   ```

#### Option B: MCP Server Configuration

Edit `.cursor/mcp.json` to include the token:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

**⚠️ Security Note:** Don't commit tokens to git! Use environment variables or secrets management.

---

### Step 3: Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. The GitHub MCP server should now be authenticated

---

### Step 4: Test Access

Try accessing a public repository:

```typescript
// Test with Lucide Icons
const readme = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "README.md",
});

console.log("✅ GitHub MCP is working!");
```

---

## 📚 Accessing Icon Repositories

Once authenticated, you can access any of the 24 stunning repositories:

### Icon Libraries

#### 1. Lucide Icons

```typescript
// Read React wrapper implementation
const lucideReact = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "packages/lucide-react/src/lucide-react.tsx",
});

// Read icon factory pattern
const iconFactory = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "packages/lucide-react/src/createLucideIcon.tsx",
});

// Read example icon
const exampleIcon = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "packages/lucide/src/icons/activity.tsx",
});
```

#### 2. Phosphor Icons

```typescript
// Read IconBase component
const iconBase = await github.getFileContents({
  owner: "phosphor-icons",
  repo: "react",
  path: "src/IconBase.tsx",
});

// Read Icon wrapper
const iconWrapper = await github.getFileContents({
  owner: "phosphor-icons",
  repo: "react",
  path: "src/Icon.tsx",
});

// Read example icon
const exampleIcon = await github.getFileContents({
  owner: "phosphor-icons",
  repo: "react",
  path: "src/icons/Horse.tsx",
});
```

#### 3. Heroicons

```typescript
// Read outline icon
const beakerOutline = await github.getFileContents({
  owner: "tailwindlabs",
  repo: "heroicons",
  path: "react/24/outline/BeakerIcon.tsx",
});

// Read solid icon
const beakerSolid = await github.getFileContents({
  owner: "tailwindlabs",
  repo: "heroicons",
  path: "react/24/solid/BeakerIcon.tsx",
});
```

#### 4. Radix Icons

```typescript
// Read base implementation
const iconBase = await github.getFileContents({
  owner: "radix-ui",
  repo: "icons",
  path: "packages/radix-icons/src/Icon.tsx",
});
```

#### 5. Microsoft Fluent UI Icons

```typescript
// Read React wrapper
const reactWrapper = await github.getFileContents({
  owner: "microsoft",
  repo: "fluentui-system-icons",
  path: "react/package.json",
});
```

---

## 🔍 Searching for Patterns

Use GitHub MCP to search for specific patterns:

### Search Icon Base Components

```typescript
const results = await github.searchCode({
  q: "icon base component react typescript",
  language: "typescript",
});

// Results will show files matching the pattern
```

### Search Icon Weight Variants

```typescript
const results = await github.searchCode({
  q: "icon weight variant outline solid duotone",
  language: "typescript",
});
```

### Search Icon Context Patterns

```typescript
const results = await github.searchCode({
  q: "IconContext Provider react",
  language: "typescript",
});
```

---

## 📖 Complete Repository List

See [STUNNING_REPOSITORIES.md](./STUNNING_REPOSITORIES.md) for the complete list of 24 repositories organized by category.

---

## 🛠️ Common Use Cases

### 1. Learning Icon Patterns

```typescript
// Compare implementations across libraries
const lucide = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "packages/lucide-react/src/lucide-react.tsx",
});

const phosphor = await github.getFileContents({
  owner: "phosphor-icons",
  repo: "react",
  path: "src/IconBase.tsx",
});

// Compare patterns and extract best practices
```

### 2. Extracting Type Definitions

```typescript
// Get TypeScript types from icon libraries
const types = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "packages/lucide-react/src/types.ts",
});
```

### 3. Studying Build Systems

```typescript
// Learn how they build and optimize
const packageJson = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "package.json",
});

const buildConfig = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "tsup.config.ts",
});
```

---

## 🔒 Security Best Practices

1. **Never commit tokens to git**
   - Use `.env.local` (already in `.gitignore`)
   - Use environment variables
   - Use secrets management tools

2. **Use minimal scopes**
   - Only grant necessary permissions
   - `repo` scope is sufficient for reading public repos
   - For private repos, you need `repo` scope

3. **Rotate tokens regularly**
   - Set expiration dates
   - Regenerate tokens periodically
   - Revoke unused tokens

4. **Monitor token usage**
   - Check GitHub → Settings → Personal access tokens
   - Review recent activity

---

## ❌ Troubleshooting

### Error: "Not Found" or "Resource not found"

**Possible Causes:**
1. Token not configured
2. Token expired
3. Insufficient permissions
4. Repository path incorrect

**Solutions:**
1. Verify token is set in environment
2. Check token hasn't expired
3. Ensure `repo` scope is granted
4. Double-check repository path

### Error: "Rate limit exceeded"

**Solution:**
- GitHub API has rate limits
- Wait before making more requests
- Consider using authenticated requests (higher limits)

### Error: "Authentication failed"

**Solution:**
1. Verify token is correct
2. Check token hasn't been revoked
3. Ensure token has correct scopes
4. Restart Cursor after setting token

---

## ✅ Verification Checklist

- [ ] GitHub Personal Access Token created
- [ ] Token has `repo` scope
- [ ] Token stored securely (not in git)
- [ ] Environment variable set
- [ ] Cursor restarted
- [ ] Test access successful
- [ ] Can read public repositories
- [ ] Can search code

---

## 📚 Related Documentation

- [GitHub MCP Server](./servers/github.md) - Server documentation
- [STUNNING_REPOSITORIES.md](./STUNNING_REPOSITORIES.md) - Complete repository list
- [Icon System Architecture](../../../packages/ui/src/components/shared/primitives/icons/ICON_SYSTEM_ARCHITECTURE.md) - Current icon system

---

## 🎯 Next Steps

Once GitHub MCP is authenticated:

1. ✅ Access icon repositories
2. ✅ Study implementation patterns
3. ✅ Extract best practices
4. ✅ Apply to AI-BOS icon system
5. ✅ Reference when creating new icons

---

**Status:** ⚠️ Requires Authentication  
**Last Updated:** 2025-01-27

