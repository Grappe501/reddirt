import Link from "next/link";

type Props = {
  moduleId: string;
  title: string;
  href: string;
  reason: string;
};

export function CopilotTrainingRecommendationCard({ moduleId, title, href, reason }: Props) {
  return (
    <div className="rounded-xl border border-kelly-navy/10 bg-kelly-navy/[0.03] p-3 text-sm">
      <p className="text-[10px] font-bold uppercase text-kelly-slate">Recommended training</p>
      <p className="mt-1 font-bold text-kelly-navy">{title}</p>
      <p className="text-xs text-kelly-muted">{reason}</p>
      <Link href={href} className="mt-2 inline-block rounded-full bg-kelly-navy px-3 py-1 text-xs font-bold text-white">
        Start module
      </Link>
    </div>
  );
}
