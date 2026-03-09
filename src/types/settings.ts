export interface SiteSettingRow {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface CommunityLinkValue {
  enabled: boolean;
  platform: "telegram" | "whatsapp";
  url: string;
  label: string;
}
