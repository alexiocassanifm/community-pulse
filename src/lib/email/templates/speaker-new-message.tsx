import { wrapEmailLayout } from "./layout";

interface SpeakerNewMessageProps {
  name: string;
  talkTitle: string;
  portalUrl: string;
}

export function renderSpeakerNewMessage({
  name,
  talkTitle,
  portalUrl,
}: SpeakerNewMessageProps): string {
  const content = `
    <h1 style="font-size: 24px; margin-bottom: 16px;">New message about your proposal</h1>
    <p>Hi ${name},</p>
    <p>You have a new message regarding your talk proposal: <strong>${talkTitle}</strong></p>
    <p>Click below to read and reply:</p>
    <p style="margin: 24px 0;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Messages</a>
    </p>
  `;
  return wrapEmailLayout(content);
}
