# 10 — Strict Styling and Design System

All colors are defined in:

```text
src/app/globals.css
```

Use semantic tokens.

Forbidden:
- `#hex` colors in TS/TSX
- `rgb(...)`/`hsl(...)` color literals in components
- arbitrary Tailwind color literals
- inline color literals
- duplicated palette values

Use Tailwind utilities for styling.

Use `cn()` for conditional/composed Tailwind classes.

Fonts:
- Lato
- Montserrat
- one additional professional signature/display font only when justified

Do not add arbitrary fonts or typography values without design-system justification.

The design system should define semantic color, typography, spacing, radius, elevation, focus, and motion conventions.
