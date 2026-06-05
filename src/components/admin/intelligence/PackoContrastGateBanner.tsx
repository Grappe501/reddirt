import Link from "next/link";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";

type Props = {
  compact?: boolean;
};

export function PackoContrastGateBanner({ compact }: Props) {
  const gate = getPackoContrastGateStatus();
  if (!gate.blocked) {
    if (compact) return null;
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-950">
        <span className="font-bold">Pakko contrast gate:</span> {gate.message}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 border-rose-300 bg-rose-50/80 text-rose-950 ${compact ? "p-3 text-xs" : "p-5 text-sm"}`}
      role="alert"
    >
      <p className="font-bold uppercase tracking-wide">Pakko contrast locked</p>
      <p className="mt-2">{gate.message}</p>
      <p className="mt-2 text-xs">{gate.claimsGate}</p>
      <ul className="mt-3 list-inside list-disc text-xs">
        {gate.openTaskIds.map((id) => (
          <li key={id}>
            <span className="font-mono font-bold">{id}</span> — OPEN (complete before contrast modules)
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <Link href="/admin/intelligence/diligence/michael-packo" className="text-rose-900 underline">
          Pakko diligence checklist →
        </Link>
        <Link href="/admin/intelligence/opponents" className="text-rose-900 underline">
          Opponents hub →
        </Link>
        <Link href="/admin/intelligence/field-book/pakko-contrast-gate" className="text-rose-900 underline">
          Field Book: contrast gate →
        </Link>
      </div>
    </div>
  );
}
