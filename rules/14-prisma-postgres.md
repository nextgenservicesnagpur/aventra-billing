# 14 — PostgreSQL and Prisma

PostgreSQL is the primary database.

Prisma is the ORM.

Use current stable Prisma releases unless a prerelease is explicitly approved.

Rules:
- Keep Prisma packages/runtime versions compatible.
- Prisma is infrastructure/data, never domain.
- Never expose raw Prisma records to presentation.
- Database changes require migrations.
- Do not use `db push` as production migration strategy.
- Do not rewrite applied migrations.
- Use transactions for atomic operations.
- Avoid N+1 queries.
- Select only required fields.
- Add indexes based on actual access patterns.
- Validate filters and pagination.
- Use database constraints as defense in depth.
- Never commit database credentials.
