"use server";

import { auth } from "../../infrastructure/auth/auth";
import {
  EmailAlreadyInUseError,
  OrganizationCreationError,
} from "../../domain/errors/auth-errors";
import {
  MAX_SLUG_ATTEMPTS,
  createOrganizationSlug,
  withOrganizationSlugSuffix,
} from "../../domain/value-objects/organization-slug";
import { getPrisma } from "@/shared/lib/prisma";
import {
  findMemberRole,
  findUserIdByEmail,
  isOrganizationSlugTaken,
} from "../queries/auth-lookups";
import type { RegistrationResult } from "../dto/auth-dto";
import {
  createOrganizationSchema,
  parseAuthInput,
  withNormalizedEmail,
} from "../validators/auth-schemas";
import { runAuthAction } from "./auth-action";

const resolveAvailableSlug = async (
  organizationName: string,
): Promise<string> => {
  const base = createOrganizationSlug(organizationName);
  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = withOrganizationSlugSuffix(base, attempt);
    if (!(await isOrganizationSlugTaken(candidate))) {
      return candidate;
    }
  }
  throw new OrganizationCreationError();
};

const removeOrphanedUser = async (userId: string): Promise<void> => {
  try {
    await getPrisma().user.delete({ where: { id: userId } });
  } catch {
    // Best-effort compensation only; the original failure stays authoritative.
  }
};

/**
 * Registers an organization owner account end to end: validates input,
 * reserves a collision-free slug, creates the Better Auth user, creates
 * the organization for that user, asserts owner membership, and triggers
 * the verification OTP. Partial failure compensates (orphaned users are
 * removed) and OTP delivery problems are reported without failing the
 * registration, since the OTP screen offers resend.
 */
export const registerOrganization = async (rawInput: unknown) =>
  runAuthAction(async (): Promise<RegistrationResult> => {
    const input = parseAuthInput(
      createOrganizationSchema,
      withNormalizedEmail(rawInput, "organizationEmail"),
    );

    const existingUserId = await findUserIdByEmail(input.organizationEmail);
    if (existingUserId !== null) {
      throw new EmailAlreadyInUseError();
    }

    const slug = await resolveAvailableSlug(input.organizationName);

    await auth.api.signUpEmail({
      body: {
        name: input.adminName,
        email: input.organizationEmail,
        password: input.password,
      },
    });

    // The signup response may be synthetic for duplicate emails
    // (enumeration protection), so prove the account really exists.
    const userId = await findUserIdByEmail(input.organizationEmail);
    if (userId === null) {
      throw new EmailAlreadyInUseError();
    }

    let organizationId: string;
    try {
      const organization = await auth.api.createOrganization({
        body: {
          name: input.organizationName,
          slug,
          userId,
        },
      });
      organizationId = organization.id;
    } catch (error) {
      await removeOrphanedUser(userId);
      throw new OrganizationCreationError(error);
    }

    const memberRole = await findMemberRole(organizationId, userId);
    if (memberRole !== "owner") {
      throw new OrganizationCreationError();
    }

    let otpDelivery: RegistrationResult["otpDelivery"] = "sent";
    try {
      await auth.api.sendVerificationOTP({
        body: {
          email: input.organizationEmail,
          type: "email-verification",
        },
      });
    } catch {
      otpDelivery = "failed";
    }

    return {
      organizationEmail: input.organizationEmail,
      organizationName: input.organizationName,
      slug,
      otpDelivery,
    };
  });
