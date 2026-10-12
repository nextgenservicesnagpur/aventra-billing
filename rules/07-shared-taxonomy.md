# 07 — Shared Directory Taxonomy

Path:

```text
src/shared/
```

Allowed:

```text
shared/
├── components/
├── animation/
├── hooks/
├── lib/
├── utils/
├── types/
├── constants/
├── errors/
└── config/
```

## Ownership rule

Shared code must be feature-agnostic.

If a module contains auth, invoice, customer, billing, inventory, or another specific business concept, it normally belongs to that feature.

Do not move code into shared just because two files currently import it.

Shared is a stable dependency surface. A feature must never import another feature's private code through shared.

## Animation

Global animation primitives/configuration belong only in:

```text
src/shared/animation/
```

Feature animation belongs only in:

```text
src/features/<feature>/presentation/animation/
```
