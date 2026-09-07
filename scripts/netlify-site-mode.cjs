/**
 * Which Netlify project is building this checkout.
 * kgrappe = public campaign hub. macroscopic-life = Book One only.
 */
function envFlag(name) {
  const v = String(process.env[name] ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function isMacroscopicLifeNetlifySite() {
  if (envFlag("NEXT_PUBLIC_MACROSCOPIC_LIFE_SITE")) return true;
  const site = String(process.env.SITE_NAME ?? process.env.NETLIFY_SITE_NAME ?? "")
    .trim()
    .toLowerCase();
  return site === "macroscopic-life";
}

module.exports = { isMacroscopicLifeNetlifySite };
