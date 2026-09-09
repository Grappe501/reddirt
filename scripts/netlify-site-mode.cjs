/**
 * Which Netlify project is building this checkout.
 * kgrappe = public campaign hub. macroscopic-life = Book One only.
 * dec-sim = Decision Simulator only (not the SOS campaign site).
 */
function envFlag(name) {
  const v = String(process.env[name] ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function siteName() {
  return String(process.env.SITE_NAME ?? process.env.NETLIFY_SITE_NAME ?? "")
    .trim()
    .toLowerCase();
}

function isMacroscopicLifeNetlifySite() {
  if (envFlag("NEXT_PUBLIC_MACROSCOPIC_LIFE_SITE")) return true;
  return siteName() === "macroscopic-life";
}

function isDecisionSimNetlifySite() {
  if (envFlag("NEXT_PUBLIC_DECISION_SIM_SITE")) return true;
  return siteName() === "dec-sim";
}

module.exports = { isMacroscopicLifeNetlifySite, isDecisionSimNetlifySite };
