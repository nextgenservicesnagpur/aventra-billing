# 17 — Mock and Fixture Lifecycle

Mocks are temporary development/test infrastructure.

Rules:
- Keep mock data clearly separated from production code.
- Prefer factories.
- Never route production behavior through mock implementations accidentally.
- When real data is available, remove obsolete mocks, fixtures, mock env vars, fake UI states, and fake seed data.
- Search for references to removed mocks.
- Remove TODOs that only existed to track mock replacement.
- Run tests and build after cleanup.
