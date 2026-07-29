import nodemailer from 'nodemailer';
import { env, isProd } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Email is a best-effort side channel — a delivery failure (bad recipient,
 * provider outage, sandbox restrictions, etc.) must never fail the primary
 * action (signup, password reset, invite) that triggered it, since that
 * action has typically already been persisted by the time this is called.
 * Failures are logged, not thrown.
 */
export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn(`SMTP not configured — skipping email to ${to} (subject: "${subject}")`);
    if (!isProd) logger.debug(html);
    return;
  }

  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    logger.error(`Failed to send email to ${to} (subject: "${subject}"): ${err instanceof Error ? err.message : err}`);
  }
}

export function verificationEmailTemplate(name: string, verifyUrl: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#4f46e5;">Verify your email</h2>
      <p>Hi ${name}, thanks for signing up for CollabNote.</p>
      <p><a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Verify Email</a></p>
      <p>This link expires in 1 hour. If you didn't create this account, you can ignore this email.</p>
    </div>`;
}

export function resetPasswordEmailTemplate(name: string, resetUrl: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#4f46e5;">Reset your password</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset Password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}

export function inviteEmailTemplate(inviterName: string, noteTitle: string, inviteUrl: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#4f46e5;">${inviterName} invited you to collaborate</h2>
      <p>You've been invited to collaborate on "<strong>${noteTitle}</strong>" in CollabNote.</p>
      <p><a href="${inviteUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Open Note</a></p>
    </div>`;
}
