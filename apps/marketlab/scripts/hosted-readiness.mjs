function firstEnv(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return { name, value };
  }
  return { name: names[0], value: "" };
}

const databaseUrl = firstEnv("DATABASE_URL");
const directUrl = firstEnv("DIRECT_URL");
const supabaseUrl = firstEnv("NEXT_PUBLIC_MARKETLAB_SUPABASE_URL");
const supabaseKey = firstEnv("NEXT_PUBLIC_MARKETLAB_SUPABASE_PUBLISHABLE_KEY");
const providerEnv = firstEnv("MARKETLAB_MARKET_DATA_PROVIDER");
const alpacaKey = firstEnv("MARKETLAB_ALPACA_API_KEY_ID", "MARKETLAB_MARKET_DATA_API_KEY");
const alpacaSecret = firstEnv("MARKETLAB_ALPACA_API_SECRET_KEY", "MARKETLAB_ALPACA_API_SECRET");

const required = [
  databaseUrl,
  directUrl,
  supabaseUrl,
  supabaseKey,
  providerEnv,
  alpacaKey,
  alpacaSecret,
];

const missing = required.filter((item) => !item.value).map((item) => item.name);

const provider = providerEnv.value.toLowerCase();
const checks = {
  databaseConfigured: Boolean(databaseUrl.value && directUrl.value),
  authConfigured: Boolean(supabaseUrl.value && supabaseKey.value),
  marketDataConfigured: provider === "alpaca" && Boolean(alpacaKey.value && alpacaSecret.value),
};

console.log("MarketLab hosted readiness");
console.log(JSON.stringify({ provider: provider || null, checks, missing }, null, 2));

if (missing.length) {
  console.error(`Missing required MarketLab environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (!Object.values(checks).every(Boolean)) {
  console.error("MarketLab hosted readiness checks failed.");
  process.exit(1);
}

console.log("MarketLab hosted environment contract is structurally complete.");
