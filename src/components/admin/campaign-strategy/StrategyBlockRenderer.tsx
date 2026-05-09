import type { StrategyBlock } from "@/lib/campaign-strategy/types";

const calloutTone: Record<
  NonNullable<Extract<StrategyBlock, { kind: "callout" }>["tone"]>,
  string
> = {
  info: "border-kelly-sky/40 bg-kelly-mist/80 text-kelly-text",
  gold: "border-kelly-gold/50 bg-gradient-to-br from-kelly-copper-bright/25 to-kelly-fog text-kelly-text",
  navy: "border-kelly-blue/25 bg-kelly-deep text-white shadow-[var(--shadow-soft)]",
};

export function StrategyBlockRenderer({ blocks }: { blocks: StrategyBlock[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((b, i) => {
        const key = `${b.kind}-${i}`;
        switch (b.kind) {
          case "lead":
            return (
              <p
                key={key}
                className="font-body text-lg font-medium leading-relaxed text-kelly-slate md:text-xl"
              >
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={key}
                className="font-heading text-2xl font-bold tracking-tight text-kelly-deep md:text-[1.65rem]"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={key}
                className="font-heading text-lg font-semibold tracking-tight text-kelly-blue"
              >
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={key} className="font-body text-base leading-relaxed text-kelly-text/90">
                {b.text}
              </p>
            );
          case "ul":
            return (
              <ul
                key={key}
                className="list-disc space-y-2 pl-6 font-body text-base leading-relaxed text-kelly-text/90"
              >
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={key}
                className="list-decimal space-y-2 pl-6 font-body text-base leading-relaxed text-kelly-text/90"
              >
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <figure key={key} className="overflow-x-auto">
                {b.caption ? (
                  <figcaption className="mb-3 font-body text-xs font-semibold uppercase tracking-wider text-kelly-slate">
                    {b.caption}
                  </figcaption>
                ) : null}
                <table className="w-full min-w-[520px] border-collapse overflow-hidden rounded-xl border border-kelly-text/10 text-left text-sm shadow-sm">
                  <thead>
                    <tr className="bg-kelly-deep text-white">
                      {b.headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className={ri % 2 === 0 ? "bg-white" : "bg-kelly-fog/60"}
                      >
                        {row.map((cell, ci) => (
                          <td key={ci} className="border-t border-kelly-text/10 px-4 py-2.5 font-body text-kelly-text/90">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            );
          case "callout": {
            const toneClass = calloutTone[b.tone];
            return (
              <aside
                key={key}
                className={`rounded-xl border px-5 py-4 ${toneClass}`}
              >
                <p className="font-heading text-xs font-bold uppercase tracking-wider opacity-90">{b.title}</p>
                <p className="mt-2 font-body text-sm leading-relaxed opacity-95">{b.body}</p>
              </aside>
            );
          }
          case "cards":
            return (
              <div
                key={key}
                className="grid gap-4 sm:grid-cols-2"
              >
                {b.items.map((card) => (
                  <div
                    key={card.title}
                    className="group rounded-xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/40 hover:shadow-md"
                  >
                    <p className="font-heading text-lg font-bold text-kelly-deep">{card.title}</p>
                    <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{card.description}</p>
                    {card.path ? (
                      <a
                        href={`/admin/campaign-strategy/${card.path}`}
                        className="mt-4 inline-flex items-center font-body text-sm font-semibold text-kelly-blue underline-offset-4 hover:text-kelly-gold hover:underline"
                      >
                        Open section →
                      </a>
                    ) : card.href ? (
                      <a
                        href={card.href}
                        className="mt-4 inline-flex items-center font-body text-sm font-semibold text-kelly-blue underline-offset-4 hover:underline"
                      >
                        Open →
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
