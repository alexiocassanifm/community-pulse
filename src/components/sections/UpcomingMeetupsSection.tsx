import { Badge } from "@/components/ui/badge";
import { createServerClient } from "@/lib/supabase/server";

async function fetchMeetups() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("meetups")
    .select("*")
    .eq("status", "published")
    .eq("homepage_visible", true)
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });
  return data;
}

export async function UpcomingMeetupsSection() {
  let meetups: Awaited<ReturnType<typeof fetchMeetups>> = null;
  try {
    meetups = await fetchMeetups();
  } catch {
    return null;
  }

  if (!meetups?.length) return null;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Upcoming Meetups</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {meetups.map((meetup) => (
            <div key={meetup.id} className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{meetup.title}</h3>
              <p className="text-muted-foreground mt-2">
                {meetup.luma_url
                  ? new Date(meetup.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(meetup.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
              </p>
              <p className="text-muted-foreground">{meetup.location}</p>
              {meetup.luma_url ? (
                <a
                  href={meetup.luma_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:underline"
                >
                  View on Luma →
                </a>
              ) : (
                <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
