# 21 — Agent Operating Procedure

Before coding:
1. Read the relevant rules.
2. Locate the feature.
3. Identify the correct layer.
4. Identify the correct allowed subdirectory.
5. Search for existing implementations.
6. Verify current official documentation.
7. Plan tests.

During coding:
1. Preserve boundaries.
2. Reuse existing primitives.
3. Keep one responsibility per file/module.
4. Validate data at trust boundaries.
5. Keep changes localized.
6. Avoid speculative abstractions.

If a requested implementation does not fit the directory taxonomy, do not invent a new folder automatically. Determine whether an existing category fits. If not, document the architectural need before introducing a new category.

Never:
- bypass architecture
- disable type/lint checks
- add broad lint disables
- use `@ts-ignore`
- install legacy packages to make an example work
- leave temporary hacks
- hide errors
- fabricate test results
