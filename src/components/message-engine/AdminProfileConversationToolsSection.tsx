import type { AdminProfileConversationToolsPayload } from "@/lib/message-engine/admin-profile-conversation-tools";

type Props = {
  payload: AdminProfileConversationToolsPayload;
};

function SnippetCard({ label, snippet }: { label: string; snippet: { title: string; body: string } }) {
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">{label}</p>
      <h3 className="font-heading mt-2 text-base font-bold text-kelly-text">{snippet.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-kelly-text/85">{snippet.body}</p>
    </div>
  );
}

/**
 * Staff-only profile section: registry-backed conversation support (no model calls).
 * Public wording avoids vendor / “smart” framing per message system language audit.
 */
export function AdminProfileConversationToolsSection({ payload }: Props) {
  return (
    <section
      className="rounded-card border border-kelly-navy/15 bg-kelly-page p-6 shadow-[var(--shadow-soft)]"
      aria-labelledby="admin-conversation-tools-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/60">Conversation Tools</p>
          <h2 id="admin-conversation-tools-heading" className="font-heading mt-1 text-xl font-bold text-kelly-navy">
            Relational outreach support
          </h2>
        </div>
      </div>

      <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 p-3 text-sm font-medium text-amber-950">
        <span className="font-bold">Privacy &amp; permission:</span> {payload.privacyLabel}
      </p>

      <div className="mt-5 space-y-2 rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">Relationship context</p>
        <p className="text-sm leading-relaxed text-kelly-text/90">{payload.relationshipContext}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <SnippetCard label="Suggested opener" snippet={payload.suggestedOpener} />
        <SnippetCard label="Listening prompt" snippet={payload.listeningPrompt} />
        <SnippetCard label="Follow-up prompt" snippet={payload.followUpPrompt} />
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">Pipeline next step</p>
          <p className="mt-2 text-sm leading-relaxed text-kelly-text/85">{payload.pipelineNextStep}</p>
        </div>
      </div>

      {payload.registryFallbackNotes.length > 0 ? (
        <p className="mt-4 text-xs text-kelly-text/55">
          Registry notes: {payload.registryFallbackNotes.join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
