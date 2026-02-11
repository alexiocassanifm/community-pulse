import { resend } from "./resend";

const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendSpeakerEmail({ to, subject, html }: SendEmailOptions) {
  const client = resend.getClient();
  if (!client) {
    console.warn(`[Email skipped] To: ${to}, Subject: ${subject}`);
    return null;
  }

  const { data, error } = await client.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
