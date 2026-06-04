"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DebateFilmRoomPagePacket } from "@/lib/intelligence/v4/debateFilmRoomPageTypes";
import { groupFilmRoomItems } from "@/lib/intelligence/v4/debateFilmRoomGrouping";
import { isYoutubeUrl } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";

type TabId = "overview" | "media" | "clips" | "legislative" | "cross" | "arguments";

const tabBtn = (active: boolean) =>
  `min-h-[48px] rounded-lg px-3 py-2 text-xs font-bold transition ${
    active ? "bg-kelly-navy text-white" : "border border-kelly-text/15 bg-white text-kelly-navy"
  }`;

export function DebateFilmRoomClient({ packet }: { packet: DebateFilmRoomPagePacket }) {
  const [tab, setTab] = useState<TabId>("overview");
  const groups = useMemo(() => groupFilmRoomItems(packet.filmRoom.items), [packet.filmRoom.items]);

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {(
          [
            ["overview", "Overview"],
            ["media", `Media drills (${packet.mediaDrills.length})`],
            ["clips", `All clips (${packet.filmRoom.items.length})`],
            ["legislative", `Committee (${groups.legislative.length})`],
            ["cross", `Cross-exam (${packet.crossExamBank.length})`],
            ["arguments", `Arguments (${packet.argumentLibrary.length})`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={tabBtn(tab === id)} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? <OverviewTab packet={packet} groups={groups} /> : null}
      {tab === "media" ? <MediaDrillsTab drills={packet.mediaDrills} videoArchiveHref={packet.videoArchiveHref} /> : null}
      {tab === "clips" ? <ClipsTab groups={groups} /> : null}
      {tab === "legislative" ? <ClipsTab groups={{ legislative: groups.legislative, direct: [], reference: [], transcripts: [], quotes: [], drills: [] }} /> : null}
      {tab === "cross" ? <CrossExamTab rows={packet.crossExamBank} /> : null}
      {tab === "arguments" ? <ArgumentTab rows={packet.argumentLibrary} /> : null}
    </div>
  );
}

function OverviewTab({
  packet,
  groups,
}: {
  packet: DebateFilmRoomPagePacket;
  groups: ReturnType<typeof groupFilmRoomItems>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Direct / opponent media", packet.filmRoom.directClipCount],
          ["Reference SOS debates", packet.filmRoom.referenceClipCount],
          ["Legislative segments", packet.filmRoom.legislativeClipCount],
          ["Transcript excerpts", groups.transcripts.length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">{label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{value}</p>
          </div>
        ))}
      </div>

      <article className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-950">
        <p className="font-bold uppercase text-[10px]">Archive honesty</p>
        <p className="mt-2">{packet.filmRoom.archiveHonestyNote}</p>
        <p className="mt-2 text-xs">{packet.legislativeNote}</p>
      </article>

      <article className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 text-xs text-rose-950">
        <p className="font-bold uppercase">Coverage gaps — close before debate</p>
        <ul className="mt-2 list-inside list-disc">
          {packet.filmRoom.coverageGaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 text-xs">
        <p className="font-bold uppercase text-violet-950">Staff workflow (film night)</p>
        <ol className="mt-2 list-inside list-decimal text-kelly-muted">
          {packet.staffWorkflow.map((step) => (
            <li key={step.slice(0, 40)}>{step}</li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={packet.videoArchiveHref} className="font-bold text-kelly-navy underline">
            Video archive room (watch + register cuts) →
          </Link>
          <Link href="/admin/intelligence/sos-debate-questions" className="font-bold text-kelly-navy underline">
            Expected SOS questions →
          </Link>
          <Link href="/admin/intelligence/trap-lanes" className="font-bold text-kelly-navy underline">
            Trap lanes →
          </Link>
          <Link href="/admin/intelligence/claims" className="font-bold text-kelly-navy underline">
            Claims gate →
          </Link>
        </div>
      </article>

      {packet.filmRoom.topHammerCommitteeQuotes.length > 0 ? (
        <article className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <p className="font-bold uppercase text-kelly-navy">Committee quote candidates (verify speaker)</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {packet.filmRoom.topHammerCommitteeQuotes.map((q) => (
              <li key={q.slice(0, 48)}>{q}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {packet.todayPriorities.map((row) => (
          <div key={row.title} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <p className="font-bold uppercase text-kelly-subtle">{row.title}</p>
            <p className="mt-1 text-lg font-bold text-kelly-navy">{row.value}</p>
            <p className="mt-1 text-kelly-muted">{row.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaDrillsTab({
  drills,
  videoArchiveHref,
}: {
  drills: DebateFilmRoomPagePacket["mediaDrills"];
  videoArchiveHref: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-kelly-muted">
        Curated KATV, THV11, TBP, and campaign media with transcript excerpts, offensive/defensive use, and trap-lane links.
        Kelly does not read this on stage — staff rehearses pivots.
      </p>
      {drills.map((d) => (
        <article key={d.mediaId} className="rounded-xl border-2 border-kelly-gold/30 bg-white p-5 text-xs">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-heading text-base font-bold text-kelly-navy">{d.title}</p>
              <p className="mt-1 text-kelly-muted">
                {d.publisher} · {d.platform} · {d.researchValue} · {d.speakerVerification}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy"
              >
                {isYoutubeUrl(d.url) ? "Watch on YouTube" : "Open source"}
              </a>
              <Link
                href={videoArchiveHref}
                className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-bold text-amber-950"
              >
                Archive room
              </Link>
            </div>
          </div>
          <p className="mt-3 text-kelly-text">{d.summary}</p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-3">
              <p className="font-bold text-rose-950">Offensive (Kelly)</p>
              <p className="mt-1 text-kelly-muted">{d.offensiveUse}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
              <p className="font-bold text-emerald-950">Defensive (protect Kelly)</p>
              <p className="mt-1 text-kelly-muted">{d.defensiveUse}</p>
            </div>
          </div>

          <p className="mt-3 rounded-lg border border-violet-100 bg-violet-50/30 p-3">
            <span className="font-bold text-violet-950">30s Kelly pivot (rehearse):</span> {d.kellyPivot30s}
          </p>
          <p className="mt-2">
            <span className="font-bold text-kelly-navy">Drill:</span> {d.drillPrompt}
          </p>
          <p className="mt-2 text-amber-900">
            <span className="font-bold">Claims:</span> {d.claimsGate}
          </p>

          {d.keySegments.length > 0 ? (
            <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50/20 p-3">
              <p className="font-bold uppercase text-violet-950">Transcript excerpts</p>
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                {d.keySegments.map((seg, i) => (
                  <li key={`${seg.startTime}-${i}`} className="text-kelly-text">
                    <span className="font-mono text-[10px] text-kelly-subtle">
                      {seg.startTime}–{seg.endTime}
                    </span>{" "}
                    <span className="font-semibold text-violet-900">{seg.speakerLabel}:</span> {seg.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {d.trapLaneHref ? (
              <Link href={d.trapLaneHref} className="rounded-full bg-violet-100 px-3 py-1 font-bold text-violet-950">
                Trap lane drill-down →
              </Link>
            ) : null}
            {d.billDrillHrefs.map((href) => (
              <Link key={href} href={href} className="rounded-full border border-kelly-navy/20 px-3 py-1 font-bold text-kelly-navy">
                {href.split("/").pop()}
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ClipsTab({ groups }: { groups: ReturnType<typeof groupFilmRoomItems> }) {
  const sections: Array<{ key: string; title: string; items: typeof groups.direct }> = [
    { key: "direct", title: "Direct opponent & press", items: groups.direct },
    { key: "transcripts", title: "Transcript excerpts", items: groups.transcripts },
    { key: "reference", title: "Reference SOS debates", items: groups.reference },
    { key: "legislative", title: "Legislative committee", items: groups.legislative },
    { key: "quotes", title: "Quote records", items: groups.quotes },
    { key: "drills", title: "Theme drills", items: groups.drills },
  ];

  return (
    <div className="space-y-6">
      {sections.map(
        (sec) =>
          sec.items.length > 0 ? (
            <section key={sec.key}>
              <h3 className="text-sm font-bold uppercase text-kelly-navy">{sec.title}</h3>
              <div className="mt-3 space-y-3">
                {sec.items.map((item) => (
                  <FilmRoomItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null,
      )}
    </div>
  );
}

function FilmRoomItemCard({ item }: { item: DebateFilmRoomPagePacket["filmRoom"]["items"][0] }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-kelly-page/30 p-4 text-xs">
      <p className="font-bold text-kelly-navy">{item.title}</p>
      <p className="text-kelly-muted">
        {item.topic} · {item.confidence} · {item.governanceLabel} · {item.assetType}
      </p>
      {item.timestampRange ? (
        <p className="mt-1 font-mono text-[10px] text-violet-800">{item.timestampRange}</p>
      ) : null}
      <p className="mt-2">
        <span className="font-semibold">Angle:</span> {item.opponentClaimOrAngle}
      </p>
      <p className="mt-1">
        <span className="font-semibold text-rose-900">Vulnerability:</span> {item.vulnerability}
      </p>
      <p className="mt-1">
        <span className="font-semibold text-emerald-900">Counter:</span> {item.recommendedCounter}
      </p>
      <p className="mt-1">
        <span className="font-semibold">Drill:</span> {item.drillPrompt}
      </p>
      {item.url ? (
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold text-kelly-navy underline">
          Source (staff review)
        </a>
      ) : null}
      {item.legislativeChunkId ? (
        <Link
          href="/admin/intelligence/legislative-video"
          className="mt-2 ml-3 inline-block font-bold text-kelly-navy underline"
        >
          Legislative pipeline →
        </Link>
      ) : null}
    </article>
  );
}

function CrossExamTab({ rows }: { rows: DebateFilmRoomPagePacket["crossExamBank"] }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-kelly-muted">
        Draw out implementation gaps — calm tone. Kelly does not prosecute on stage; press may adapt these after debate.
      </p>
      {rows.map((row) => (
        <article key={row.id} className="rounded-lg border border-violet-100 bg-violet-50/30 p-4 text-xs">
          <p className="font-bold text-violet-950">{row.question}</p>
          {row.billAnchor ? (
            <Link
              href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(row.billAnchor)}`}
              className="mt-1 inline-block font-bold text-kelly-navy underline"
            >
              Bill: {row.billAnchor}
            </Link>
          ) : null}
          <ul className="mt-2 space-y-1 text-kelly-muted">
            <li>
              <strong>When:</strong> {row.whenToAsk}
            </li>
            <li>
              <strong>Learn:</strong> {row.whatYouLearn}
            </li>
            <li>
              <strong>Kelly pivot:</strong> {row.kellyPivot}
            </li>
            <li>
              <strong>Social:</strong> {row.socialPostAngle}
            </li>
          </ul>
          <span
            className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
              row.risk === "HIGH" ? "bg-rose-100 text-rose-900" : row.risk === "MEDIUM" ? "bg-amber-100" : "bg-emerald-100"
            }`}
          >
            {row.risk}
          </span>
        </article>
      ))}
    </div>
  );
}

function ArgumentTab({ rows }: { rows: DebateFilmRoomPagePacket["argumentLibrary"] }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <article key={row.id} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
          <p className="font-bold text-rose-950">He may say: {row.hammerLine}</p>
          <p className="mt-1 text-emerald-900">
            <strong>Agree:</strong> {row.agreeWhereValid}
          </p>
          <p className="mt-1">
            <strong>Contrast:</strong> {row.contrastPivot}
          </p>
          <p className="mt-1 text-violet-900">
            <strong>Bridge:</strong> {row.kellyBridge}
          </p>
          <p className="mt-1 text-kelly-muted">{row.debateStep}</p>
          {row.billDrillHref ? (
            <Link href={row.billDrillHref} className="mt-2 inline-block font-bold text-kelly-navy underline">
              Bill drill-down →
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
