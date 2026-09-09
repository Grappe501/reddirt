/** Standalone Netlify project `dec-sim` — Decision Simulator only, not the campaign site. */
export function isDecisionSimSite(): boolean {
  const flag = String(process.env.NEXT_PUBLIC_DECISION_SIM_SITE ?? "")
    .trim()
    .toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  const site = String(process.env.SITE_NAME ?? process.env.NETLIFY_SITE_NAME ?? "")
    .trim()
    .toLowerCase();
  return site === "dec-sim";
}
