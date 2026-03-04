import { siteConfig } from "@/config/site";

/**
 * Wraps email content in the standard HTML layout with styling and footer
 *
 * @param content - The HTML content to wrap
 * @returns Complete HTML document string
 */
export function wrapEmailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">${siteConfig.communityName}</p>
    </body>
    </html>
  `;
}
