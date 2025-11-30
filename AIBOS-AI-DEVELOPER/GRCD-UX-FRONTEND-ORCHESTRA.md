# Frontend Dev Orchestra — Reference Specification v1

**Status:** Draft, Human-Approved Baseline  
**Scope:** AI-BOS Nexus – Frontend (UI/UX + Web App)  
**Audience:** Kernel / Orchestrator engineers, Agent designers, Future GRCD generators

---

## 1. Purpose

This document defines the **Frontend Dev Orchestra** for AI-BOS.

It is a **human-written reference** that future AI agents and GRCD documents must follow when:
- Designing frontend-related agents (UI/UX, implementation, testing, a11y, etc.).
- Implementing the orchestration logic that coordinates these agents.
- Configuring MCP servers and tool access for frontend work.

**Goal:** Replace "vibe coding with AI" with a **structured, governed, and repeatable system of agents** working on the frontend.

---

## 2. Hierarchy Overview (L0–L4)

The frontend system is organized into **five layers**:

### L0 — Human Vision & Governance
- Owner: Human (Jack) + any design/product leadership.
- Defines:
  - Brand narrative & visual identity (Fortune-500 grade).
  - Design tokens and component principles.
  - GRCD rules and policies.
- AI agents **must treat this as law**, not suggestion.

### L1 — Frontend Orchestrator
- Component: `frontend-orchestrator` (a domain profile inside `ai-orchestrator`).
- Responsibilities:
  - Receive frontend tasks (e.g. "improve landing hero").
  - Route tasks to the correct **L2 agent(s)**.
  - Attach the correct **tool & directory scopes** per agent.
  - Enforce anti-drift rules (tokens, directories, dependencies).
  - Record telemetry and audit events for every orchestration run.

### L2 — Frontend Agents (Personas / Brains)
- Specialized agent roles for frontend work:
  - UI/UX design, implementation, testing, a11y, docs, dependencies, etc.
- Each agent:
  - Has a narrow, well-defined **scope**.
  - Uses only the **MCP tools** allocated by L1.
  - Returns structured outputs (diffs, notes, reports).

### L3 — MCP Tools (Hands & Eyes)
- MCP servers / tools that agents can use, such as:
  - `repo` (read/write diff), `git`, `tokens`, `lint`, `test`, `a11y`, `storybook`, etc.
- L1 decides **which tools are visible** to each agent per task.

### L4 — Reality / Surfaces
- Where changes become real:
  - Next.js app (components & pages).
  - Design tokens source.
  - Storybook/docs.
  - CI pipelines & deployments.

---

## 3. Core Agent Set (Version 1)

The v1 Frontend Dev Orchestra uses a **minimal, high-value set** of agents.

> Note: In early phases, some roles can be combined into a single "Frontend Brain" agent, as long as it follows the separation rules described here.

### 3.1 Lynx.UIUXEngineer (Design & Layout)

**Role:** Senior UI/UX Engineer for AI-BOS.

**Primary Responsibilities:**
- Interpret high-level UI/UX requests (e.g. "Fortune 500 landing hero").
- Choose appropriate layout & interaction patterns.
- Produce **presentational React components** that:
  - Use **design tokens only** (no hardcoded colors/spacing/fonts).
  - Are accessible by default (semantic tags, basic ARIA when needed).
  - Are responsive (mobile → desktop).
- Output clear **Design Notes** explaining patterns and token usage.

**Deliverables:**
- `Component.tsx` — presentational, visual-only (no data fetching, no business logic).
- `Component.types.ts` — props interface for the component.
- Optional Storybook story skeleton.

**Hard Boundaries:**
- MUST NOT implement business logic, state management, or side effects.
- MUST NOT introduce new tokens directly (can only *suggest* them in notes).
- MUST NOT change backend APIs or infra.

---

### 3.2 Lynx.FrontendImplementor (Logic & Wiring)

**Role:** Senior Frontend Engineer.

**Primary Responsibilities:**
- Take UI/UX specs (components + types) and wire them to:
  - Data fetching (BFF / APIs).
  - State management (hooks, context, etc.).
  - User interactions (events, form handling, navigation).
- Keep presentational components unmodified in terms of visual styling (unless requested by UI/UX).

**Deliverables:**
- `Component.container.tsx` or equivalent file:
  - Provides props to the presentational component.
  - Encapsulates state & logic.
- Hooks and utilities (`useXyz.ts`, `services/xyz.ts`).
- Error/loading states aligned with UX guidelines.

**Hard Boundaries:**
- SHOULD NOT change design tokens or visual structure without a UI/UX task.
- MUST respect types defined in `Component.types.ts`.
- MUST avoid cross-cutting infra changes (tsconfig, webpack, etc.) unless explicitly tasked.

---

### 3.3 Lynx.FrontendTester (Testing Gatekeeper)

**Role:** Senior QA Automation Engineer for frontend.

**Primary Responsibilities:**
- Verify correctness of frontend code **without altering business logic**.
- Focus on **unit and integration tests** using text-based frameworks (Vitest/Jest).

**Scope (v1):**
- Run test suites (unit + integration) relevant to changed files.
- Create or update test files:
  - `*.test.tsx`, `*.spec.tsx`, `*.test.ts`, `*.spec.ts`.
- Analyze test failures and classify them (e.g. missing tests, failing assertions, suspected logic issues).

**Allowed Edits:**
- Create new test files.
- Modify existing test files when tests are obviously incorrect or outdated.
- Add minimal `data-testid` attributes, only when necessary for test targeting.

**Forbidden Edits:**
- MUST NOT modify application business logic or core component behavior.
- MUST NOT change visual design (tokens, layout) directly.

**Output Contract:**
- JSON-like summary:
  - `status: PASS | FAIL`
  - `filesCreated: string[]`
  - `failureReason: string`
  - `recommendedFix: string` (for Implementor agent)

Tester is a **Gatekeeper**, not a Feature Builder.

---

### 3.4 Lynx.A11yGuard (Accessibility Specialist)

**Role:** Accessibility reviewer and fixer.

**Primary Responsibilities:**
- Run accessibility audits on components/pages.
- Detect issues:
  - Missing labels
  - Poor focus states
  - Incorrect semantic structure
  - Obvious color contrast problems
- Suggest or apply **minimal, targeted fixes**.

**Allowed Edits:**
- Add or adjust semantic tags (`<nav>`, `<header>`, `<main>`, etc.).
- Improve ARIA labels and roles (only where necessary).
- Adjust focus management (tab order, focus traps for modals).

**Forbidden Edits:**
- MUST NOT significantly redesign layouts.
- MUST NOT override tokens; any color/contrast fix must still respect token system (or suggest token-level changes in notes).

**Outputs:**
- A11y report with issues & severity.
- Optional small diffs to fix issues in-place.

---

### 3.5 Lynx.StorybookAgent (Component Docs Agent)

**Role:** Component documentation maintainer.

**Scope:**
- Storybook stories & MDX documentation.

**Responsibilities:**
- Ensure every key UI component has at least one Storybook story.
- Update stories when component APIs change.
- Provide clear usage examples and knobs/controls.

**Allowed Edits:**
- Only on Storybook / docs files (e.g. `*.stories.tsx`, `*.mdx`).

---

### 3.6 Lynx.FrontendDependenciesAgent (Config & Dependencies)

**Role:** Frontend dependency and config hygiene.

**Responsibilities:**
- Analyze `package.json`, `tsconfig`, ESLint, Tailwind config from a frontend POV.
- Suggest upgrades, removals of unused dependencies, or config cleanup.

**Hard Boundaries:**
- MUST NOT change dependencies without an explicit reason and explicit task.
- MUST NOT introduce breaking changes silently.

---

## 4. Future / Optional Agents (v2+)

These roles are reserved for future phases and are **not required** for v1:

- `Lynx.FrontendArchitect` — component architecture & folder structure guardian.
- `Lynx.PerfProfiler` — performance & bundle-size agent (Lighthouse, bundle analyzer).
- `Lynx.FrontendTelemetryAgent` — click/usage tracking, UX metrics instrumentation.
- `Lynx.FrontendDocsAgent` — higher-level "how to use the system" documentation.

---

## 5. MCP Tools & Servers (L3) for Frontend

These are the **capabilities** AI agents can use. Orchestrator (L1) controls which ones each agent sees.

### 5.1 Core Tools (shared)

- `repo.mcp`
  - `readFile(path)`
  - `writeDiff(patch)`
  - `listFiles(glob)`

- `git.mcp`
  - `createBranch(name)`
  - `createCommit(diff, message)`
  - (Optionally) `openPullRequest(title, description)`

- `tokens.mcp`
  - `getAllTokens()`
  - `validateUsage(filePath)`

- `lint.mcp`
  - `runESLint(paths)`
  - (Optionally) `runStylelint(paths)`

### 5.2 Testing & Quality Tools

- `test.mcp`
  - `runUnitTests(pattern)`
  - `runIntegrationTests(pattern)`

- `a11y.mcp`
  - `runAxeOnRoute(route)`
  - `runAxeOnComponent(componentPath)`

- (Future) `visual-regression.mcp`
  - `captureScreenshot(target)`
  - `compareWithBaseline(target)`

### 5.3 Design & Docs Tools

- `storybook.mcp`
  - `listStories()`
  - `runStory(storyId)`

- (Optional) `figma.mcp`
  - `createFrameFromDescription(description)`
  - `exportFrame(frameId)`

### 5.4 Infra / Metrics (Future)

- `bundle-analyzer.mcp`
  - `analyzeRoute(route)`
  - `reportBundles()`

- `ci.mcp`
  - `runPipeline(name)`
  - `checkStatus(pipelineId)`

---

## 6. Orchestrator Logic (L1) – Conceptual Flow

The **frontend-orchestrator** is responsible for coordinating these agents.

### 6.1 Example Flow: Landing Page Improvement

1. **Input (from L0 / human):**
   - Task: "Improve AI-BOS landing hero to feel more Fortune 500, reduce noise."

2. **Orchestrator (frontend profile):**
   - Classifies task as `FRONTEND_UIUX_UPDATE`.
   - Chooses agents & order:
     - `Lynx.UIUXEngineer`
     - `Lynx.FrontendImplementor`
     - `Lynx.A11yGuard`
     - `Lynx.FrontendTester`
     - `Lynx.StorybookAgent`
   - Establishes context with:
     - `taskId`, `tenantId`, `targetFiles`, `routes`.

3. **UI/UX Phase:**
   - `Lynx.UIUXEngineer` reads existing hero component.
   - Fetches tokens and known patterns.
   - Produces updated layout + `Component.types.ts`.
   - Returns:
     - `changedFiles` (hero component, types file, optional story skeleton).
     - `designNotes`.

4. **Implementation Phase:**
   - `Lynx.FrontendImplementor` wires logic into a container or page.
   - Uses types from UI/UX.
   - Returns `changedFiles` + `implementationNotes`.

5. **A11y Phase:**
   - `Lynx.A11yGuard` audits the updated route.
   - Applies minimal fixes if allowed.
   - Returns `a11yNotes` and optional `changedFiles`.

6. **Testing Phase (Gatekeeper):**
   - `Lynx.FrontendTester` runs relevant tests via `test.mcp`.
   - If tests **pass**:
     - Report `status: PASS`, coverage summary.
   - If tests **fail**:
     - Do NOT change app logic.
     - Fix test-only issues where obvious.
     - Return `status: FAIL` + `errors`.
   - Orchestrator may route failures back to `FrontendImplementor` once or twice.

7. **Docs Phase:**
   - `Lynx.StorybookAgent` ensures there is a Storybook story.
   - Updates or creates stories as needed.

8. **Finalization:**
   - Orchestrator aggregates:
     - `affectedFiles` (union of all agents).
     - `prDescription` (Design + Implementation + A11y + Testing notes).
   - Applies diff to a feature branch via `git.mcp`.
   - Marks task as **ready for human review & merge**.

---

## 7. Testing Strategy (v1)

**Principle:** Start with **unit + integration tests only** using Vitest/Jest. Defer AI-driven E2E (Playwright/Cypress) to later phases.

- `Lynx.FrontendTester`:
  - Focuses on running `npm test` / `vitest` suites.
  - Ensures changed components/pages are covered.
  - Produces high-signal reports and missing-test suggestions.
- E2E / browser-based tests:
  - Left to human QA or future, more advanced agents.

This keeps the system:
- Fast to run.
- Understandable for LLMs.
- Less flaky than full browser automation.

---

## 8. Anti-Drift Rules (Must Always Hold)

To prevent the system from collapsing back into "prompt chaos", the following rules are **non-negotiable**:

1. **Tokens Are Law**
   - No agent (human or AI) may hardcode colors, spacing, fonts, radii, or shadows in frontend code.
   - All visual design must use approved tokens.

2. **Kernel / Orchestrator Is the Gate**
   - No agent can operate directly on the repo without going through the orchestrator.
   - Orchestrator defines allowed tools and directories per task.

3. **Agents Work in Diffs, Not Blobs**
   - All agents must output **surgical diffs**, not full-file rewrites, unless explicitly requested.

4. **Every Change Has Notes**
   - UI/UX and implementation changes must include:
     - Design Notes or Implementation Notes.
     - What pattern was used.
     - Why this layout/structure was chosen.

5. **Lint + A11y + Tests Before Done**
   - No frontend task is considered "Done" until:
     - ESLint passes.
     - A basic a11y audit passes or is explicitly waived.
     - Unit/integration tests pass.

---

## 9. Implementation Phases

To avoid over-engineering from day one, the Frontend Dev Orchestra will be implemented in phases.

### Phase 1 — Minimal Orchestra

- One combined agent ("Frontend Brain") that internally respects:
  - Presentational vs container split.
  - Token usage rules.
- A simple orchestrator function (`orchestrateFrontendTask`) that:
  - Calls the combined agent for design + implementation.
  - Runs tests via a basic Tester function.

### Phase 2 — Split Personas

- Physically split into:
  - `Lynx.UIUXEngineer`
  - `Lynx.FrontendImplementor`
  - `Lynx.FrontendTester`
  - `Lynx.A11yGuard`
  - `Lynx.StorybookAgent`

- Add more precise tool & directory policies.

### Phase 3 — Advanced Quality & Metrics

- Introduce:
  - `Lynx.PerfProfiler`
  - Visual regression tooling.
  - Telemetry agent for UX metrics.

---

## 10. Glossary

- **Agent:** An L2 persona (LLM + tools) with a narrow, well-defined responsibility.
- **Orchestrator:** L1 service that routes tasks to agents and enforces policies.
- **MCP (Model Context Protocol):** A protocol for exposing tools/capabilities to LLMs.
- **Design Tokens:** The single source of truth for colors, spacing, typography, radius, etc.
- **GRCD:** Governance/Requirements/Controls/Definition document that formalizes rules per component.

---

This specification is the **canonical reference** for future GRCD documents and agent configurations related to frontend work.

All future AI-generated GRCDs for frontend agents and orchestrators must remain consistent with this hierarchy and set of roles, unless explicitly superseded by a newer human-approved version.

