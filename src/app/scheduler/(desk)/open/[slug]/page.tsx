import { redirect } from "next/navigation";
import { ensureSchedulerEventFromPublicSlug } from "@/lib/scheduler/ensure-from-public";
import { requireSchedulerPage } from "@/lib/scheduler/require-scheduler";

export const dynamic = "force-dynamic";

export default async function OpenPublicCalendarEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSchedulerPage();
  const slug = decodeURIComponent((await params).slug).trim();
  if (!slug) redirect("/scheduler");
  const id = await ensureSchedulerEventFromPublicSlug(slug);
  if (!id) redirect("/scheduler?error=missing");
  redirect(`/scheduler/events/${id}`);
}
