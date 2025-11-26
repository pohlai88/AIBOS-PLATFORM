#!/usr/bin/env node
/**
 * AI-BOS Designer MCP - CI Entrypoint
 * Run this from GitHub Actions, GitLab CI, or locally.
 */

import { runCIValidation, getChangedFiles, filterByConfigPaths } from "./runValidation.js";
import { summarizeCI, formatCISummary } from "./summarizeCI.js";
import { commentOnPR, findExistingComment, updatePRComment } from "./commentGitHub.js";
import { createFixPR } from "./createFixPR.js";
import ciConfig from "./config.ci.json" with { type: "json" };

async function main() {
  console.log("🎨 AI-BOS Designer MCP - CI Validation\n");

  // Get files to validate
  let files = process.argv.slice(2);

  if (files.length === 0) {
    console.log("No files specified, detecting changed files...");
    files = filterByConfigPaths(getChangedFiles());
  }

  if (files.length === 0) {
    console.log("✅ No component files to validate.");
    process.exit(0);
  }

  console.log(`Validating ${files.length} files...\n`);

  // Run validation
  const results = await runCIValidation(files);

  // Combine all errors
  const allErrors = results.flatMap((r) => r.errors);
  const summary = summarizeCI(allErrors, ciConfig.failOn);

  // Log results
  console.log("\n" + formatCISummary(summary));

  // GitHub integration
  const { GITHUB_TOKEN, PR_NUMBER, GITHUB_REPO_OWNER, GITHUB_REPO } = process.env;

  if (GITHUB_TOKEN && PR_NUMBER && GITHUB_REPO_OWNER && GITHUB_REPO) {
    const ghOptions = {
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO,
      pr: Number(PR_NUMBER),
      token: GITHUB_TOKEN,
    };

    const message = formatCISummary(summary);

    // Check for existing comment to update
    const existingCommentId = await findExistingComment(ghOptions);

    if (existingCommentId) {
      await updatePRComment({ ...ghOptions, commentId: existingCommentId }, message);
      console.log("\n📝 Updated existing PR comment");
    } else {
      await commentOnPR(ghOptions, message);
      console.log("\n📝 Posted PR comment");
    }

    // Create auto-fix PR if enabled
    if (
      ciConfig.autoFix &&
      ciConfig.github.createFixPR &&
      summary.errors > 0
    ) {
      const allFixedFiles: Record<string, string> = {};
      for (const r of results) {
        if (r.fixedFiles) {
          Object.assign(allFixedFiles, r.fixedFiles);
        }
      }

      if (Object.keys(allFixedFiles).length > 0) {
        const fixResult = await createFixPR({
          owner: GITHUB_REPO_OWNER,
          repo: GITHUB_REPO,
          branch: `designer-autofix-${Date.now()}`,
          token: GITHUB_TOKEN,
          changes: allFixedFiles,
        });

        if (fixResult.success) {
          console.log(`\n🔧 Created auto-fix PR: ${fixResult.prUrl}`);
        }
      }
    }
  }

  // Exit with appropriate code
  if (summary.breaksBuild) {
    console.log("\n❌ CI FAILED - Design violations detected");
    process.exit(1);
  }

  console.log("\n✅ CI PASSED");
  process.exit(0);
}

main().catch((err) => {
  console.error("CI Error:", err);
  process.exit(1);
});

