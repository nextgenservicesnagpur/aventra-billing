/** Presentation choices only. Prices/quotas must come from a real catalog. */
export const subscriptionPlanOptions = [
  { id: "starter", name: "Starter", description: "Essential invoicing", included: "Invoices, customers & payment tracking" },
  { id: "business", name: "Business", description: "For a growing team", included: "Billing workflows & team access" },
  { id: "enterprise", name: "Enterprise", description: "For larger operations", included: "Advanced controls & tailored support" },
] as const;
