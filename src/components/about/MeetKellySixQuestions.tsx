import Link from "next/link";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";
import { MEET_KELLY_QUESTIONS } from "@/content/about/meet-kelly-hub";

export function MeetKellySixQuestions() {
  return (
    <section aria-labelledby="meet-kelly-six-questions" className="scroll-mt-24">
      <h2
        id="meet-kelly-six-questions"
        className="font-heading text-2xl font-bold text-kelly-text md:text-3xl"
      >
        Six questions voters ask
      </h2>
      <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/78">
        Summaries on the overview — full essays on each campaign chapter. Journey and community pages collect related
        arcs; open a chapter for the complete read.
      </p>
      <ol className="mt-10 grid gap-6 md:grid-cols-2">
        {MEET_KELLY_QUESTIONS.map((q, index) => (
          <li
            key={q.id}
            className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
          >
            <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-muted">
              {index + 1}
            </p>
            <h3 className="mt-2 font-heading text-xl font-bold text-kelly-text">{q.title}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/82">{q.summary}</p>
            {q.approvalGate === "office" ? (
              <div className="mt-4">
                <ContentPendingBadge variant="pending" />
              </div>
            ) : null}
            <Link
              href={q.href}
              className="mt-4 inline-block font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
            >
              {q.hrefLabel} →
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
