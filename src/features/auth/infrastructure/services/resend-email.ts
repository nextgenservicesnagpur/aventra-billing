import "server-only";

import { Resend } from "resend";
import { getEnv } from "../config/env";
import {
  buildOtpEmailHtml,
  buildOtpEmailText,
  OTP_EMAIL_SUBJECT,
} from "./otp-email-template";

export type SendOtpEmailInput = {
  to: string;
  otp: string;
};

/**
 * Dedicated Resend email service. The only module allowed to import the
 * Resend SDK. Never logs the OTP or recipient beyond the send call itself,
 * and never exposes the API key outside server runtime.
 */
export const sendOtpEmail = async ({
  to,
  otp,
}: SendOtpEmailInput): Promise<void> => {
  const resend = new Resend(getEnv().RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: getEnv().AUTH_EMAIL_FROM,
    to,
    subject: OTP_EMAIL_SUBJECT,
    html: buildOtpEmailHtml({ otp }),
    text: buildOtpEmailText({ otp }),
  });
  if (error) {
    throw new Error(`Resend delivery failed: ${error.name}`);
  }
};
