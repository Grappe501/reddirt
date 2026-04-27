import { cn } from "@/lib/utils";

export function SupportList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((t) => (
        <li key={t} className="flex gap-3 font-body text-base leading-relaxed text-kelly-text/85">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-kelly-success" aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
