import Link from "next/link";
import type { MovementPhilosophyDocOverlay } from "@/lib/intelligence/v4/phase11P2MovementPhilosophyDepth";

export function MovementPhilosophyDocPanel({ overlay }: { overlay: MovementPhilosophyDocOverlay }) {
  return (
    <section className="mb-6 rounded-xl border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 to-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Phase 11 P2 overlay</p>
      <p className="mt-2 text-sm font-semibold text-kelly-navy">{overlay.movementRole}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Debate application</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.debateApplication.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Volunteer system</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.volunteerSystemImplications.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      {overlay.linkedPhilosophyBriefingIds.length > 0 ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Linked briefings:{" "}
          {overlay.linkedPhilosophyBriefingIds.map((id) => (
            <Link
              key={id}
              href={`/admin/intelligence/debate-briefings/${id}`}
              className="mr-2 font-semibold text-kelly-navy underline"
            >
              {id}
            </Link>
          ))}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {overlay.intelligenceLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-950"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
