"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type FormEvent } from "react";

import type { QuitmanBonusPlan } from "@/lib/election-plan/load-win-quitman-operation";
import { cn } from "@/lib/utils";

type Props = {
  plan: QuitmanBonusPlan;
  operatorInitials: string | null;
  eventSlug?: string;
  eventLabel?: string;
};

function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image load failed"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas failed"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function VoterContactCapturePanel({ plan, operatorInitials, eventSlug, eventLabel }: Props) {
  const tonight = plan.houseParties.events.find((e) => e.status === "tonight") ?? plan.houseParties.events[0];
  const resolvedEventSlug = eventSlug ?? tonight?.id ?? plan.tonightEvent.slug;
  const resolvedEventLabel = eventLabel ?? tonight?.label ?? plan.tonightEvent.label;

  const fileRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [interestVolunteer, setInterestVolunteer] = useState(false);
  const [interestDonor, setInterestDonor] = useState(false);
  const [interestLeadership, setInterestLeadership] = useState(false);
  const [interestHost, setInterestHost] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<{ name: string; href: string } | null>(null);

  const onPhoto = useCallback(async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      setPhotoPreview(dataUrl);
      setPhotoDataUrl(dataUrl);
    } catch {
      setError("Could not process photo — try again");
    }
  }, []);

  const resetForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setInterestVolunteer(false);
    setInterestDonor(false);
    setInterestLeadership(false);
    setInterestHost(false);
    setPhotoPreview(null);
    setPhotoDataUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!operatorInitials) {
        setError("Sign in with your 3-letter initials before capturing contacts.");
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        setError("First and last name required.");
        return;
      }
      setBusy(true);
      setError(null);
      setLastSaved(null);
      try {
        const res = await fetch("/api/election-plan/voter-contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            notes: notes.trim() || undefined,
            interestVolunteer,
            interestDonor,
            interestLeadership,
            interestHost,
            photoDataUrl: photoDataUrl ?? undefined,
            countySlug: plan.countySlug,
            citySlug: plan.citySlug,
            workbenchSlug: plan.citySlug,
            eventSlug: resolvedEventSlug,
            eventLabel: resolvedEventLabel,
          }),
        });
        const data = (await res.json()) as {
          error?: string;
          contact?: { id: string; firstName: string; lastName: string; href: string };
        };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return;
        }
        const name = `${data.contact?.firstName ?? firstName} ${data.contact?.lastName ?? lastName}`;
        setLastSaved({ name, href: data.contact?.href ?? "#" });
        resetForm();
      } catch {
        setError("Network error");
      } finally {
        setBusy(false);
      }
    },
    [
      operatorInitials,
      firstName,
      lastName,
      email,
      phone,
      notes,
      interestVolunteer,
      interestDonor,
      interestLeadership,
      interestHost,
      photoDataUrl,
      plan.countySlug,
      plan.citySlug,
      resolvedEventSlug,
      resolvedEventLabel,
      resetForm,
    ],
  );

  const inputClass =
    "w-full rounded-lg border-2 border-[var(--ep-border)] px-4 py-3 text-base text-[var(--ep-navy)] focus:border-[var(--ep-navy)] focus:outline-none";

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/election-plan/workbenches/${plan.citySlug}`}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← Quitman workbench
      </Link>

      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Field capture</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">New voter contact</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{resolvedEventLabel}</p>
        {plan.countyLeadContact ? (
          <div className="mt-3 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-3 text-sm">
            <p>
              <span className="font-semibold text-[var(--ep-navy)]">{plan.countyLeadContact.name}</span>
              <span className="text-[var(--ep-navy-muted)]"> · county lead</span>
            </p>
            <p className="mt-1 flex flex-wrap gap-x-3">
              <a href={`tel:${plan.countyLeadContact.phone}`} className="font-semibold text-[var(--ep-navy)] underline">
                {plan.countyLeadContact.phone}
              </a>
              <a href={`mailto:${plan.countyLeadContact.email}`} className="font-semibold text-[var(--ep-navy)] underline">
                Email
              </a>
            </p>
            {tonight?.hostName && tonight.hostPhone ? (
              <p className="mt-2 border-t border-[var(--ep-border)] pt-2">
                <span className="font-semibold text-[var(--ep-navy)]">{tonight.hostName}</span>
                <span className="text-[var(--ep-navy-muted)]"> · host · </span>
                <a href={`tel:${tonight.hostPhone}`} className="font-semibold text-[var(--ep-navy)] underline">
                  {tonight.hostPhone}
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--ep-navy-muted)]">County lead: {plan.countyLead}</p>
        )}
      </div>

      {!operatorInitials ? (
        <p className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          Sign in with operator initials at the top of Election Plan before capturing contacts.
        </p>
      ) : null}

      {lastSaved ? (
        <div className="mt-4 rounded-lg border-2 border-emerald-400 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-900">Saved · {lastSaved.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={lastSaved.href} className="text-sm font-semibold text-emerald-800 underline">
              View contact page
            </Link>
            <button type="button" onClick={() => setLastSaved(null)} className="text-sm text-emerald-700">
              Capture another →
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">First name *</span>
            <input
              className={cn(inputClass, "mt-1")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Last name *</span>
            <input
              className={cn(inputClass, "mt-1")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Phone</span>
          <input
            type="tel"
            className={cn(inputClass, "mt-1")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Email</span>
          <input
            type="email"
            className={cn(inputClass, "mt-1")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <fieldset className="rounded-lg border border-[var(--ep-border)] p-4">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            Interests · tap all that apply
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              { checked: interestVolunteer, set: setInterestVolunteer, label: "Volunteer" },
              { checked: interestDonor, set: setInterestDonor, label: "Donor / supporter" },
              { checked: interestLeadership, set: setInterestLeadership, label: "Leadership / Po5" },
              { checked: interestHost, set: setInterestHost, label: "House party host" },
            ].map((item) => (
              <label
                key={item.label}
                className={cn(
                  "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2",
                  item.checked
                    ? "border-[var(--ep-navy)] bg-[var(--ep-navy)]/5"
                    : "border-[var(--ep-border)] bg-white",
                )}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="h-5 w-5"
                />
                <span className="text-sm font-semibold text-[var(--ep-navy)]">{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            Photo together
          </span>
          <div className="mt-2 flex flex-wrap items-start gap-4">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Preview"
                className="h-32 w-32 rounded-lg border-2 border-[var(--ep-border)] object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-[var(--ep-border)] bg-[var(--ep-cream)]/50 text-xs text-[var(--ep-navy-muted)]">
                No photo
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="min-h-[48px] rounded-lg border-2 border-[var(--ep-navy)] px-4 py-2 text-sm font-bold text-[var(--ep-navy)]"
              >
                Take / choose photo
              </button>
              {photoPreview ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoDataUrl(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-xs text-[var(--ep-navy-muted)] underline"
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Notes</span>
          <textarea
            className={cn(inputClass, "mt-1 min-h-[80px]")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Conversation highlights, follow-up ask, who introduced them…"
          />
        </label>

        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={busy || !operatorInitials}
          className={cn(
            "w-full min-h-[56px] rounded-lg bg-[var(--ep-navy)] py-4 text-base font-bold uppercase tracking-wide text-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {busy ? "Saving…" : "Save contact · ready for next person"}
        </button>
      </form>
    </div>
  );
}
