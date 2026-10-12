import { afterEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { sendOtpEmail } from "./resend-email";

const stubResendEnv = () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/aventra_billing");
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
  vi.stubEnv(
    "BETTER_AUTH_SECRET",
    "a-very-long-test-secret-value-1234567890",
  );
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("AUTH_EMAIL_FROM", "Aventra <auth@example.com>");
};

describe("sendOtpEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    sendMock.mockReset();
  });

  it("invokes Resend with the recipient, subject, and rendered code", async () => {
    stubResendEnv();
    sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null });

    await sendOtpEmail({ to: "owner@acme.test", otp: "123456" });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0]?.[0]).toMatchObject({
      to: "owner@acme.test",
      subject: "Your Aventra verification code",
    });
    const payload = sendMock.mock.calls[0]?.[0];
    if (
      typeof payload === "object" &&
      payload !== null &&
      "html" in payload &&
      typeof payload.html === "string"
    ) {
      for (const digit of ["1", "2", "3", "4", "5", "6"]) {
        expect(payload.html).toContain(`>${digit}<`);
      }
    } else {
      expect.unreachable("expected rendered html payload");
    }
  });

  it("throws a safe error without leaking the OTP on delivery failure", async () => {
    stubResendEnv();
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "internal resend detail" },
    });

    try {
      await sendOtpEmail({ to: "owner@acme.test", otp: "123456" });
      expect.unreachable("expected delivery to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toContain("Resend delivery failed");
        expect(error.message).not.toContain("123456");
        expect(error.message).not.toContain("internal resend detail");
      }
    }
  });
});
