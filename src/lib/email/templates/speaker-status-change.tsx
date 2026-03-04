import { wrapEmailLayout } from "./layout";

interface SpeakerStatusChangeProps {
  name: string;
  talkTitle: string;
  newStatus: "accepted" | "rejected";
  message?: string;
  meetup?: string;
  portalUrl: string;
}

export function renderSpeakerStatusChange({
  name,
  talkTitle,
  newStatus,
  message,
  meetup,
  portalUrl,
}: SpeakerStatusChangeProps): string {
  const statusText = newStatus === "accepted"
    ? "has been accepted"
    : "has not been selected";

  const statusColor = newStatus === "accepted" ? "#16a34a" : "#dc2626";

  const content = `
    <h1 style="font-size: 24px; margin-bottom: 16px;">Update on your proposal</h1>
    <p>Hi ${name},</p>
    <p>Your talk proposal <strong>${talkTitle}</strong> <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span>.</p>
    ${meetup ? `<div style="background-color: #e0f2fe; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0284c7;"><p style="margin: 0;"><strong>Assigned meetup:</strong> ${meetup}</p></div>` : ""}
    ${message ? `<div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0; font-style: italic;">${message}</p></div>` : ""}
    <p>You can view full details and reply on your portal:</p>
    <p style="margin: 24px 0;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Your Submission</a>
    </p>
  `;
  return wrapEmailLayout(content);
}
