import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnv } from "./env";

const validEnv = {
  DATABASE_URL: "postgresql://localhost:5432/aventra_billing",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "a-very-long-test-secret-value-1234567890",
  RESEND_API_KEY: "re_test_key",
  AUTH_EMAIL_FROM: "Aventra <auth@example.com>",
};

describe("getEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns parsed configuration for valid input", () => {
    vi.stubEnv("DATABASE_URL", validEnv.DATABASE_URL);
    vi.stubEnv("BETTER_AUTH_URL", validEnv.BETTER_AUTH_URL);
    vi.stubEnv("BETTER_AUTH_SECRET", validEnv.BETTER_AUTH_SECRET);
    vi.stubEnv("RESEND_API_KEY", validEnv.RESEND_API_KEY);
    vi.stubEnv("AUTH_EMAIL_FROM", validEnv.AUTH_EMAIL_FROM);
    expect(getEnv()).toEqual(validEnv);
  });

  it("rejects missing and weak values naming only the keys", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("BETTER_AUTH_URL", "not-a-url");
    vi.stubEnv("BETTER_AUTH_SECRET", "too-short");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("AUTH_EMAIL_FROM", "");
    try {
      getEnv();
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toContain("DATABASE_URL");
        expect(error.message).toContain("BETTER_AUTH_SECRET");
        expect(error.message).not.toContain("too-short");
      }
    }
  });

  it("rejects non-PostgreSQL database URLs", () => {
    vi.stubEnv("DATABASE_URL", "mysql://localhost:3306/app");
    vi.stubEnv("BETTER_AUTH_URL", validEnv.BETTER_AUTH_URL);
    vi.stubEnv("BETTER_AUTH_SECRET", validEnv.BETTER_AUTH_SECRET);
    vi.stubEnv("RESEND_API_KEY", validEnv.RESEND_API_KEY);
    vi.stubEnv("AUTH_EMAIL_FROM", validEnv.AUTH_EMAIL_FROM);
    expect(() => getEnv()).toThrowError(/DATABASE_URL/);
  });
});
