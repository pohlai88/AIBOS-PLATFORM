# 🔐 GitHub Token Setup Instructions

**Date:** 2025-01-27

---

## ✅ Quick Setup

### Option 1: Create `.env.local` file (Recommended)

Create a file named `.env.local` in the project root with:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

**Note:** This file is already in `.gitignore` and won't be committed.

### Option 2: Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
```

**macOS/Linux:**
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
```

---

## 🔄 Regenerate MCP Config

After setting the token, regenerate the MCP configuration:

```bash
node .mcp/scripts/generate-mcp-config.mjs
```

You should see:
```
✅ Registered: github (with token)
```

---

## ⚠️ Security Notice

**IMPORTANT:** This token was exposed in chat. For security:

1. **Rotate the token** after testing:
   - Go to: https://github.com/settings/tokens
   - Revoke the current token
   - Generate a new token
   - Update your configuration

2. **Never commit tokens:**
   - `.env.local` is in `.gitignore`
   - Don't share tokens in chat or public forums

---

## ✅ Verify Setup

1. **Restart Cursor** (required for MCP changes)
2. **Test GitHub MCP:**
   ```typescript
   const readme = await github.getFileContents({
     owner: "lucide",
     repo: "lucide",
     path: "README.md",
   });
   ```

---

**Status:** ⚠️ Token provided, needs manual setup  
**Action:** Create `.env.local` or set environment variable, then restart Cursor

