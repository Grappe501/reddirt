import { cn } from "@/lib/utils";

export type MessageCardKind = "conversation_starter" | "follow_up" | "local_story" | "next_action";

const KIND_LABEL: Record<MessageCardKind, string> = {
  conversation_starter: "Conversation starter",
  follow_up: "Follow-up idea",
  local_story: "Local story prompt",
  next_action: "Next best step",
};

type Props = {
  kind: MessageCardKind;
  /** Optional override for the ribbon label (e.g. shorter in compact layouts). */
  label?: string;
  title: string;
  body: string;
  /** Hint under the body — timing, listening note, or bridge. */
  hint?: string;
  className?: string;
};

/**
 * Paste-friendly script card for Conversation Tools — no telemetry, no copy-to-clipboard wiring required here.
 */
export function MessageCard({ kind, label, title, body, hint, className }: Props) {
  const ribbon = label ?? KIND_LABEL[kind];

  return (
    <article
      className={cn(
        "rounded-2xl border border-kelly-text/10 bg-kelly-page/95 p-4 shadow-sm",
        kind === "next_action" && "border-l-4 border-l-kelly-gold/80 bg-kelly-gold/5",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/55">{ribbon}</p>
      <h3 className="font-heading mt-1.5 text-base font-bold text-kelly-navy">{title}</h3>
      <p className="mt-3 whitespace-pre-line font-body text-sm leading-relaxed text-kelly-text/90">{body}</p>
      {hint ? (
        <p className="mt-3 rounded-lg border border-kelly-text/10 bg-white/70 px-3 py-2 text-xs leading-relaxed text-kelly-text/75">
          {hint}
        </p>
      ) : null}
    </article>
  );
}
