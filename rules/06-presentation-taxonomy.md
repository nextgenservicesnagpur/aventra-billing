# 06 — Presentation Layer Taxonomy

Path:

```text
src/features/<feature>/presentation/
```

Allowed subdirectories:

```text
presentation/
├── components/
├── page/
├── forms/
├── hooks/
├── animation/
├── view-models/
└── validators/
```

## `components/`

Feature-specific reusable UI components.

## `page/`

Feature page-level composition components used by Next.js route files.

## `forms/`

Feature forms and form-specific presentation behavior.

Forms still require server-side validation at trust boundaries.

## `hooks/`

Feature-specific React hooks.

Do not put domain/business rules inside React hooks.

## `animation/`

Feature-specific animation only.

Global animation belongs in `src/shared/animation/`.

## `view-models/`

Transform domain/application data into presentation-friendly shapes.

View models must not become hidden business-rule engines.

## `validators/`

Presentation-focused validation such as immediate form feedback.

Security/trust-boundary validation must also happen server-side.

## Presentation restrictions

- No direct Prisma access.
- No direct database clients.
- No secrets.
- No business persistence logic.
- Do not turn the entire feature/page into a Client Component unnecessarily.
