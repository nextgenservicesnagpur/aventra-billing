# 08 — Strict Import Boundaries

Forbidden:

```text
domain -> presentation
domain -> infrastructure
domain -> Next.js
domain -> Prisma
domain -> Better Auth
presentation -> Prisma
presentation -> database client
data -> presentation
infrastructure -> presentation
shared -> feature
feature A -> feature B private internals
```

Allowed examples:

```text
app -> feature presentation
presentation -> domain/application contracts
data -> domain
infrastructure -> domain contracts
```

Do not solve violations with:
- `any`
- dynamic imports
- broad casts
- disabling ESLint
- circular barrel exports
- duplicated implementations

Fix the ownership or dependency direction.
