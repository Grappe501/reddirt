"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { InstitutionalMemorySummary } from "@/lib/intelligence/institutionalMemory/types";
import {
  DECISION_CATEGORIES,
  LESSON_KIND_LABELS,
  type DecisionCategory,
  type DecisionResultStatus,
  type LessonKind,
  type RecommendationDisposition,
} from "@/lib/intelligence/institutionalMemory/types";
import { CONFIDENCE_DIRECTIONS, CONFIDENCE_DIRECTION_LABELS } from "@/lib/intelligence/institutionalMemory/recommendationConfidenceFramework";
import {
  createDecisionAction,
  createLessonAction,
  createRecommendationAction,
  saveWeeklyReflectionAction,
  syncRecommendationsFromQueueAction,
  updateRecommendationDispositionAction,
} from "./memory-actions";

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";
const RESULT_STATUSES: DecisionResultStatus[] = ["Success", "Mixed", "Failed", "Unknown"];
const DISPOSITIONS: RecommendationDisposition[] = ["Accepted", "Rejected", "Deferred", "Unknown"];

type Props = {
  summary: InstitutionalMemorySummary;
  operatorDefault: string;
};

export function CampaignMemoryDashboard({ summary, operatorDefault }: Props) {
  const [operator, setOperator] = useState(operatorDefault);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string; appended?: number }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setMessage("saved" in result || "appended" in result ? "Saved." : "Updated.");
        if ("appended" in result && result.appended !== undefined) {
          setMessage(`Synced ${result.appended} recommendation(s) from action queue.`);
        }
      } else {
        setMessage(result.error ?? "Something went wrong.");
      }
    });
  }

  const weekDefault = () => {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">NSI-17 · Campaign institutional memory</p>
        <p className="mt-1">
          INTERNAL · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED. No auto-send, auto-publish, ML, or autonomous execution.
          This journal remembers outcomes — it does not act on them.
        </p>
      </section>

      {message ? (
        <p className="rounded border border-kelly-text/15 bg-white px-3 py-2 text-xs text-kelly-muted">{message}</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Memory health</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.memoryHealthScore}%</p>
          <p className="mt-1 text-[10px] text-kelly-muted">{summary.memoryHealthDetail}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Decisions</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.decisionCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Recommendations</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.recommendationCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Lessons</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.lessonCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Reflections</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.reflectionCount}</p>
          <p className="mt-1 text-[10px] text-kelly-muted">
            {summary.weeklyReflectionStatus.lastWeekLabel
              ? `Last: ${summary.weeklyReflectionStatus.lastWeekLabel}`
              : "No weekly reflection yet"}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Operator</h2>
          <input
            className="rounded border px-2 py-1 text-xs"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            placeholder="Initials"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          className="mt-3 rounded border border-teal-700/40 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-900"
          onClick={() => run(() => syncRecommendationsFromQueueAction())}
        >
          Capture active recommendations from NSI-15 queue (human-triggered)
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Recent decisions</h2>
          <ul className="mt-2 space-y-2 text-xs text-kelly-muted">
            {summary.recentDecisions.length === 0 ? (
              <li>No decisions recorded yet.</li>
            ) : (
              summary.recentDecisions.map((d) => (
                <li key={d.decisionId} className="rounded border border-kelly-text/10 p-2">
                  <span className="font-bold text-kelly-navy">{d.title}</span> · {d.category} · {d.resultStatus}
                  <p className="mt-1">{d.summary.slice(0, 140)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Record a decision</h2>
          <DecisionForm
            disabled={pending}
            onSubmit={(data) =>
              run(() =>
                createDecisionAction({
                  operator,
                  ...data,
                }),
              )
            }
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Recent lessons & patterns</h2>
          <BulletList items={summary.emergingLessons} />
          <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Top patterns</h3>
          <BulletList items={summary.topPatterns} />
          <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Institutional knowledge</h3>
          <BulletList items={summary.institutionalKnowledge} />
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Add lesson / wisdom</h2>
          <LessonForm
            disabled={pending}
            onSubmit={(data) => run(() => createLessonAction({ operator, ...data }))}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Recommendation memory</h2>
          <ul className="mt-2 space-y-2 text-xs">
            {summary.recentRecommendations.length === 0 ? (
              <li className="text-kelly-muted">No recommendations captured. Sync from action queue or add manually.</li>
            ) : (
              summary.recentRecommendations.map((r) => (
                <li key={r.recommendationId} className="rounded border border-kelly-text/10 p-2">
                  <p className="font-bold text-kelly-navy">{r.recommendation}</p>
                  <p className="text-kelly-muted">
                    {r.sourceSystem} · {r.disposition} · {r.confidenceAdjustment}
                  </p>
                  <DispositionControls
                    recommendationId={r.recommendationId}
                    disabled={pending}
                    onUpdate={(disposition, notes) =>
                      run(() =>
                        updateRecommendationDispositionAction({
                          recommendationId: r.recommendationId,
                          operator,
                          disposition,
                          operatorNotes: notes,
                        }),
                      )
                    }
                  />
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Log recommendation manually</h2>
          <RecommendationForm
            disabled={pending}
            onSubmit={(data) => run(() => createRecommendationAction({ operator, ...data }))}
          />
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-indigo-300/60 bg-indigo-50/30 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">Weekly intelligence reflection</h2>
        <p className="mt-1 text-xs text-indigo-900">
          Human-triggered only. Does not email, publish, or run AI. Stored for future intelligence passes.
        </p>
        <p className="mt-2 text-[10px] text-indigo-800">
          Status:{" "}
          {summary.weeklyReflectionStatus.daysSinceLastReflection != null
            ? `${summary.weeklyReflectionStatus.daysSinceLastReflection} day(s) since last reflection`
            : "No reflection on file"}
        </p>
        <WeeklyReflectionForm
          disabled={pending}
          defaultWeek={weekDefault()}
          onSubmit={(data) => run(() => saveWeeklyReflectionAction({ operator, ...data }))}
        />
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Confidence framework V1 (rails)</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {CONFIDENCE_DIRECTIONS.map((d) => (
            <li key={d}>
              <span className="font-semibold text-kelly-navy">{d}</span> — {CONFIDENCE_DIRECTION_LABELS[d]}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-2 text-xs">
        <Link href="/admin/intelligence/command-center" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          Command center
        </Link>
        <Link href="/admin/intelligence/intelligence-memory" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          NSI-13 longitudinal memory
        </Link>
        <Link href="/admin/intelligence/action-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
          Action queue
        </Link>
      </section>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="mt-2 text-xs text-kelly-subtle">None yet.</p>;
  return (
    <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-kelly-muted">
      {items.map((item) => (
        <li key={item.slice(0, 60)}>{item}</li>
      ))}
    </ul>
  );
}

function DecisionForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (data: {
    title: string;
    decisionDate: string;
    category: DecisionCategory;
    summary: string;
    reasoning: string;
    expectedOutcome: string;
    actualOutcome: string;
    resultStatus: DecisionResultStatus;
    lessonLearned: string;
    notes: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DecisionCategory>("Other");
  const [summary, setSummary] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [actualOutcome, setActualOutcome] = useState("");
  const [resultStatus, setResultStatus] = useState<DecisionResultStatus>("Unknown");
  const [lessonLearned, setLessonLearned] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="mt-3 space-y-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          decisionDate: new Date().toISOString().slice(0, 10),
          category,
          summary,
          reasoning,
          expectedOutcome,
          actualOutcome,
          resultStatus,
          lessonLearned,
          notes,
        });
      }}
    >
      <input className="w-full rounded border px-2 py-1" placeholder="Decision title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <select className="w-full rounded border px-2 py-1" value={category} onChange={(e) => setCategory(e.target.value as DecisionCategory)}>
        {DECISION_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <textarea className="w-full rounded border px-2 py-1" placeholder="Summary" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
      <textarea className="w-full rounded border px-2 py-1" placeholder="Reasoning" rows={2} value={reasoning} onChange={(e) => setReasoning(e.target.value)} />
      <textarea className="w-full rounded border px-2 py-1" placeholder="Expected outcome" rows={2} value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} />
      <textarea className="w-full rounded border px-2 py-1" placeholder="Actual outcome" rows={2} value={actualOutcome} onChange={(e) => setActualOutcome(e.target.value)} />
      <select className="w-full rounded border px-2 py-1" value={resultStatus} onChange={(e) => setResultStatus(e.target.value as DecisionResultStatus)}>
        {RESULT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <textarea className="w-full rounded border px-2 py-1" placeholder="Lesson learned" rows={2} value={lessonLearned} onChange={(e) => setLessonLearned(e.target.value)} />
      <textarea className="w-full rounded border px-2 py-1" placeholder="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button type="submit" disabled={disabled} className="rounded bg-kelly-navy px-3 py-2 font-bold text-white">
        Save decision
      </button>
    </form>
  );
}

function LessonForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (data: { kind: LessonKind; title: string; body: string; tags: string }) => void;
}) {
  const [kind, setKind] = useState<LessonKind>("lesson");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  return (
    <form
      className="mt-3 space-y-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ kind, title, body, tags });
      }}
    >
      <select className="w-full rounded border px-2 py-1" value={kind} onChange={(e) => setKind(e.target.value as LessonKind)}>
        {(Object.keys(LESSON_KIND_LABELS) as LessonKind[]).map((k) => (
          <option key={k} value={k}>
            {LESSON_KIND_LABELS[k]}
          </option>
        ))}
      </select>
      <input className="w-full rounded border px-2 py-1" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea className="w-full rounded border px-2 py-1" placeholder="What would we tell ourselves six months ago?" rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
      <input className="w-full rounded border px-2 py-1" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <button type="submit" disabled={disabled} className="rounded bg-kelly-navy px-3 py-2 font-bold text-white">
        Save lesson
      </button>
    </form>
  );
}

function RecommendationForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (data: { recommendation: string; sourceSystem: string; priority: string }) => void;
}) {
  const [recommendation, setRecommendation] = useState("");
  const [sourceSystem, setSourceSystem] = useState("Manual");
  const [priority, setPriority] = useState("MEDIUM");

  return (
    <form
      className="mt-3 space-y-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ recommendation, sourceSystem, priority });
      }}
    >
      <textarea className="w-full rounded border px-2 py-1" placeholder="Recommendation" rows={2} value={recommendation} onChange={(e) => setRecommendation(e.target.value)} required />
      <input className="w-full rounded border px-2 py-1" placeholder="Source system" value={sourceSystem} onChange={(e) => setSourceSystem(e.target.value)} />
      <input className="w-full rounded border px-2 py-1" placeholder="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
      <button type="submit" disabled={disabled} className="rounded bg-kelly-navy px-3 py-2 font-bold text-white">
        Log recommendation
      </button>
    </form>
  );
}

function DispositionControls({
  recommendationId,
  disabled,
  onUpdate,
}: {
  recommendationId: string;
  disabled: boolean;
  onUpdate: (disposition: RecommendationDisposition, notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {DISPOSITIONS.map((d) => (
        <button
          key={`${recommendationId}-${d}`}
          type="button"
          disabled={disabled}
          className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase"
          onClick={() => onUpdate(d, notes)}
        >
          {d}
        </button>
      ))}
      <input className="ml-1 min-w-[8rem] flex-1 rounded border px-1 py-0.5 text-[10px]" placeholder="Operator notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </div>
  );
}

function WeeklyReflectionForm({
  disabled,
  defaultWeek,
  onSubmit,
}: {
  disabled: boolean;
  defaultWeek: string;
  onSubmit: (data: {
    weekLabel: string;
    whatWorked: string;
    whatFailed: string;
    whatSurprised: string;
    whatToStop: string;
    whatToDoMore: string;
    whatWeAreLearning: string;
  }) => void;
}) {
  const [weekLabel, setWeekLabel] = useState(defaultWeek);
  const [whatWorked, setWhatWorked] = useState("");
  const [whatFailed, setWhatFailed] = useState("");
  const [whatSurprised, setWhatSurprised] = useState("");
  const [whatToStop, setWhatToStop] = useState("");
  const [whatToDoMore, setWhatToDoMore] = useState("");
  const [whatWeAreLearning, setWhatWeAreLearning] = useState("");

  const fields = [
    { label: "What worked?", value: whatWorked, set: setWhatWorked },
    { label: "What failed?", value: whatFailed, set: setWhatFailed },
    { label: "What surprised us?", value: whatSurprised, set: setWhatSurprised },
    { label: "What should we stop doing?", value: whatToStop, set: setWhatToStop },
    { label: "What should we do more of?", value: whatToDoMore, set: setWhatToDoMore },
    { label: "What are we learning?", value: whatWeAreLearning, set: setWhatWeAreLearning },
  ];

  return (
    <form
      className="mt-3 space-y-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          weekLabel,
          whatWorked,
          whatFailed,
          whatSurprised,
          whatToStop,
          whatToDoMore,
          whatWeAreLearning,
        });
      }}
    >
      <input className="w-full rounded border px-2 py-1" placeholder="Week label (e.g. 2026-W22)" value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} required />
      {fields.map((f) => (
        <div key={f.label}>
          <label className="font-semibold text-kelly-navy">{f.label}</label>
          <textarea className="mt-1 w-full rounded border px-2 py-1" rows={2} value={f.value} onChange={(e) => f.set(e.target.value)} />
        </div>
      ))}
      <button type="submit" disabled={disabled} className="rounded bg-indigo-900 px-3 py-2 font-bold text-white">
        Save weekly reflection (human-triggered)
      </button>
    </form>
  );
}
