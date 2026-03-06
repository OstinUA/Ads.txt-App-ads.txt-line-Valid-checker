# Contributing Guide

First off, thanks for investing your time in this project.

This extension solves a very specific AdOps validation problem, and high-quality contributions directly improve audit confidence and operational speed for everyone using it.

## Introduction

Whether you’re fixing a parser edge case, improving UI ergonomics, or tightening export behavior, contributions are welcome. Keep changes focused, testable, and aligned with the current architecture (lightweight, dependency-free, browser-native).

## I Have a Question

> [!IMPORTANT]
> Please do **not** open Issues for usage/help questions.

Issues are reserved for actionable engineering work (bugs and feature proposals).

If you need support or clarification:

- Use **GitHub Discussions** (if enabled in this repository).
- Use your team’s internal engineering/adops chat channel.
- When relevant, share a minimal reproducible input sample (domains + reference rows).

## Reporting Bugs

Before opening a bug report:

1. Search existing Issues to avoid duplicates.
2. Reproduce on the latest `main` branch revision.
3. Verify the bug is not caused by temporary network instability.

When opening a bug, include:

- **Environment**
  - OS + version
  - Chrome version
  - Extension version (from `manifest.json`)
- **Scope**
  - `ads.txt` or `app-ads.txt` mode
  - Batch size and filter mode used
- **Steps to Reproduce**
  - Exact domain inputs
  - Exact reference lines
  - Exact sequence of actions
- **Expected Behavior**
  - What should have happened
- **Actual Behavior**
  - What happened instead
- **Artifacts**
  - Screenshot(s) of result table/stats
  - CSV snippet if relevant
  - Console errors from extension popup/background if any

Bug reports missing reproducible steps may be closed as `needs-info`.

## Suggesting Enhancements

Enhancement proposals are welcome when they solve a real workflow pain point.

A solid enhancement request should include:

- The problem statement (what currently hurts).
- Why current behavior is insufficient.
- Proposed UX/logic changes.
- Real-world use cases (who benefits and how).
- Tradeoffs (performance, complexity, permissions, maintenance cost).

## Local Development / Setup

### 1) Fork and clone

```bash
git clone https://github.com/<your-username>/Ads.txt-App-ads.txt-line-Valid-checker.git
cd Ads.txt-App-ads.txt-line-Valid-checker
```

### 2) Create a working branch

```bash
git checkout -b feature/short-description
```

### 3) Load extension in Chrome

```text
Open chrome://extensions/
Enable Developer mode
Click Load unpacked
Select repository root folder
```

### 4) Validate changes manually

- Reload extension after each code change.
- Test both file modes (`ads.txt`, `app-ads.txt`).
- Validate CSV export and filtering behavior.

### 5) Commit and push

```bash
git add .
git commit -m "feat: concise description"
git push origin feature/short-description
```

## Pull Request Process

### Branch naming strategy

Use predictable branch prefixes:

- `feature/<topic>` for new functionality
- `bugfix/<issue-or-topic>` for bug fixes
- `chore/<topic>` for maintenance/refactor/tooling
- `docs/<topic>` for documentation-only updates

### Commit style

Use **Conventional Commits**:

- `feat: add ownerdomain parsing fallback`
- `fix: handle soft-404 html payload detection`
- `docs: rewrite setup and usage section`
- `chore: clean up popup state restoration flow`

### Keep branch fresh

Before opening a PR, sync with upstream `main` and rebase/merge as needed.

### PR description requirements

Every PR should include:

- Linked Issue(s), if any (`Closes #123`).
- Summary of behavioral changes.
- Risk assessment and rollback notes.
- Screenshots/GIFs for UI-visible changes.
- Manual test matrix you ran locally.

Small, focused PRs are reviewed and merged much faster than broad multi-topic changes.

## Styleguides

This project intentionally uses a minimal stack. Keep it that way.

- Prefer plain, readable Vanilla JS.
- Avoid introducing frameworks/build tooling unless explicitly discussed and approved.
- Keep parsing logic deterministic and side-effect-light.
- Preserve existing naming style and file organization.
- Keep UI text clear and operator-focused.

Recommended quality checks (optional but strongly encouraged):

- `prettier` for markdown/json/html/css formatting.
- `eslint` for JavaScript consistency.

If you add lint/format tooling, keep config minimal and document setup in README.

## Testing

All functional changes should include validation evidence.

At minimum, run and report:

- A happy-path check with known valid entries.
- A mismatch scenario producing `Partial`.
- A missing entry scenario producing `Not Found`.
- A network/error scenario producing `Error`.
- CSV export sanity check.

If you add automated tests in future, include run commands in README and execute them before requesting review.

## Code Review Process

- Maintainers review incoming PRs.
- At least **one maintainer approval** is required before merge.
- Address review comments with targeted follow-up commits.
- Resolve conversations only after requested changes are implemented.
- Force-push is acceptable on your feature branch, but avoid rewriting shared branch history.

> [!TIP]
> Respond to review comments with context, not just “fixed”. Mention what changed and why.

Thanks again for contributing and helping keep the validator production-grade.
