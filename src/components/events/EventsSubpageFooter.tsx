import Link from "next/link";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";

/** Shared footer band for Events-area subpages (calendar, invite pathway, county strategy pages). */
export function EventsSubpageFooter() {
  return (
    <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/10">
      <ContentContainer className="max-w-3xl">
        <p className="text-center font-body text-sm font-semibold text-kelly-text/70">Campaign operations</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button href="/events" variant="outline" className="min-h-[48px] w-full min-w-[12rem] motion-reduce:transition-none sm:w-auto">
            Campaign Calendar
          </Button>
          <Button href="/events/request" variant="outline" className="min-h-[48px] w-full min-w-[12rem] motion-reduce:transition-none sm:w-auto">
            Invite Kelly
          </Button>
          <Button href="/from-the-road" variant="outline" className="min-h-[48px] w-full min-w-[12rem] motion-reduce:transition-none sm:w-auto">
            From the Road
          </Button>
        </div>
        <p className="mt-6 text-center font-body text-xs text-kelly-text/55">
          <Link
            href="/listening-sessions"
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
          >
            Listening sessions
          </Link>
        </p>
      </ContentContainer>
    </FullBleedSection>
  );
}
