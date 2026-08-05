import { Button } from "@/components/ui/Button";

export function VisitInviteCta() {
  return (
    <section
      aria-labelledby="arkansas-visits-invite"
      className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.06] p-8 md:p-10"
    >
      <h2 id="arkansas-visits-invite" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
        Invite Kelly to your community
      </h2>
      <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">
        Follow the trail across Arkansas, invite Kelly to listen in your county, or join the campaign so more
        communities are part of this work.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Button href="/get-involved" variant="outline">
          Join the campaign
        </Button>
        <Button href="/events" variant="ghost">
          Campaign calendar
        </Button>
      </div>
    </section>
  );
}
