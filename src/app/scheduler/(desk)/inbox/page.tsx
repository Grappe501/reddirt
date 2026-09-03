import { OscarInboxForm } from "@/components/scheduler/OscarInboxForm";

export default function SchedulerInboxPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">OSCAR inbox</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
          Paste a host email or drop a flyer. OSCAR prefills the public card. You still open the editor and publish.
        </p>
      </div>
      <OscarInboxForm />
    </section>
  );
}
