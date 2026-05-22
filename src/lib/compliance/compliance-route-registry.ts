/** Canonical compliance admin routes for QA hardening and smoke checks. */
export const COMPLIANCE_ROUTE_REGISTRY = [
  "/admin/compliance",
  "/admin/compliance/wizard",
  "/admin/compliance/approval",
  "/admin/compliance/tasks",
  "/admin/compliance/filings",
  "/admin/compliance/receipts",
  "/admin/compliance/receipts/new",
  "/admin/compliance/receipts/review",
  "/admin/compliance/cash",
  "/admin/compliance/checks",
  "/admin/compliance/expenses/new",
  "/admin/compliance/vendors",
  "/admin/compliance/1099",
  "/admin/compliance/money",
  "/admin/compliance/documentation",
  "/admin/compliance/reconciliation",
  "/admin/compliance/rules",
  "/admin/compliance/filing-readiness",
  "/admin/compliance/april26",
  "/admin/compliance/reports",
  "/admin/compliance/reports/april26",
  "/admin/compliance/mobile",
  "/admin/compliance/settings",
] as const;

export type ComplianceRoutePath = (typeof COMPLIANCE_ROUTE_REGISTRY)[number];
