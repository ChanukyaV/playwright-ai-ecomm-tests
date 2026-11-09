---
name: generate-ui-test
description: 'Generate a Playwright UI test for the ShopLab app that follows this repo''s framework standards (Page Object Model, data-testid locators, UI-NN test IDs, web-first assertions). Asks the user for test steps first. Use when asked to generate, write, add, or automate a UI / E2E / browser test case.'
argument-hint: 'Optional: paste the test steps and expected results, or leave empty to be asked'
---

# Generate UI Test

Turn the user's test steps into a Playwright UI test that matches this framework's standards exactly, so every team member gets the same structure and style.

All framework rules live in [standards.md](./standards.md). It is the single source of truth: read it fully before writing any code, and follow it over anything you infer from older specs in the repo.

## Workflow

### 1. Get the test steps (always first)

If the user did not already provide steps in the request, ask for them before doing anything else. Collect:

1. **Scenario title**: what is being verified.
2. **Steps**: numbered user actions, in order.
3. **Expected results**: what should be true after the steps (or after each step).
4. **Preconditions / test data**: product IDs, search keywords, cart state, etc. (optional).

Ask one thing at a time, and only for what is missing. Do not invent expected results. If the steps are ambiguous, ask. If the user gave several scenarios, generate one test per scenario.

### 2. Read the standards and the repo

1. Read [standards.md](./standards.md).
2. List `pages/` and `tests/ui/` and read the page objects the scenario touches.
3. Find the next free test ID (see "Test IDs" in the standards).
4. For locators, use `data-testid` values from the app source in `platform/src` (components and `app/**/page.tsx`). Do not guess selectors.

### 3. Generate

1. Reuse existing page objects and methods. Add to an existing page object when the page already exists; create a new `pages/<name>.page.ts` only for a new page or component.
2. Write the spec in `tests/ui/`, following the spec rules and template in the standards.
3. Add or update the manual test case in `tests/manual-test-cases.md` as described in the standards.
4. Keep changes minimal. Do not refactor unrelated files or fix pre-existing deviations.

### 4. Verify

1. Type-check the new or changed files with `npx tsc --noEmit --skipLibCheck --esModuleInterop --target ES2020 --moduleResolution node --resolveJsonModule <files>`.
2. Run only the new test: `npx playwright test <spec file> -g "<TEST-ID>"`.
3. If it fails, fix the cause (locator, wait, assertion). Never weaken an assertion, add a fixed sleep, or skip the test just to make it pass. If the failure points to an app defect rather than a test defect, stop and report it to the user.
4. Run it 3 times (`--repeat-each=3`) to catch flakiness.

### 5. Report back

Give the user a short summary:

- Files created or changed (as links).
- The test ID and title.
- The standards checklist result (see the end of standards.md).
- Pass/fail evidence from the run.
- 2–4 suggested additional scenarios (negative, edge) the user may want next. Do not generate them unless asked.
