const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_MARKETLAB_SUPABASE_URL",
  "NEXT_PUBLIC_MARKETLAB_SUPABASE_PUBLISHABLE_KEY",
  "MARKETLAB_MARKET_DATA_PROVIDER",
  "MARKETLAB_MARKET_DATA_API_KEY",
  "MARKETLAB_ALPACA_API_SECRET",
];

const missing = required.filter((name) => !process.env[name]?.trim());

const provider = (process.env.MARKETLAB_MARKET_DATA_PROVIDER || "").trim().toLowerCase();
const checks = {
  databaseConfigured: Boolean(process.env.DATABASE_URL?.trim() && process.env.DIRECT_URL?.trim()),
  authConfigured: Boolean(
    process.env.NEXT_PUBLIC_MARKETLAB_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_MARKETLAB_SUPABASE_PUBLISHABLE_KEY?.trim(),
  ),
  marketDataConfigured:
    provider === "alpaca" &&
    Boolean(process.env.MARKETLAB_MARKET_DATA_API_KEY?.trim() && process.env.MARKETLAB_ALPACA_API_SECRET?.trim()),
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
