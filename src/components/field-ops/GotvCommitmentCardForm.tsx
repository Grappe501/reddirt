"use client";

import { useMemo, useState } from "react";

const WAYS = [
  ["host_house_party", "Host house party"],
  ["bring_5_commitments", "Bring 5 commitments"],
  ["make_calls", "Make calls"],
  ["write_postcards", "Write postcards"],
  ["help_at_events", "Help at events"],
  ["drive_people", "Drive people"],
  ["translation_access", "Help with translation/access"],
  ["local_guide", "Be a local guide"],
  ["photos_video", "Take photos/video"],
  ["fundraiser_host", "Fundraiser/host"],
] as const;

type State = "idle" | "saving" | "saved" | "error";

export function GotvCommitmentCardForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [ways, setWays] = useState<string[]>([]);

  const waySet = useMemo(() => new Set(ways), [ways]);

  async function onSubmit(formData: FormData) {
    setState("saving");
    setMessage(null);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      county: String(formData.get("county") ?? ""),
      city: String(formData.get("city") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      commitmentConfirmed: formData.get("commitmentConfirmed") === "on",
      waysToHelp: ways,
      optInEmail: formData.get("optInEmail") === "on",
      optInSms: formData.get("optInSms") === "on",
      optInPhone: formData.get("optInPhone") === "on",
      languageAccessSkills: String(formData.get("languageAccessSkills") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      website: String(formData.get("website") ?? ""),
    };
    const res = await fetch("/api/field-ops/gotv-commitment-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      setState("error");
      setMessage("We could not save that just now. Please check required fields and try again.");
      return;
    }
    setState("saved");
    setMessage(
      json.mode === "staged"
        ? "Saved for staff review in the staged queue."
        : "Saved. Staff will review and follow up before anything is sent.",
    );
  }

  return (
    <form action={onSubmit} className="space-y-5 rounded-2xl border border-kelly-text/15 bg-white px-5 py-5 shadow-sm">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="font-body text-sm font-semibold text-kelly-text">
          Name
          <input name="name" required className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          Phone
          <input name="phone" className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          County
          <input name="county" required className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          City
          <input name="city" className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          ZIP
          <input name="zip" required className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
        </label>
      </div>

      <label className="flex gap-2 rounded-lg border border-emerald-700/20 bg-emerald-50 px-3 py-3 font-body text-sm font-semibold text-emerald-950">
        <input name="commitmentConfirmed" type="checkbox" required className="mt-1" />
        <span>I commit to help 5 people make a plan to vote.</span>
      </label>

      <fieldset>
        <legend className="font-heading text-[11px] font-bold uppercase tracking-wide text-kelly-text/55">Ways I can help</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {WAYS.map(([id, label]) => (
            <label key={id} className="flex gap-2 rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-3 py-2 font-body text-xs text-kelly-text/85">
              <input
                type="checkbox"
                checked={waySet.has(id)}
                onChange={(e) => setWays((cur) => (e.target.checked ? [...cur, id] : cur.filter((x) => x !== id)))}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-heading text-[11px] font-bold uppercase tracking-wide text-kelly-text/55">Opt-in choices</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["optInEmail", "Email"],
            ["optInSms", "SMS"],
            ["optInPhone", "Phone"],
          ].map(([id, label]) => (
            <label key={id} className="rounded-full border border-kelly-text/15 bg-white px-3 py-1.5 font-body text-xs text-kelly-text/85">
              <input name={id} type="checkbox" className="mr-2" />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 font-body text-[10px] text-kelly-text/55">No automated SMS/email is sent from this form. Staff reviews consent and follow-up first.</p>
      </fieldset>

      <label className="block font-body text-sm font-semibold text-kelly-text">
        Language/access skills
        <textarea name="languageAccessSkills" className="mt-1 min-h-20 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
      </label>

      <label className="block font-body text-sm font-semibold text-kelly-text">
        Notes
        <textarea name="notes" className="mt-1 min-h-24 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-normal" />
      </label>

      <button
        type="submit"
        disabled={state === "saving"}
        className="rounded-lg bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-60"
      >
        {state === "saving" ? "Saving..." : "Commit to help 5 people vote"}
      </button>
      {message ? (
        <p className={`font-body text-sm ${state === "error" ? "text-rose-800" : "text-emerald-800"}`}>{message}</p>
      ) : null}
    </form>
  );
}
