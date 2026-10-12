import { describe, expect, it } from "vitest";
import {
  buildOtpEmailHtml,
  buildOtpEmailText,
  OTP_EMAIL_SUBJECT,
} from "./otp-email-template";

describe("otp email template", () => {
  it("renders every digit with emphasis and no sensitive data", () => {
    const html = buildOtpEmailHtml({ otp: "123456" });
    for (const digit of ["1", "2", "3", "4", "5", "6"]) {
      expect(html).toContain(`>${digit}<`);
    }
    expect(html).toContain("Verify your email");
    expect(html).not.toContain("password");
    expect(OTP_EMAIL_SUBJECT).toBe("Your Aventra verification code");
  });

  it("provides a plain-text fallback with the code", () => {
    const text = buildOtpEmailText({ otp: "123456" });
    expect(text).toContain("123456");
    expect(text).toContain("Verify your email");
  });
});
