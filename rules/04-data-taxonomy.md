# 04 — Data Layer Taxonomy

Path:

```text
src/features/<feature>/data/
```

Allowed subdirectories:

```text
data/
├── dto/
├── mappers/
├── repositories/
├── queries/
├── mutations/
└── validators/
```

## `dto/`

Data-transfer shapes crossing application/data boundaries.

DTOs are not automatically domain entities.

## `mappers/`

Convert between external/data representations and domain/application representations.

Mapping logic must not be duplicated in components.

## `repositories/`

Data-facing repository implementations when the implementation belongs in the data boundary.

If the implementation is explicitly an external technical adapter, it may belong under infrastructure instead. The contract remains independent of the concrete persistence mechanism.

## `queries/`

Read-oriented data/application query orchestration.

Keep database-specific implementation details behind the appropriate boundary.

## `mutations/`

Write-oriented data/application coordination.

Business invariants remain in domain/application logic, not inside arbitrary mutation functions.

## `validators/`

Validation of incoming data representations before they enter trusted flows.

Do not confuse presentation form validation with server-side trust-boundary validation.

## Data restrictions

- Never return raw Prisma records to UI.
- Never put React components here.
- Never put Tailwind classes here.
- Never access browser APIs here.
