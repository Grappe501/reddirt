import Link from "next/link";
import type { DebateDepthTopic } from "@/lib/intelligence/v4/debateEncounterDepthTypes";
import { V4EncounterDepthPanel } from "@/components/admin/intelligence/v4/V4EncounterDepthPanel";

export function V4DebateDepthTopicPanel({ topic }: { topic: DebateDepthTopic }) {
  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-indigo-200 bg-indigo-50/30 p-5 text-sm">
        <p className="text-[10px] font-bold uppercase text-indigo-950">~{topic.estimatedMinutes} min read · plain language</p>
        <p className="mt-2 text-kelly-muted">{topic.summary}</p>
      </article>
      <V4EncounterDepthPanel depth={topic.depth} />
      {topic.relatedLinks.length > 0 ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <p className="font-bold uppercase text-kelly-navy">Go deeper on the record</p>
          <ul className="mt-2 space-y-1">
            {topic.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-bold text-kelly-navy underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
