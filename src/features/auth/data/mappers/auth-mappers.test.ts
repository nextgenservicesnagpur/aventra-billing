import { describe, expect, it } from "vitest";
import { toSafeOrganization, toSafeUser } from "./auth-mappers";

describe("auth mappers", () => {
  it("projects users to the minimal safe shape", () => {
    const providerUser = {
      id: "user_1",
      name: "John Doe",
      email: "john@acme.test",
      emailVerified: true,
      password: "hashed-secret",
      token: "session-secret",
    };
    expect(toSafeUser(providerUser)).toEqual({
      id: "user_1",
      name: "John Doe",
      email: "john@acme.test",
      emailVerified: true,
    });
  });

  it("projects organizations with their membership role", () => {
    const providerOrganization = {
      id: "org_1",
      name: "Acme",
      slug: "acme",
      metadata: "{}",
    };
    expect(toSafeOrganization(providerOrganization, "owner")).toEqual({
      id: "org_1",
      name: "Acme",
      slug: "acme",
      role: "owner",
      onboardingStatus: "NOT_STARTED",
    });
  });
});
