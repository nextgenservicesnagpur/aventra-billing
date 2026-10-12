# 16 — Vitest Testing

Vitest is mandatory for unit/integration testing.

Required tests:
- domain invariants
- use-case/application behavior
- important data mappers
- authorization/security behavior
- meaningful form/UI behavior
- infrastructure adapters where practical
- regression fixes

Tests must be deterministic.

Forbidden:
- arbitrary sleeps
- test-order dependence
- hidden network calls
- production credentials
- real external side effects

Do not test implementation details when observable behavior is the actual contract.
