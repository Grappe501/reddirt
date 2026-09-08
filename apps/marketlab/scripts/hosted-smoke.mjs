const baseUrl = process.env.MARKETLAB_BASE_URL?.replace(/\/$/, "");
if (!baseUrl) {
  console.error("MARKETLAB_BASE_URL is required");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/health`, {
  headers: { Accept: "application/json" },
  redirect: "error",
});

if (!response.ok) {
  console.error(`MarketLab health check failed with HTTP ${response.status}`);
  process.exit(1);
}

const body = await response.json();
const required = ["database", "auth", "marketData"];
const failed = required.filter((key) => body?.checks?.[key] !== "ready");

if (body?.status !== "ready" || failed.length) {
  console.error("MarketLab hosted health is not ready", {
    status: body?.status,
    failed,
  });
  process.exit(1);
}

console.log("MarketLab hosted smoke PASS", {
  status: body.status,
  checks: required,
});
