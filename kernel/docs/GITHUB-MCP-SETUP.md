# GitHub MCP Token Setup Guide

## Quick Setup (Windows PowerShell)

### Option 1: Session-Only (Temporary)
```powershell
$env:GITHUB_TOKEN = "your_github_personal_access_token_here"
```

### Option 2: Permanent (User-Level)
```powershell
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token_here', 'User')
```

Then **restart your terminal** for changes to take effect.

## Creating a GitHub Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Set scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org data)
   - ✅ `read:user` (Read user data)
4. Click **"Generate token"**
5. **Copy the token** (you won't see it again!)
6. Set it using one of the options above

## Verify Setup

```powershell
# Check if token is set
if ($env:GITHUB_TOKEN) { 
  Write-Host "✅ Token is set" 
} else { 
  Write-Host "❌ Token not set" 
}
```

## .cursor/mcp.json Configuration

Already configured correctly:

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

The `${GITHUB_TOKEN}` will automatically use your environment variable.

---

**Status:** ⚠️ Token not set yet (as of 2025-11-29)  
**Next Step:** Set GITHUB_TOKEN environment variable using Option 2 above

