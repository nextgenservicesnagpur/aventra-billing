export const OTP_EMAIL_SUBJECT = "Your Aventra verification code";

export type OtpEmailContent = {
  otp: string;
};

const APP_NAME = "Aventra";

/**
 * Aventra OTP email template. Email clients cannot use the Tailwind design
 * system, so this uses table-based layout with inline styles. The palette
 * intentionally mirrors the semantic tokens in src/app/globals.css
 * (background #0b0b0c, surface #111214, border #26272a, primary #8b5c3f,
 * primary-light #a67c58, foreground #f3f1ef, muted #a3a1a0). Contains no
 * passwords, identifiers, or sensitive metadata — only the code itself.
 */
export const buildOtpEmailHtml = ({ otp }: OtpEmailContent): string => {
  const digits = otp
    .split("")
    .map(
      (digit) =>
        `<td align="center" style="background-color:#1a1b1d;border:1px solid #26272a;border-radius:8px;color:#f8f5f1;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;padding:12px 0;width:44px;">${digit}</td>`,
    )
    .join('<td width="8"></td>');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0b0b0c;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0c;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#111214;border:1px solid #26272a;border-radius:12px;padding:32px;">
<tr><td align="center" style="color:#f8f5f1;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;letter-spacing:6px;">${APP_NAME}</td></tr>
<tr><td align="center" style="color:#f3f1ef;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;padding-top:24px;">Verify your email</td></tr>
<tr><td align="center" style="color:#a3a1a0;font-family:Arial,Helvetica,sans-serif;font-size:14px;padding-top:8px;">Use the verification code below to continue:</td></tr>
<tr><td align="center" style="padding-top:24px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${digits}</tr></table></td></tr>
<tr><td align="center" style="color:#a3a1a0;font-family:Arial,Helvetica,sans-serif;font-size:13px;padding-top:24px;">This code expires shortly.</td></tr>
<tr><td align="center" style="color:#a3a1a0;font-family:Arial,Helvetica,sans-serif;font-size:13px;padding-top:8px;">If you did not create this account, you can safely ignore this email.</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
};

export const buildOtpEmailText = ({ otp }: OtpEmailContent): string =>
  `${APP_NAME}\n\nVerify your email\n\nUse the verification code below to continue:\n\n${otp}\n\nThis code expires shortly.\n\nIf you did not create this account, you can safely ignore this email.`;
