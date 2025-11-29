# 🔄 Phase 3: Consolidate `api/` and `http/` - Migration Plan

**Date:** November 29, 2025  
**Status:** ⏸️ **DEFERRED - Ready When Activity Slows**

---

## 🎯 Objective

Consolidate `api/` and `http/` directories into a single `api/` directory to eliminate confusion and align with GRCD template structure.

---

## ⚠️ Prerequisites (MUST BE MET)

### 1. Activity Check ✅
- [ ] **Low Activity Period**: No commits to `http/` in last 7 days
- [ ] **No Active PRs**: No open pull requests modifying `http/` directory
- [ ] **Team Notification**: Team notified of upcoming consolidation

### 2. Approval ✅
- [ ] **Team Approval**: Explicit approval from team lead/architect
- [ ] **Stakeholder Sign-off**: All stakeholders aware of change

### 3. Preparation ✅
- [ ] **Test Suite Passing**: All tests pass before migration
- [ ] **Backup Created**: Git branch created for rollback
- [ ] **Migration Window**: Low-traffic deployment window scheduled

---

## 📋 Migration Steps

### Step 1: Pre-Migration Validation

**Duration:** 30 minutes

1. **Verify Current State**
   ```bash
   # Check all imports from http/
   grep -r "from.*http/" kernel/ --include="*.ts" > imports-before.txt
   grep -r "import.*http/" kernel/ --include="*.ts" >> imports-before.txt
   
   # Count files to move
   find kernel/http -type f -name "*.ts" | wc -l
   ```

2. **Run Test Suite**
   ```bash
   npm run typecheck
   npm test  # If tests exist
   ```

3. **Create Backup Branch**
   ```bash
   git checkout -b backup/pre-phase3-consolidation
   git push origin backup/pre-phase3-consolidation
   git checkout main
   ```

**Success Criteria:**
- ✅ All imports documented
- ✅ Test suite passes
- ✅ Backup branch created

---

### Step 2: Move Middleware

**Duration:** 15 minutes

1. **Move Directory**
   ```bash
   git mv kernel/http/middleware kernel/api/middleware
   ```

2. **Update Imports in `api/router.ts`**
   ```typescript
   // BEFORE
   import { traceIdMiddleware } from "../http/middleware/trace-id";
   import { httpMetricsMiddleware } from "../http/middleware/metrics";
   import { authMiddleware, optionalAuthMiddleware } from "../http/middleware/auth";
   
   // AFTER
   import { traceIdMiddleware } from "./middleware/trace-id";
   import { httpMetricsMiddleware } from "./middleware/metrics";
   import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth";
   ```

3. **Search for Other Imports**
   ```bash
   grep -r "http/middleware" kernel/ --include="*.ts"
   # Update all found imports
   ```

**Success Criteria:**
- ✅ Middleware moved
- ✅ All imports updated
- ✅ Typecheck passes

---

### Step 3: Move Routes

**Duration:** 30 minutes

1. **Backup Legacy Routes** (if needed)
   ```bash
   # Document which legacy routes exist
   ls -la kernel/api/routes/ > legacy-routes-backup.txt
   ```

2. **Move Active Routes**
   ```bash
   # Move http/routes to api/routes (replace legacy)
   git rm -r kernel/api/routes/*.ts  # Remove legacy routes
   git mv kernel/http/routes/* kernel/api/routes/
   ```

3. **Update Imports in `api/router.ts`**
   ```typescript
   // BEFORE
   import { registerActionRoutes as registerNewActionRoutes } from "../http/routes/actions";
   import { registerEngineRoutes as registerNewEngineRoutes } from "../http/routes/engines";
   import { registerMetricsRoutes } from "../http/routes/metrics";
   
   // AFTER
   import { registerActionRoutes } from "./routes/actions";
   import { registerEngineRoutes } from "./routes/engines";
   import { registerMetricsRoutes } from "./routes/metrics";
   ```

4. **Update Route Imports** (if routes import from http/)
   ```bash
   # Check if routes import from http/
   grep -r "from.*http/" kernel/api/routes/ --include="*.ts"
   # Update all found imports
   ```

**Success Criteria:**
- ✅ Routes moved
- ✅ Legacy routes removed
- ✅ All imports updated
- ✅ Typecheck passes

---

### Step 4: Update `api/router.ts`

**Duration:** 15 minutes

1. **Consolidate Router**
   ```typescript
   // Remove all imports from http/
   // Use only local imports from ./middleware/ and ./routes/
   ```

2. **Remove Legacy Route Registration**
   ```typescript
   // Remove deprecated route registrations
   // Keep only active routes
   ```

3. **Verify Router Completeness**
   - All middleware registered
   - All routes registered
   - Health endpoints working

**Success Criteria:**
- ✅ Router uses only local imports
- ✅ All routes registered
- ✅ No references to `http/`

---

### Step 5: Update All Imports Across Codebase

**Duration:** 45 minutes

1. **Find All Imports**
   ```bash
   grep -r "from.*http/" kernel/ --include="*.ts" > all-http-imports.txt
   grep -r "import.*http/" kernel/ --include="*.ts" >> all-http-imports.txt
   ```

2. **Update Each Import**
   - Replace `../http/middleware/` → `../api/middleware/`
   - Replace `../http/routes/` → `../api/routes/`
   - Replace `./http/` → `./api/` (if in same directory)

3. **Update Bootstrap**
   ```typescript
   // kernel/bootstrap/steps/11-api.ts
   // Update import if it references http/
   ```

4. **Update Documentation**
   - Update any code examples
   - Update inline comments

**Success Criteria:**
- ✅ All imports updated
- ✅ No references to `http/` in code
- ✅ Typecheck passes

---

### Step 6: Remove `http/` Directory

**Duration:** 5 minutes

1. **Verify Empty**
   ```bash
   # Check if http/ has any remaining files
   find kernel/http -type f
   ```

2. **Remove Directory**
   ```bash
   git rm -r kernel/http
   ```

3. **Update `.gitignore`** (if needed)
   - Remove any `http/` references

**Success Criteria:**
- ✅ `http/` directory removed
- ✅ Git status clean

---

### Step 7: Update Documentation

**Duration:** 30 minutes

1. **Update GRCD Template**
   - Remove `http/` from directory tree
   - Update notes about `api/` vs `http/`

2. **Update GRCD-KERNEL.md**
   - Remove `http/` references
   - Update directory structure

3. **Update README.md**
   - Remove `http/` from directory structure
   - Update any examples

4. **Update Other Docs**
   - `QUICK-START.md` (if needed)
   - Any architecture diagrams

**Success Criteria:**
- ✅ All documentation updated
- ✅ No references to `http/` in docs

---

### Step 8: Validation & Testing

**Duration:** 30 minutes

1. **Typecheck**
   ```bash
   npm run typecheck
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Test Suite** (if exists)
   ```bash
   npm test
   ```

4. **Manual Testing**
   - Start dev server
   - Test health endpoints
   - Test API routes
   - Test middleware

5. **Import Verification**
   ```bash
   # Verify no http/ imports remain
   grep -r "http/" kernel/ --include="*.ts" | grep -v "node_modules"
   # Should return empty or only comments
   ```

**Success Criteria:**
- ✅ Typecheck passes
- ✅ Build succeeds
- ✅ Tests pass
- ✅ Manual testing successful
- ✅ No `http/` imports found

---

### Step 9: Commit & Deploy

**Duration:** 15 minutes

1. **Commit Changes**
   ```bash
   git add -A
   git commit -m "refactor: Consolidate api/ and http/ into single api/ directory

   - Move http/middleware/ → api/middleware/
   - Move http/routes/ → api/routes/ (replace legacy)
   - Update all imports across codebase
   - Remove http/ directory
   - Update documentation

   Phase 3 of directory structure cleanup.
   See PHASE-3-MIGRATION-PLAN.md for details."
   ```

2. **Create PR**
   - Title: "Phase 3: Consolidate api/ and http/ directories"
   - Description: Link to migration plan
   - Request review

3. **Deploy** (after approval)
   - Merge to main
   - Deploy to staging
   - Monitor for issues

**Success Criteria:**
- ✅ Changes committed
- ✅ PR created
- ✅ Deployed successfully

---

## 🔄 Rollback Plan

If issues are discovered:

1. **Immediate Rollback**
   ```bash
   git checkout backup/pre-phase3-consolidation
   git checkout -b rollback/phase3-consolidation
   git push origin rollback/phase3-consolidation
   ```

2. **Revert Commit** (if already merged)
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Document Issues**
   - Create issue with details
   - Update migration plan with lessons learned

---

## 📊 Validation Checklist

### Pre-Migration ✅
- [ ] Low activity period confirmed
- [ ] Team approval obtained
- [ ] Test suite passing
- [ ] Backup branch created
- [ ] All imports documented

### During Migration ✅
- [ ] Middleware moved and imports updated
- [ ] Routes moved and imports updated
- [ ] Router consolidated
- [ ] All codebase imports updated
- [ ] `http/` directory removed
- [ ] Documentation updated

### Post-Migration ✅
- [ ] Typecheck passes
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Manual testing successful
- [ ] No `http/` references remain
- [ ] PR created and reviewed
- [ ] Deployed successfully

---

## ⏱️ Estimated Timeline

| Step | Duration | Total |
|------|----------|-------|
| Pre-Migration Validation | 30 min | 30 min |
| Move Middleware | 15 min | 45 min |
| Move Routes | 30 min | 1h 15min |
| Update Router | 15 min | 1h 30min |
| Update All Imports | 45 min | 2h 15min |
| Remove http/ | 5 min | 2h 20min |
| Update Documentation | 30 min | 2h 50min |
| Validation & Testing | 30 min | 3h 20min |
| Commit & Deploy | 15 min | 3h 35min |

**Total Estimated Time:** ~3.5 hours

---

## 🚨 Risk Mitigation

### Risk 1: Breaking Imports
- **Mitigation:** Comprehensive import search before migration
- **Detection:** Typecheck will catch import errors
- **Recovery:** Rollback to backup branch

### Risk 2: Missing Route Registration
- **Mitigation:** Document all routes before moving
- **Detection:** Manual testing of all endpoints
- **Recovery:** Add missing route registrations

### Risk 3: Documentation Out of Sync
- **Mitigation:** Update all docs in same commit
- **Detection:** Review PR for doc updates
- **Recovery:** Update docs in follow-up commit

---

## 📝 Post-Migration Tasks

1. **Monitor**
   - Watch for issues in production
   - Monitor error logs
   - Check team feedback

2. **Documentation**
   - Update any missed docs
   - Add migration to changelog
   - Update onboarding guides

3. **Cleanup**
   - Remove backup branch after 30 days
   - Archive migration plan
   - Update directory structure docs

---

## ✅ Success Criteria

Phase 3 is successful when:
- ✅ `http/` directory removed
- ✅ All functionality works as before
- ✅ No `http/` references in code or docs
- ✅ Team can work normally
- ✅ No production issues

---

**Status:** ⏸️ **READY - WAITING FOR LOW ACTIVITY PERIOD**

**Next Action:** Monitor `http/` directory activity. When commits slow, proceed with migration.

---

**Last Updated:** November 29, 2025  
**Owner:** Kernel Team  
**Review Required:** Yes

