---
inclusion: fileMatch
fileMatchPattern: "**/.github/workflows/*.{yml,yaml}"
---

# GitHub Actions CI/CD

Guidelines for writing and maintaining GitHub Actions workflows in this project.

## Project Context

- Package manager: **pnpm** (not npm or yarn)
- Test runner: **Vitest** (`pnpm test` runs `vitest --run`)
- Linter: **Next.js lint** (`pnpm lint`)
- Build: `pnpm build` (Next.js production build)
- Electron builds: `pnpm electron:build:mac` / `pnpm electron:build:win`
- Deploy target: Vercel (web), Electron Builder (desktop)

## Workflow Structure

- Use descriptive workflow and job names
- Organize by purpose: `ci.yml`, `deploy.yml`, `release.yml`
- Use `needs` for job dependencies; parallelize independent jobs
- Use matrix builds when testing across Node versions or platforms
- Keep workflows DRY with reusable workflows and composite actions

## CI Pipeline Essentials

A standard CI workflow for this project should include:

1. **Install** — `pnpm install --frozen-lockfile`
2. **Lint** — `pnpm lint`
3. **Type check** — `pnpm exec tsc --noEmit`
4. **Test** — `pnpm test` (runs Vitest in single-run mode)
5. **Build** — `pnpm build`

Cache the pnpm store between runs using `actions/cache` or `pnpm/action-setup` with caching enabled.

## Security

- Store secrets (API keys, deploy tokens) in GitHub Secrets — never hardcode
- Set explicit `permissions` on `GITHUB_TOKEN` (least privilege)
- Pin action versions to full commit SHAs, not mutable tags
- Use OIDC for cloud provider auth when possible
- Run `pnpm audit` or a dependency scan step on `main` branch pushes

## Performance

- Cache pnpm store: `~/.local/share/pnpm/store`
- Use `concurrency` groups to cancel superseded runs on the same branch
- Use `paths` filters to skip workflows when only docs or config files change
- Upload/download artifacts only when needed between jobs

## Error Handling

- Set `timeout-minutes` on jobs (default is 360 — too long for CI)
- Use `continue-on-error` sparingly and only for non-critical steps
- Add retry logic for flaky network steps (e.g., `nick-fields/retry`)
- Configure failure notifications for the `main` branch

## Conventions

- Workflow files go in `.github/workflows/`
- Use `on: [push, pull_request]` for CI; `on: push` with branch filter for deploy
- Use `environment` for deployment stages (staging, production)
- Comment non-obvious steps to explain intent
- Keep secrets out of workflow logs — avoid `echo` on sensitive values
