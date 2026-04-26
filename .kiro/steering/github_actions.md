---
inclusion: fileMatch
fileMatchPattern: "**/.github/workflows/*.{yml,yaml}"
---

# GitHub Actions CI/CD

Rules and conventions for GitHub Actions workflows in this project.

## Project Commands

| Step | Command | Notes |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | Always use `--frozen-lockfile` in CI |
| Lint | `pnpm lint` | Next.js ESLint |
| Type check | `pnpm exec tsc --noEmit` | Strict mode TypeScript |
| Test | `pnpm test` | Vitest in single-run mode (`vitest --run`) |
| Build | `pnpm build` | Next.js production build |
| Electron (Mac) | `pnpm electron:build:mac` | Electron Builder |
| Electron (Win) | `pnpm electron:build:win` | Electron Builder |

Use `pnpm` exclusively — never `npm` or `yarn`.

## Workflow File Conventions

- Place all workflow files in `.github/workflows/`.
- Name files by purpose: `ci.yml`, `deploy.yml`, `release.yml`.
- Use descriptive `name:` values for workflows and jobs.
- Comment non-obvious steps to explain intent.
- Keep each workflow focused on a single concern.

## Standard CI Pipeline

A CI workflow must run these steps in order:

1. Install dependencies
2. Lint
3. Type check
4. Test
5. Build

```yaml
# Example CI job structure
jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@<commit-sha>
      - uses: pnpm/action-setup@<commit-sha>
      - uses: actions/setup-node@<commit-sha>
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
      - run: pnpm test
      - run: pnpm build
```

## Triggers

- CI: `on: [push, pull_request]` targeting relevant branches.
- Deploy: `on: push` with a branch filter (e.g., `branches: [main]`).
- Use `paths` filters to skip runs when only docs, markdown, or config files change.

## Job Design

- Use `needs` to express job dependencies; parallelize independent jobs.
- Use matrix builds for cross-platform or multi-Node-version testing.
- Use `concurrency` groups to cancel superseded runs on the same branch:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- Use `environment` for deployment stages (`staging`, `production`).
- Upload/download artifacts only when data must pass between jobs.

## Caching

- Use `pnpm/action-setup` with built-in caching, or cache the pnpm store manually at `~/.local/share/pnpm/store`.
- Cache the `.next/cache` directory for faster Next.js builds when practical.

## Timeouts and Reliability

- Set `timeout-minutes` on every job (15 minutes is a reasonable default for CI).
- Use `continue-on-error` only for explicitly non-critical steps.
- Add retry logic for flaky network operations (e.g., `nick-fields/retry`).
- Configure failure notifications for the `main` branch.

## Security

- Store all secrets (API keys, deploy tokens) in GitHub Secrets — never hardcode.
- Set explicit `permissions` on `GITHUB_TOKEN` using least-privilege scoping.
- Pin action versions to full commit SHAs, not mutable tags.
- Prefer OIDC for cloud provider authentication.
- Run `pnpm audit` or a dependency scan step on `main` branch pushes.
- Never echo or log sensitive values.

## Deploy Targets

- Web: Vercel (triggered via Vercel GitHub integration or manual workflow).
- Desktop: Electron Builder (`pnpm electron:build:mac` / `pnpm electron:build:win`).
