import "server-only";

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

import {
  BUDGET_SUPPORTING_DOCUMENTS,
  getBudgetDocument,
  type BudgetDocumentDef,
} from "./budget-documents-registry";

const BUDGET_DOCS_DIR = path.join(process.cwd(), "docs/campaign-brain/budget");

export function loadBudgetDocumentMarkdown(slug: string): { doc: BudgetDocumentDef; markdown: string } | null {
  const doc = getBudgetDocument(slug);
  if (!doc) return null;
  const filePath = path.join(BUDGET_DOCS_DIR, doc.file);
  if (!existsSync(filePath)) return null;
  const markdown = readFileSync(filePath, "utf8");
  return { doc, markdown };
}

export function listBudgetDocumentSlugs(): string[] {
  return BUDGET_SUPPORTING_DOCUMENTS.map((d) => d.slug);
}
