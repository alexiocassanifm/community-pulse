import { createServerClient } from "@/lib/supabase/server";
import { CommunityLinkSettings } from "@/components/dashboard/settings/CommunityLinkSettings";
import type { CommunityLinkValue } from "@/types/settings";

const defaultCommunityLink: CommunityLinkValue = {
  enabled: false,
  platform: "telegram",
  url: "",
  label: "",
};

export default async function SettingsPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "community_link")
    .single();

  const communityLink: CommunityLinkValue =
    (data?.value as unknown as CommunityLinkValue) ?? defaultCommunityLink;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <CommunityLinkSettings initialValue={communityLink} />
    </div>
  );
}
