import { wrapEmailLayout } from "./layout";

interface AdminNewSubmissionProps {
  speakerName: string;
  speakerEmail: string;
  talkTitle: string;
  format: string;
  titleCompany?: string | null;
}

export function renderAdminNewSubmission({
  speakerName,
  speakerEmail,
  talkTitle,
  format,
  titleCompany,
}: AdminNewSubmissionProps): string {
  const content = `
    <h1 style="font-size: 24px; margin-bottom: 16px;">New speaker proposal</h1>
    <p>A new talk proposal has been submitted:</p>
    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 8px;"><strong>Speaker:</strong> ${speakerName}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${speakerEmail}</p>
      ${titleCompany ? `<p style="margin: 0 0 8px;"><strong>Role:</strong> ${titleCompany}</p>` : ""}
      <p style="margin: 0 0 8px;"><strong>Talk:</strong> ${talkTitle}</p>
      <p style="margin: 0;"><strong>Format:</strong> ${format}</p>
    </div>
    <p>Log in to the admin dashboard to review and manage this submission.</p>
  `;
  return wrapEmailLayout(content);
}
