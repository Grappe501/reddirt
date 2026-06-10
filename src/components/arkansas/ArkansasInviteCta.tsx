import { Button } from "@/components/ui/Button";
import { arkansasPresenceCopy } from "@/content/county/arkansas-presence";

export function ArkansasInviteCta() {
  const copy = arkansasPresenceCopy.invite;

  return (
    <section
      aria-labelledby="arkansas-invite"
      className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.06] p-8 md:p-10"
    >
      <h2 id="arkansas-invite" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">{copy.lead}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={copy.inviteHref} variant="primary">
          Invite Kelly
        </Button>
        <Button href={copy.scheduleHref} variant="outline">
          Request an event
        </Button>
      </div>
    </section>
  );
}
