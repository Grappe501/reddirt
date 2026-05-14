import { GotvCommitmentCardForm } from "@/components/field-ops/GotvCommitmentCardForm";

export const dynamic = "force-dynamic";

export default function CommitPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="rounded-2xl border border-kelly-text/15 bg-[#f7f2e8] px-6 py-6 shadow-sm">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-text/45">GOTV commitment</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-text">Commit to help 5 people vote</h1>
        <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/75">
          Make a simple commitment: help five people make a plan to vote. Staff reviews every card and follows up only
          through the opt-in channels you choose.
        </p>
      </header>
      <GotvCommitmentCardForm />
    </main>
  );
}
