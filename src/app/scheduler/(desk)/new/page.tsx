import { NewEventForm } from "@/components/scheduler/NewEventForm";

export default async function SchedulerNewEventPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">New event</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
          Enter a stop from scratch. It stays a draft until you publish it to the public calendar.
        </p>
      </div>
      {sp.error === "required" ? (
        <p className="font-body text-sm text-red-700">Title and date are required.</p>
      ) : null}
      <NewEventForm />
    </section>
  );
}
