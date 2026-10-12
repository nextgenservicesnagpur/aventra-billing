# 19 — Errors, Config, Git

Errors:
- Use typed/domain-specific errors where useful.
- Never silently swallow errors.
- Preserve causes/context.
- Do not expose stack traces or secrets to users.
- Avoid permanent `console.log` as application observability.

Config:
- Centralize configuration.
- Validate required environment variables.
- Never hardcode secrets.
- `.env.example` contains safe placeholders only.
- Public env vars must be intentionally public.

Git:
- Keep commits focused.
- Never commit secrets, build output, local databases, or editor junk.
- Review `git diff`.
- Do not mix unrelated refactors.
- Review dependency and migration changes carefully.
