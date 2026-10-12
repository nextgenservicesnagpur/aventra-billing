# 05 — Infrastructure Layer Taxonomy

Path:

```text
src/features/<feature>/infrastructure/
```

Allowed subdirectories:

```text
infrastructure/
├── prisma/
├── auth/
├── repositories/
├── adapters/
├── services/
└── config/
```

## `prisma/`

Prisma-specific database access, models/mappers, and persistence implementation.

Never import these files into domain.

## `auth/`

Better Auth integration/configuration and authentication provider adapters.

Auth business policy remains outside provider-specific implementation.

## `repositories/`

Concrete external repository adapters when the persistence implementation belongs at infrastructure level.

Do not duplicate repository implementations between `data/repositories` and `infrastructure/repositories` without a clearly documented boundary.

## `adapters/`

Adapters for external systems:
- email
- storage
- payments
- third-party APIs
- queues
- external services

## `services/`

Technical infrastructure services only.

Examples:
- mail transport
- file storage client
- external API client

Never use this folder for generic business logic.

## `config/`

Infrastructure-specific configuration and initialization.

Secrets come from environment/configuration, never hardcoded.

## Infrastructure restrictions

Infrastructure must be replaceable.

Do not leak Prisma/Better Auth/provider types through domain APIs.
