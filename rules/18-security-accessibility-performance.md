# 18 — Security, Accessibility, Performance

Security:
- Validate untrusted input.
- Authorize server-side.
- Protect secrets.
- Never expose sensitive fields unnecessarily.
- Avoid unsafe HTML injection.
- Apply current CSRF/session/rate-limit/security-header guidance where relevant.
- Never disable security checks to make development easier.

Accessibility:
- Semantic HTML.
- Accessible labels.
- Keyboard navigation.
- Visible focus.
- Correct modal/dialog focus.
- Associated errors.
- Do not rely on color alone.
- Reduced motion.
- Intentional ARIA.

Performance:
- Intentional server/client boundaries.
- Avoid unnecessary client JS.
- Avoid unnecessary re-renders.
- Avoid N+1 queries.
- Lazy-load genuinely heavy client features.
- Measure before complex optimization.
