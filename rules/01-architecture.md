# 01 — Strict Clean Architecture

Aventra uses feature-first Clean Architecture.

Every business feature has this canonical shape:

```text
src/
└── features/
    └── <feature-name>/
        ├── domain/
        ├── data/
        ├── presentation/
        └── infrastructure/
```

Dependency direction:

```text
app
 ↓
presentation
 ↓
data/application contracts
 ↓
domain

infrastructure
 ↓
domain contracts
```

The domain is the most stable layer.

Domain must not depend on:
- React
- Next.js
- Prisma
- Better Auth
- PostgreSQL
- browser APIs
- Tailwind
- Motion/GSAP/Three.js/Lenis
- Recharts
- Node-only infrastructure APIs

Presentation must not access Prisma directly.

Data must not import presentation.

Infrastructure must not import presentation.

Feature A must not import Feature B private files.

Do not fix dependency cycles with lazy imports, `any`, barrel-file tricks, or circular abstractions. Correct the architecture.

Next.js route files under `src/app` are composition/routing boundaries. They should orchestrate the feature rather than contain business rules.

Do not create a generic root `services/`, `repositories/`, `controllers/`, or `utils/` directory as a shortcut around feature ownership.
