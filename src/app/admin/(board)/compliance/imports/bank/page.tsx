"use client";

import { useState } from "react";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import type { BankImportAnalysis } from "@/lib/compliance/imports/types";

export default function BankImportPage() {
  const [analysis, setAnalysis] = useState<BankImportAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/compliance/imports/bank", {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Bank analysis failed.");
      setAnalysis(json.analysis);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Bank analysis failed.");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Bank import"
        title="Bank CSV discovery"
        description="Upload a monthly bank CSV to detect transaction fields, classify possible deposits and expenditures, and stage rows for reconciliation preview."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <form action={submit} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="font-body text-sm font-semibold text-kelly-text">
            Bank CSV
            <input className="mt-2 block w-full rounded-lg border border-kelly-text/20 bg-white p-2" type="file" name="file" accept=".csv,text/csv" required />
          </label>
          <label className="font-body text-sm font-semibold text-kelly-text">
            Reviewer initials
            <input className="mt-2 block w-40 rounded-lg border border-kelly-text/20 bg-white p-2" name="uploadedByInitials" maxLength={12} />
          </label>
        </div>
        <button className="mt-4 rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-60" disabled={loading}>
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>
      </form>
      {error ? <div className="rounded-2xl border border-red-900/20 bg-red-50 p-4 font-body text-sm text-red-900">{error}</div> : null}
      {analysis ? <BankAnalysisView analysis={analysis} /> : null}
    </div>
  );
}

function BankAnalysisView({ analysis }: { analysis: BankImportAnalysis }) {
  const capabilities = analysis.detectedCapabilities;
  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Batch summary</h2>
        <div className="mt-3 grid gap-2 font-body text-sm text-kelly-text/75 md:grid-cols-3">
          <p><strong>Rows:</strong> {analysis.batch.rowCount}</p>
          <p><strong>Columns:</strong> {analysis.batch.detectedColumns.length}</p>
          <p><strong>Sign convention:</strong> {analysis.depositExpenseSignConvention}</p>
          <p><strong>Possible deposits:</strong> {analysis.possibleDeposits}</p>
          <p><strong>Possible expenses:</strong> {analysis.possibleExpenditures}</p>
          <p><strong>Possible fees:</strong> {analysis.possibleFees}</p>
        </div>
      </div>
      <List title="Detected columns" values={analysis.batch.detectedColumns} />
      <List
        title="Detected field mapping"
        values={[
          `date: ${capabilities.dateColumn ?? "not detected"}`,
          `description: ${capabilities.descriptionColumn ?? "not detected"}`,
          `amount: ${capabilities.amountColumn ?? "not detected"}`,
          `debit: ${capabilities.debitColumn ?? "not detected"}`,
          `credit: ${capabilities.creditColumn ?? "not detected"}`,
          `balance: ${capabilities.balanceColumn ?? "not detected"}`,
          `check number: ${capabilities.checkNumberColumn ?? "not detected"}`,
          `processor info in memo: ${capabilities.processorInfoInMemo ? "yes" : "not detected"}`,
        ]}
      />
      <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Sanitized sample rows</h2>
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-kelly-wash p-3 text-xs text-kelly-text">{JSON.stringify(analysis.sampleRows, null, 2)}</pre>
      </div>
    </section>
  );
}

function List({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
      <h2 className="font-heading text-lg font-bold text-kelly-text">{title}</h2>
      <ul className="mt-3 grid gap-1 font-body text-sm text-kelly-text/75">
        {values.map((value) => <li key={value}>{value}</li>)}
      </ul>
    </div>
  );
}
