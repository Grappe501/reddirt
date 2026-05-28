import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerMediaFootprintPage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <KimHammerBriefingPageShell moduleId="media-footprint">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <ul className="list-inside list-disc text-xs text-kelly-muted">
          {data.mediaFootprint.channels.map((channel) => (
            <li key={channel.url}>
              {channel.type}:{" "}
              <a className="text-kelly-navy underline" href={channel.url} target="_blank" rel="noreferrer">
                {channel.label}
              </a>{" "}
              ({channel.evidenceStatus}, {channel.sourceConfidence})
            </li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

