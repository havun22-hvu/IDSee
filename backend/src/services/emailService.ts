import nodemailer from 'nodemailer';

/**
 * Email abstraction, same demo/real pattern as payments. Without EMAIL_PROVIDER
 * messages are logged to the console (demo); set EMAIL_PROVIDER=smtp + SMTP_*
 * to send real mail.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailProvider {
  readonly name: string;
  send(msg: EmailMessage): Promise<void>;
}

class DemoEmailProvider implements EmailProvider {
  readonly name = 'demo';
  async send(msg: EmailMessage): Promise<void> {
    console.log(`📧 [demo email] → ${msg.to} | ${msg.subject}\n${msg.text}`);
  }
}

class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  async send(msg: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'IDSee <noreply@idsee.app>',
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
    });
  }
}

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (provider) return provider;
  provider = process.env.EMAIL_PROVIDER === 'smtp' ? new SmtpEmailProvider() : new DemoEmailProvider();
  return provider;
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  await getEmailProvider().send(msg);
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  await sendEmail({
    to,
    subject: 'Verifieer je IDSee e-mailadres',
    text:
      `Welkom bij IDSee.\n\n` +
      `Verifieer je e-mailadres via:\n${base}/verify-email?token=${token}\n\n` +
      `Of voer deze token in: ${token}`,
  });
}
