# 02 — Canonical Project and Feature Directory Structure

## Root

The root may contain:

```text
/
├── AGENTS.md
├── rules/
├── src/
├── prisma/
├── public/
├── tests/                 # only when a cross-feature/global test location is justified
├── scripts/               # only for actual repository tooling
├── package.json
├── tsconfig.json
├── eslint.config.*
├── next.config.*
└── ...
```

Do not create arbitrary folders such as:
- `misc`
- `stuff`
- `temp`
- `old`
- `backup`
- `helpers`
- `common`
- `components2`
- `services2`
- `utils2`

## `src`

```text
src/
├── app/
├── features/
└── shared/
```

## Next.js `app`

Example:

```text
src/app/
├── (auth)/
│   └── auth/
│       ├── page.tsx
│       └── layout.tsx
├── (dashboard)/
├── api/
├── layout.tsx
└── globals.css
```

`app` owns route composition, layouts, loading/error/not-found boundaries, route handlers, and Next.js-specific routing concerns.

Feature business logic does NOT belong in `app`.

## Feature root

Use plural `/features`, never `/feature`.

```text
src/features/<feature-name>/
├── domain/
├── data/
├── presentation/
└── infrastructure/
```

The four layers are mandatory architectural boundaries. Subdirectories inside them are responsibility-based and governed below.

## Important empty-folder rule

The four layer directories are part of the feature contract, but subdirectories are created only when their responsibility actually exists.

Do NOT create every possible subdirectory just to fill a template.

Do NOT put arbitrary files directly into a layer when a defined subdirectory clearly owns that responsibility.

## Example complete feature

```text
src/features/auth/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── contracts/
│   ├── errors/
│   ├── services/
│   └── rules/
│
├── data/
│   ├── dto/
│   ├── mappers/
│   ├── repositories/
│   ├── queries/
│   ├── mutations/
│   └── validators/
│
├── presentation/
│   ├── components/
│   ├── page/
│   ├── forms/
│   ├── hooks/
│   ├── animation/
│   ├── view-models/
│   └── validators/
│
└── infrastructure/
    ├── prisma/
    ├── auth/
    ├── repositories/
    ├── adapters/
    ├── services/
    └── config/
```

The above is a taxonomy, not a requirement to create all folders for every feature.
