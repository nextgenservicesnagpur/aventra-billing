# 03 — Domain Layer Taxonomy

Path:

```text
src/features/<feature>/domain/
```

Allowed subdirectories:

```text
domain/
├── entities/
├── value-objects/
├── contracts/
├── errors/
├── services/
└── rules/
```

## `entities/`

Business entities with identity and behavior.

Examples:
- Invoice
- Customer
- User
- Subscription

Entities must not contain persistence or UI concerns.

## `value-objects/`

Immutable concepts defined by value.

Examples:
- Money
- EmailAddress
- InvoiceNumber
- TaxRate

Value objects enforce their own invariants where appropriate.

## `contracts/`

Stable domain/application-facing contracts such as repository interfaces or ports.

Contracts describe what is needed, not how it is implemented.

## `errors/`

Typed domain-specific errors.

Do not expose infrastructure errors as domain errors.

## `services/`

Only for genuine domain logic that cannot naturally belong to one entity/value object.

Do not use `services/` as a generic business-code dumping ground.

## `rules/`

Named business invariants/policies when separating them improves clarity.

Do not create a `rules/` folder merely to store random constants.

## Domain restrictions

Domain files must remain framework-independent.

Forbidden:
- Prisma imports
- Better Auth imports
- React
- JSX
- Next.js
- Tailwind
- browser APIs
- environment access
- HTTP request/response objects
- database records
- animation libraries
