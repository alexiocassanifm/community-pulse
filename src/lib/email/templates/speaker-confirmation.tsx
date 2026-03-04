import { wrapEmailLayout } from "./layout";

interface SpeakerConfirmationProps {
  name: string;
  talkTitle: string;
  portalUrl: string;
}

export function renderSpeakerConfirmation({
  name,
  talkTitle,
  portalUrl,
}: SpeakerConfirmationProps): string {
  const content = `
    <h1 style="font-size: 24px; margin-bottom: 16px;">We received your proposal!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for submitting your talk proposal: <strong>${talkTitle}</strong></p>
    <p>Our team will review your submission and get back to you soon. You can check your submission status and communicate with us anytime using the link below:</p>
    <p style="margin: 24px 0;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Your Submission</a>
    </p>
    <p style="font-size: 14px; color: #666;">Keep this link safe — it's your personal access to manage your submission. Do not share it with others.</p>
  `;
  return wrapEmailLayout(content);
}
