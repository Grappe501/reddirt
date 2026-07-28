/**
 * Phase 1C — classify Netlify production DB targets without printing secrets.
 */
const { execSync } = require("node:child_process");

function entry(list, key) {
  return Array.isArray(list) ? list.find((x) => x.key === key) : null;
}

function classify(e) {
  if (!e) return { present: false };
  const v =
    e.value ??
    e.values?.production ??
    e.values?.all ??
    (e.values ? Object.values(e.values)[0] : null);
  if (v == null) return { present: true, valueMissing: true };
  if (typeof v !== "string") return { present: true, valueType: typeof v };
  const s = v.trim().replace(/^["']|["']$/g, "");
  const m = s.match(
    /^postgres(?:ql)?:\/\/([^:@/]+)(?::([^@]*))?@([^:/]+)(?::(\d+))?\/([^?\s]+)/i,
  );
  if (!m) {
    return {
      present: true,
      parseError: true,
      len: s.length,
      looksPostgres: /postgres/i.test(s),
      hasPooler: /pooler/i.test(s),
      hasSupabase: /supabase/i.test(s),
    };
  }
  const host = m[3];
  return {
    present: true,
    hostFamily: host.includes("pooler.supabase.com")
      ? "supabase_pooler"
      : /supabase/i.test(host)
        ? "supabase_other"
        : /neon/i.test(host)
          ? "neon"
          : "other",
    port: m[4] || "",
    databaseName: m[5],
    usesPooler: /pooler/i.test(host),
  };
}

const raw = execSync("npx netlify env:list --context production --json", {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  timeout: 90000,
});
const j = JSON.parse(raw);
const out = {
  context: "production",
  database: classify(entry(j, "DATABASE_URL")),
  direct: classify(entry(j, "DIRECT_URL")),
  netlifyDatabase: classify(entry(j, "NETLIFY_DATABASE_URL")),
};
console.log(JSON.stringify(out, null, 2));
