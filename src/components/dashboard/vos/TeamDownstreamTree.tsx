"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { DownstreamTeamNode } from "@/types/dashboard";

function statusLabel(s: DownstreamTeamNode["status"]) {
  if (s === "active") return "Active";
  if (s === "forming") return "Forming";
  return "Paused";
}

function collectIds(node: DownstreamTeamNode): string[] {
  return [node.teamId, ...node.children.flatMap((c) => collectIds(c))];
}

export function TeamDownstreamTree({
  root,
  currentSlug,
}: {
  root: DownstreamTeamNode;
  currentSlug: string;
}) {
  const allIds = useMemo(() => collectIds(root), [root]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([root.teamId]));

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(allIds));
  }, [allIds]);

  const collapseNested = useCallback(() => {
    setExpanded(new Set([root.teamId]));
  }, [root.teamId]);

  const renderNode = (node: DownstreamTeamNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.teamId);
    const isHere = node.slug === currentSlug;

    return (
      <div
        key={node.teamId}
        className={depth === 0 ? "" : "mt-3 border-l border-kelly-text/15 pl-4 md:ml-1 md:pl-5"}
      >
        <div
          className={`rounded-xl border bg-white px-4 py-3 shadow-sm ${
            isHere ? "border-kelly-gold/60 ring-2 ring-kelly-gold/30" : "border-kelly-text/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggle(node.teamId)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-kelly-text/15 bg-kelly-fog/50 font-mono text-xs text-kelly-navy"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse downstream teams" : "Expand downstream teams"}
              >
                {isExpanded ? "−" : "+"}
              </button>
            ) : (
              <span className="w-8" aria-hidden />
            )}
            <Link
              href={`/dashboard/team/${node.slug}`}
              className="font-heading text-sm font-bold text-kelly-blue underline md:text-base"
            >
              {node.displayName}
            </Link>
            <span className="rounded-full bg-kelly-navy/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-navy">
              {node.level}
            </span>
            <span className="rounded-md bg-kelly-fog px-2 py-0.5 font-body text-[10px] font-medium text-kelly-deep">{statusLabel(node.status)}</span>
            {isHere ? (
              <span className="rounded-md bg-kelly-gold/35 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-kelly-deep">
                You are here
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-body text-xs text-kelly-text/70">{node.geography}</p>
          <p className="mt-2 font-body text-xs text-kelly-text/80">
            <strong className="text-kelly-deep">Leads:</strong> {node.leadNames.join(", ")}
          </p>
          <p className="mt-1 font-body text-xs text-kelly-text/75">{node.activitySummary}</p>
        </div>
        {hasChildren && isExpanded ? (
          <div className="space-y-0">{node.children.map((c) => renderNode(c, depth + 1))}</div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Downstream teams</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Hierarchy</h3>
          <p className="mt-1 font-body text-sm text-kelly-text/70">
            Exponential organizing tree. Select a team to open its workspace when that link is live for your assignment.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-lg border border-kelly-text/15 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseNested}
            className="rounded-lg border border-kelly-text/15 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
          >
            Collapse nested
          </button>
        </div>
      </div>
      <div className="mt-6">{renderNode(root, 0)}</div>
    </section>
  );
}
