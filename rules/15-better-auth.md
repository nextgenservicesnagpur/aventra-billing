# 15 — Better Auth

Better Auth is the authentication system.

Rules:
- Use current maintained stable release.
- Follow current Better Auth documentation.
- Authentication identifies users; authorization controls permissions.
- Enforce authorization server-side.
- Never trust client-provided roles/permissions.
- Client route protection is not sufficient authorization.
- Sensitive operations re-check authorization at the server boundary.
- Auth UI belongs in `features/auth/presentation`.
- Better Auth integration belongs in `features/auth/infrastructure/auth`.
- Never log passwords, tokens, cookies, or session secrets.
