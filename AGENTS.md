# Aventra Engineering Rules

## Authority and precedence

1. `/rules` is authoritative for Aventra architecture and engineering quality.
2. Preserve the Next.js-generated guidance block in this file; Next.js may regenerate it.
3. Security, data integrity, and architectural boundaries take precedence over speed.
4. Never use a shortcut, hack, duplicate implementation, or knowingly weak pattern just to finish faster.
5. When framework guidance and Aventra architecture appear to conflict, verify current official framework documentation before changing the architecture.

## Mandatory agent workflow

Before coding:
- Read the applicable `/rules` files.
- Inspect the target feature and its existing layer boundaries.
- Search for existing shared components/utilities before creating duplicates.
- Read current Next.js guidance under `node_modules/next/dist/docs/` when the task touches Next.js.
- Inspect current package versions and official package documentation when adding/updating dependencies.
- Identify required tests.

During coding:
- Preserve Clean Architecture.
- Keep feature ownership explicit.
- Keep dependencies flowing inward.
- Do not bypass layers.
- Do not create arbitrary directories.
- Do not add dependencies without justification.
- Do not leave temporary code, debug logs, dead code, or mock leakage.

Before completion:
- Run typecheck.
- Run lint.
- Run relevant Vitest tests.
- Run the production build when applicable.
- Review the Git diff.
- Check architecture boundaries, hardcoded colors, secrets, mocks, dependency changes, and accessibility.

## Next.js generated guidance

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Non-negotiables

- Strict feature-first Clean Architecture.
- Business code lives under `src/features/<feature>/`.
- Every feature uses the four architectural layers: `domain`, `data`, `presentation`, `infrastructure`.
- Layer subdirectories are governed by the directory taxonomy in `/rules/02-project-structure.md`.
- `src/app` is the Next.js routing/composition boundary, not the home for feature business logic.
- `src/shared` contains only genuinely feature-agnostic code.
- Global animation belongs in `src/shared/animation/`.
- Feature animation belongs in `src/features/<feature>/presentation/animation/`.
- Domain must not import React, Next.js, Prisma, Better Auth, browser APIs, Tailwind, or animation/chart libraries.
- Presentation must not import Prisma/database clients directly.
- Feature A must not reach into Feature B's private internals.
- PostgreSQL is the primary database.
- Prisma is the ORM.
- Better Auth is the authentication system.
- Use current maintained stable packages. Do not install legacy versions to silence peer-dependency problems.
- Never use `--force` or `--legacy-peer-deps` as routine fixes.
- Prerelease packages require explicit approval.
- Lucide React is the default icon system.
- Recharts is the default standard chart system.
- Allowed animation technologies: Motion/Framer Motion, GSAP, Three.js, Lenis.
- Vitest is required for testing.
- Project-defined functions use arrow-function syntax.
- Colors live in `src/app/globals.css` as semantic tokens.
- No hardcoded color literals in TS/TSX or arbitrary Tailwind colors.
- Use `cn()` for conditional/composed Tailwind classes.
- UI components are built in-house; do not copy/download component-library implementations.
- Validate untrusted input and authorize protected operations server-side.
- No secrets in source control or client bundles.
- Remove obsolete mocks when real data replaces them.
- No `any`, `@ts-ignore`, `@ts-nocheck`, broad lint disables, debug logs, or commented-out dead code.
