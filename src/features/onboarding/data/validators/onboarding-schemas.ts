import { z } from "zod";
import { ValidationError } from "../../domain/errors/onboarding-errors";
import {
  derivePanFromGstin,
  isValidGstin,
} from "../../domain/value-objects/gstin";

export const MAX_ORGANIZATION_FIELD_LENGTH = 100;
export const MAX_ADDRESS_LENGTH = 500;
export const MAX_TAX_FIELD_LENGTH = 100;
export const MAX_PHONE_LENGTH = 24;
export const MAX_POSTAL_LENGTH = 12;

export const subscriptionPlans = ["starter", "business", "enterprise"] as const;
export const billingCycles = ["Monthly", "Yearly"] as const;

/**
 * Trust-boundary input contracts for onboarding. Every server operation
 * validates its input here first; TypeScript types alone are never
 * trusted. Field ids mirror the presentation step model so client and
 * server speak the same shape. Closed product sets (plan, billing cycle)
 * are validated as enums; open option lists owned by presentation
 * (industry, region) are presence- and length-checked server-side.
 */
const optionalUrlSchema = z.union([
  z.literal(""),
  z.httpUrl("Enter a valid http:// or https:// website address."),
]);

const optionalTextSchema = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const organizationDetailsSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(1, "Legal business name is required.")
    .max(MAX_ORGANIZATION_FIELD_LENGTH),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(MAX_ORGANIZATION_FIELD_LENGTH),
  businessEmail: z.email().min(5).max(320),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(MAX_PHONE_LENGTH)
    .regex(
      /^\+?[0-9\s\-().]+$/,
      "Enter a valid phone number.",
    ),
  industry: z.string().trim().min(1, "Select an industry.").max(100),
  companySize: z.string().trim().min(1, "Select a company size.").max(20),
  website: optionalUrlSchema,
});

export const addressDetailsSchema = z.object({
  country: z.string().trim().min(1, "Select a country.").max(100),
  state: z
    .string()
    .trim()
    .min(1, "Select a state or province.")
    .max(100),
  city: z.string().trim().min(1, "City is required.").max(100),
  postalCode: z
    .string()
    .trim()
    .min(3, "Enter a valid postal code.")
    .max(MAX_POSTAL_LENGTH)
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9\s\-]*$/,
      "Enter a valid postal code.",
    ),
  businessAddress: z
    .string()
    .trim()
    .min(1, "Registered address is required.")
    .max(
      MAX_ADDRESS_LENGTH,
      `Address must be at most ${MAX_ADDRESS_LENGTH} characters.`,
    ),
});

/**
 * Step 3 (Tax & Compliance): GST is the only supported registration
 * system. The GSTIN is the source of truth — it is normalized and
 * structurally validated here, and the PAN is derived from it (client
 * payloads may echo the derived PAN; a mismatching PAN is rejected).
 * Format rules come from the domain value object, never re-implemented.
 */
export const taxDetailsSchema = z
  .object({
    gstNumber: z
      .string()
      .trim()
      .refine((value) => value.length > 0, "GST number is required.")
      .transform((value) => value.toUpperCase())
      .refine(isValidGstin, "Invalid GST number."),
    panNumber: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .optional(),
    registeredBusinessName: optionalTextSchema(MAX_TAX_FIELD_LENGTH),
  })
  .superRefine((value, ctx) => {
    const derivedPan = derivePanFromGstin(value.gstNumber);
    const submittedPan = value.panNumber ?? "";
    if (submittedPan !== "" && submittedPan !== derivedPan) {
      ctx.addIssue({
        code: "custom",
        path: ["panNumber"],
        message: "Invalid PAN number.",
      });
    }
  });

/** Steps persisted by the per-step save action (the final step completes instead). */
export const savableStepSchema = z.object({
  stepId: z.enum(["organization", "address", "tax"]),
});

/**
 * Final subscription payload; keys mirror the presentation field ids so
 * per-field failures map back to visible controls. Terms acceptance is
 * proven at the server boundary too.
 */
export const completionSchema = z.object({
  plan: z.enum(subscriptionPlans, "Select a plan to continue."),
  billingCycle: z.enum(billingCycles, "Select a billing cycle."),
  acceptTerms: z.literal(
    "true",
    "Accept the subscription terms to finish setup.",
  ),
});

export type OrganizationDetailsInput = z.infer<
  typeof organizationDetailsSchema
>;
export type AddressDetailsInput = z.infer<typeof addressDetailsSchema>;
export type TaxDetailsInput = z.infer<typeof taxDetailsSchema>;

const toFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(
    error.flatten().fieldErrors,
  )) {
    if (Array.isArray(messages)) {
      fieldErrors[key] = messages;
    }
  }
  return fieldErrors;
};

/**
 * Validates untrusted onboarding input at the server trust boundary,
 * throwing the feature's domain ValidationError with per-field messages
 * instead of leaking Zod internals. Presentation state is never trusted
 * as-is; every step passes through here before any write.
 */
export const parseOnboardingInput = <S extends z.ZodType>(
  schema: S,
  input: unknown,
): z.infer<S> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Please review the highlighted fields and try again.",
      toFieldErrors(parsed.error),
    );
  }
  return parsed.data;
};
