# Aventra Engineering Rules v2

This package contains the strict repository rules for Aventra.

## Install

Copy:
- `AGENTS.md` -> repository root
- `rules/` -> repository root

## Canonical feature structure

```text
src/features/<feature>/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── contracts/
│   ├── errors/
│   ├── services/
│   └── rules/
├── data/
│   ├── dto/
│   ├── mappers/
│   ├── repositories/
│   ├── queries/
│   ├── mutations/
│   └── validators/
├── presentation/
│   ├── components/
│   ├── page/
│   ├── forms/
│   ├── hooks/
│   ├── animation/
│   ├── view-models/
│   └── validators/
└── infrastructure/
    ├── prisma/
    ├── auth/
    ├── repositories/
    ├── adapters/
    ├── services/
    └── config/
```

The four architectural layers are mandatory. The listed subdirectories are an allowed taxonomy; create a subdirectory only when its responsibility exists.

## Routing

`src/app` is the Next.js routing/composition layer.

Example:
`src/app/(auth)/auth/page.tsx`

The route composes `src/features/auth/presentation`; it does not contain auth business logic.

## Important

Do not create arbitrary directories or generic dumping grounds. If a new responsibility genuinely cannot fit the taxonomy, document and review the architectural need before creating a new category.

## Local development: auth & database

The app uses the machine PostgreSQL server (default port 5432), Prisma,
Better Auth, Resend, and Zod. Never install another database server.

1. Copy `.env.example` to `.env` and fill in real values (never commit `.env`):

   ```text
   DATABASE_URL=          # existing local PostgreSQL, e.g. postgresql://user:pass@localhost:5432/aventra_billing
   BETTER_AUTH_SECRET=    # min 32 chars, e.g. openssl rand -base64 32
   BETTER_AUTH_URL=       # e.g. http://localhost:3000
   RESEND_API_KEY=        # Resend dashboard
   AUTH_EMAIL_FROM=       # verified sender, e.g. "Aventra <auth@example.com>"
   ```

2. Apply migrations, then generate the client:

   ```bash
   npx prisma migrate dev --name <descriptive-name>
   npx prisma generate
   ```

3. Useful checks: `npm run lint`, `npm run build`, `npm test`,
   `npx prisma validate`.

Granting the platform `superadmin` role is a trusted server-side database
operation only (never via signup or client state), for example in local dev:

```sql
UPDATE "user" SET role = 'superadmin' WHERE email = 'admin@example.com';
```
