# 12 — Animation

Allowed technologies:
- Motion/Framer Motion
- GSAP
- Three.js
- Lenis

Use the smallest suitable technology.

Global:
```text
src/shared/animation/
```

Feature:
```text
src/features/<feature>/presentation/animation/
```

Never put feature-specific animation in shared.

Animation must not contain business logic.

Respect `prefers-reduced-motion`.

Clean up animation instances, observers, event listeners, RAF loops, and subscriptions.

Three.js is not a default choice for ordinary UI transitions.
