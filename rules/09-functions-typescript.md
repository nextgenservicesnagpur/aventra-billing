# 09 — Strict TypeScript and Functions

Use strict TypeScript.

Project-defined functions must use arrow-function syntax.

Required style:

```ts
export const calculateTotal = (items: readonly Item[]) => {
  // ...
};

const InvoiceForm = () => {
  // ...
};
```

Forbidden:
- `function calculateTotal() {}`
- `any`
- `@ts-ignore`
- `@ts-nocheck`
- broad unsafe casts
- non-null assertions as shortcuts

Use `unknown` for untrusted values and narrow explicitly.

Use discriminated unions and exhaustive handling where useful.

Keep functions small and single-purpose.
