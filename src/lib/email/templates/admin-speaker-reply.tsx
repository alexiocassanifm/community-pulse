import { wrapEmailLayout } from "./layout";

interface AdminSpeakerReplyProps {
  speakerName: string;
  speakerEmail: string;
  talkTitle: string;
  content: string;
}

export function renderAdminSpeakerReply({
  speakerName,
  speakerEmail,
  talkTitle,
  content,
}: AdminSpeakerReplyProps): string {
  const emailContent = `
    <h1 style="font-size: 24px; margin-bottom: 16px;">New reply from speaker</h1>
    <p><strong>Speaker:</strong> ${speakerName} (${speakerEmail})</p>
    <p><strong>Talk:</strong> ${talkTitle}</p>
    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0;">${content}</p>
    </div>
    <p>Log in to the admin dashboard to reply.</p>
  `;
  return wrapEmailLayout(emailContent);
}
