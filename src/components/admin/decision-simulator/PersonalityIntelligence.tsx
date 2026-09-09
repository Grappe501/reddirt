import { getCampaignPrioritySnapshot } from "@/lib/agents/decision-simulation/campaign-priorities";
import { getEvidenceProvenanceSnapshot } from "@/lib/agents/decision-simulation/evidence-provenance";
import { getMediaResearchSnapshot } from "@/lib/agents/decision-simulation/media-research";
import type { CatalogPersonality } from "@/lib/agents/decision-simulation/personality-catalog";
import { getHillLegislativeDashboard } from "@/lib/agents/decision-simulation/vote-intelligence/dashboard";
import {
  buildActorWritingIntelligence,
  customActorHasSources,
} from "@/lib/agents/decision-simulation/writing-intelligence/catalog";
import type { ActorWritingIntelligence, ComparisonAxis } from "@/lib/agents/decision-simulation/writing-intelligence/contracts";

function pct(rate: number | null | undefined) {
  return typeof rate === "number" ? `${Math.round(rate * 100)}%` : "unknown";
}

function bar(score: number) {
  const width = Math.max(4, Math.round(Math.min(1, Math.max(0, score)) * 100));
  return (
    <span className="ml-meter" aria-hidden="true">
      <i style={{ width: `${width}%` }} />
    </span>
  );
}

function AxisList({ axes }: { axes: ComparisonAxis[] }) {
  return (
    <div className="ml-list">
      {axes.map((axis) => (
        <div key={axis.id}>
          <span>{axis.label}</span>
          <span>{bar(axis.score)} {(axis.score * 100).toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

function IntelCard({ intel }: { intel: ActorWritingIntelligence }) {
  const newest = intel.newestSourceDate ?? "unknown";
  const oldest = intel.oldestSourceDate ?? "unknown";
  return (
    <div className="ml-actor">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <b>{intel.actorId}</b>
        <span className="ml-badge research">{intel.documentCount} sources</span>
      </div>
      <p>Range {oldest} → {newest}. Authorship: direct {intel.authorship.DIRECT_AUTHOR} · office {intel.authorship.OFFICIAL_OFFICE} · attributed {intel.authorship.ATTRIBUTED}.</p>
      <p>Themes: {intel.topThemes.join(" · ") || "none"}</p>
      <p>Evidence traits: OBSERVED {intel.evidenceCounts.OBSERVED} · INFERRED {intel.evidenceCounts.INFERRED} · HYPOTHESIS {intel.evidenceCounts.HYPOTHESIS}</p>
      <AxisList axes={intel.comparison} />
      <p>{intel.comparison[0]?.methodology}</p>
      <ul className="ml-sources">
        {intel.decisionTendencies.map((trait) => (
          <li key={trait.label}><b>{trait.label} [{trait.sourceState}]</b> — {trait.value}</li>
        ))}
      </ul>
      <p>Issue voices: {intel.issueVoices.map((voice) => `${voice.id} ${(voice.share * 100).toFixed(0)}%`).join(" · ")}</p>
      <ul className="ml-sources">
        {intel.sources.slice(0, 8).map((source) => (
          <li key={source.id}>
            <a href={source.canonicalUrl} target="_blank" rel="noreferrer">{source.title}</a> · {source.publishedAt} · {source.sourceType}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PersonalityIntelligence({
  operator,
  counterparty,
}: {
  operator: CatalogPersonality;
  counterparty: CatalogPersonality;
}) {
  const researched = [operator, counterparty].filter((item) => item.id === "chris-jones-ar02" || item.id === "french-hill-ar02");
  const customMissing = [operator, counterparty].filter((item) => item.custom && !customActorHasSources(item.sources.length));
  return (
    <div>
      <h2 className="ml-h" style={{ marginTop: 22 }}>Personality intelligence</h2>
      <p className="ml-copy">First-party writing and campaign pages stay separate from media discovery clips. Scores are corpus detector rates. Generated language is never a quote.</p>
      {customMissing.map((item) => (
        <div key={item.id} className="ml-warn">Custom model {item.name} remains HYPOTHESIS until sources are attached.</div>
      ))}
      {researched.map((item) => (
        <div key={item.id}>
          <CampaignPriorities actorId={item.id} />
          <MediaResearch actorId={item.id} />
          <EvidenceProvenance actorId={item.id} />
          <IntelCard intel={buildActorWritingIntelligence(item.id as "chris-jones-ar02" | "french-hill-ar02")} />
        </div>
      ))}
      {counterparty.id === "french-hill-ar02" || operator.id === "french-hill-ar02" ? <LegislativeRecord /> : null}
    </div>
  );
}

function CampaignPriorities({ actorId }: { actorId: string }) {
  const snap = getCampaignPrioritySnapshot(actorId);
  if (!snap) return null;
  return (
    <div className="ml-actor">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <b>Immediate campaign priorities</b>
        <span className="ml-badge research">{snap.authorshipConfidence}</span>
      </div>
      <p>
        First-party living pages accessed {snap.accessed}. Slogan: {snap.slogan}. Not a poll and not a send list.
      </p>
      <ul className="ml-sources">
        {snap.priorities.map((priority) => (
          <li key={priority.id}>
            <b>{priority.label} [{priority.sourceState}]</b> — {priority.summary}{" "}
            <a href={priority.sourceUrl} target="_blank" rel="noreferrer">{priority.sourceTitle}</a>
          </li>
        ))}
      </ul>
      <ul className="ml-sources">
        {snap.uncertainty.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function MediaResearch({ actorId }: { actorId: string }) {
  const snap = getMediaResearchSnapshot(actorId);
  if (!snap) return null;
  return (
    <div className="ml-actor">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <b>Historic media research</b>
        <span className="ml-badge research">{snap.clipCount} clips</span>
      </div>
      <p>
        DISCOVERY_ONLY. Named outlets, short excerpts, accessed {snap.accessed}. Not a complete archive. Generated language is never one of these quotes.
      </p>
      <p>Topics: {snap.topics.join(" · ")}</p>
      <ul className="ml-sources">
        {snap.clips.map((item) => (
          <li key={item.id}>
            <b>{item.outlet} [{item.quoteKind}]</b> — “{item.quote}”{" "}
            <a href={item.url} target="_blank" rel="noreferrer">{item.publishedAt}</a>
            {item.notes ? ` ${item.notes}` : ""}
          </li>
        ))}
      </ul>
      <ul className="ml-sources">
        {snap.missing.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function EvidenceProvenance({ actorId }: { actorId: string }) {
  const snap = getEvidenceProvenanceSnapshot(actorId);
  if (!snap) return null;
  return (
    <div className="ml-actor">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <b>Evidence provenance</b>
        <span className="ml-badge research">{snap.claimCount} claims</span>
      </div>
      <p>
        Every stance claim keeps FIRST_PARTY, DISCOVERY_ONLY, OPERATOR_ATTACHED, or MISSING. Missing stays missing. Generated language is never a claim.
      </p>
      <ul className="ml-sources">
        {snap.claims.slice(0, 16).map((item) => (
          <li key={item.id}>
            <b>{item.provenance} [{item.sourceState}]</b> — {item.claim}{" "}
            {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceLabel}</a> : item.sourceLabel}
          </li>
        ))}
      </ul>
      {snap.claimCount > 16 ? <p>{snap.claimCount - 16} additional sourced claims are stored, not expanded here.</p> : null}
      <ul className="ml-sources">
        {snap.missing.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function LegislativeRecord() {
  const row = getHillLegislativeDashboard("french-hill-ar02");
  if (!row) return null;
  return (
    <div className="ml-actor" style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <b>French Hill legislative record</b>
        <span className="ml-badge">{row.voteCount} votes analyzed</span>
      </div>
      <p>Independent of writing style. Counts are roll-call facts, not psychological labels.</p>
      <p>Coverage: {row.dateRange.start ?? "unknown"} → {row.dateRange.end ?? "unknown"}. {row.coverageEstimate}</p>
      <div className="ml-list">
        <div><span>Party alignment</span><span>{pct(row.partyAlignment.rate)} (n={row.partyAlignment.denominator})</span></div>
        <div><span>Party departures</span><span>{row.partyDefection.numerator} votes</span></div>
        <div><span>Documented administration alignment</span><span>{pct(row.documentedAdminAlignment.rate)} (n={row.documentedAdminAlignment.denominator})</span></div>
        <div><span>Documented administration departures</span><span>{row.documentedAdminDefection.numerator} votes</span></div>
        <div><span>Bipartisan majority share</span><span>{pct(row.bipartisanRate.rate)}</span></div>
      </div>
      <p>Top policy areas: {row.topIssues.length ? row.topIssues.join(" · ") : "none loaded"}</p>
      <p>Recent outliers: {row.recentOutliers.length ? row.recentOutliers.join(" · ") : "none loaded"}</p>
      {row.sampleVoteRefs.length > 0 && (
        <ul className="ml-sources">
          {row.sampleVoteRefs.map((ref) => <li key={ref}>{ref}</li>)}
        </ul>
      )}
      <p>{row.uncertainty[0]}</p>
      <p>Administration alignment requires an explicit source position. A Republican majority is not treated as a Trump position.</p>
    </div>
  );
}
