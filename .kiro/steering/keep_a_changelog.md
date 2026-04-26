---
inclusion: fileMatch
fileMatchPattern: '**/CHANGELOG.md'
---

# Changelog Standards

Follow [Keep a Changelog 1.0.0](https://keepachangelog.com/en/1.0.0/) with [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Rules

- Changelogs are for humans — write from the user's perspective, not the developer's.
- Every version gets an entry. Unreleased changes sit at the top under `## [Unreleased]`.
- Date entries in ISO 8601 format: `YYYY-MM-DD`.
- Link each entry to the relevant PR or issue when available: `([#42](url))`.
- Omit internal refactors, dependency bumps, or CI changes unless they affect users.
- Include comparison links at the bottom of the file for each version.

## Change Categories

Use only these six `###` headings, in this order. Omit empty categories.

| Category       | Use for                                                        |
|----------------|----------------------------------------------------------------|
| `Added`        | New features, endpoints, configuration options, UI components  |
| `Changed`      | Non-breaking changes to existing behavior, performance gains   |
| `Deprecated`   | Features marked for future removal                             |
| `Removed`      | Deleted features, dropped API endpoints or dependencies        |
| `Fixed`        | Bug fixes, crash fixes, corrected behavior                     |
| `Security`     | Vulnerability patches, dependency updates for CVEs             |

## Entry Style

- Start each line with a verb in past tense or a noun phrase describing the change.
- Be specific: name the feature, component, or route affected.
- Include measurable impact when relevant (e.g., "Reduced bundle size by 18%").
- Keep each entry to one line — if it needs more, the scope is too broad; split it.

Good: `- Added MIDI CC mapping persistence via Convex ([#45](url))`
Bad: `- New feature` / `- Updated stuff` / `- Bug fixes`

## File Template

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - YYYY-MM-DD

### Added
- Initial release

[Unreleased]: https://github.com/user/repo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/user/repo/releases/tag/v0.1.0
```
