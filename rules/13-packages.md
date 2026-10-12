# 13 — Strict Package Governance

Use maintained current stable releases compatible with the project.

Core technology policy:
- Next.js
- React
- TypeScript
- PostgreSQL
- Prisma
- Better Auth
- Vitest
- Tailwind CSS
- `clsx` + `tailwind-merge` through `cn()`
- Lucide React
- Recharts

Animation:
- Motion/Framer Motion
- GSAP
- Three.js
- Lenis

Rules:
- Do not install legacy packages.
- Do not downgrade core packages merely to silence an audit/peer warning.
- Do not use `npm install --force`.
- Do not use `--legacy-peer-deps`.
- Do not blindly use `npm audit fix --force`.
- Review peer dependencies before adding packages.
- Remove unused dependencies.
- Prerelease/alpha/beta/canary/RC packages require explicit approval.
- A registry `latest` tag is not automatically considered production-stable.
- Keep lockfile committed.
