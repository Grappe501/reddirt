import { KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffJoinPage() {
  return (
    <SlideFrame eyebrow="The commitment moment" title="Where Will You Help Build This Campaign?" speaker="Kelly">
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Choose one path now. You can always expand later—what matters tonight is stepping forward.
      </p>

      <div className="rounded-[var(--radius-premium)] border border-[var(--kelly-official-gold)]/40 bg-[var(--kelly-mist)]/70 p-5 sm:p-6">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-navy)]">
          Immediate ask · September 17
        </p>
        <p className="mt-2 text-lg font-semibold text-[var(--kelly-official-navy)]">
          Grassroots & Guitar Strings planning team
        </p>
        <p className="mt-1 text-[var(--color-secondary)]">
          GOTV kickoff with David Adam Byrnes — help plan and fill 500 seats.
        </p>
        <div className="mt-4">
          <KickoffCtaLink href={`${KICKOFF_BASE}/join/campaign?team=grassroots_guitar_strings`}>
            Join Rally Planning Team
          </KickoffCtaLink>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[var(--radius-premium-lg)] border border-[var(--color-border-subtle)] bg-white p-6 shadow-[var(--shadow-premium)] sm:p-8">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
            In my community
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--kelly-official-navy)] sm:text-3xl">
            Local Involvement
          </h2>
          <p className="mt-3 text-[var(--color-secondary)]">
            Help organize your county, city, campus, or local area.
          </p>
          <div className="mt-6">
            <KickoffCtaLink href={`${KICKOFF_BASE}/join/local`}>Join My Local Team</KickoffCtaLink>
          </div>
        </div>

        <div className="rounded-[var(--radius-premium-lg)] border border-[var(--color-border-subtle)] bg-white p-6 shadow-[var(--shadow-premium)] sm:p-8">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
            Across the campaign
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--kelly-official-navy)] sm:text-3xl">
            Campaign Involvement
          </h2>
          <p className="mt-3 text-[var(--color-secondary)]">
            Statewide operations, outreach, social, logistics, fundraising, technology, Strike Teams, or
            GOTV.
          </p>
          <div className="mt-6">
            <KickoffCtaLink href={`${KICKOFF_BASE}/join/campaign`}>Join a Campaign Team</KickoffCtaLink>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-premium)] border border-dashed border-[var(--kelly-official-navy)]/25 bg-[var(--kelly-mist)]/60 p-6">
        <h2 className="font-heading text-xl font-bold text-[var(--kelly-official-navy)]">Help Me Decide</h2>
        <p className="mt-2 text-[var(--color-secondary)]">
          Tell us what you enjoy and how much time you have. We’ll help match you to a role.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <KickoffCtaLink href={`${KICKOFF_BASE}/join/match`} variant="secondary">
            Help Me Find My Place
          </KickoffCtaLink>
          <KickoffCtaLink href={`${KICKOFF_BASE}/join/youth`} variant="outline">
            Youth Coalition (16–24)
          </KickoffCtaLink>
        </div>
      </div>

      <div className="rounded-[var(--radius-premium)] bg-[var(--kelly-official-navy)] p-6 text-[var(--text-on-navy)] sm:p-8">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
          Closing challenge
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed sm:text-xl">
          Nine months ago this campaign started with a belief that Arkansas deserves leaders who listen
          more than they talk. Tonight we’re asking you to help write the next chapter. Every county
          matters. Every volunteer matters. Every conversation matters.
        </p>
        <ul className="mt-5 space-y-2 font-semibold text-[var(--kelly-official-gold)]">
          <li>1. Join one leadership team.</li>
          <li>2. Recruit one additional volunteer before next Monday.</li>
          <li>3. Stay engaged as we launch Operation Arkansas after Labor Day.</li>
        </ul>
      </div>
    </SlideFrame>
  );
}
