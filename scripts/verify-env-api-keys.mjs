/**
 * Health-check third-party API keys and connections from .env (no secrets printed).
 * Usage: from RedDirt: node scripts/verify-env-api-keys.mjs
 * Loads: .env then .env.local (overrides; same as typical Next order).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(p) {
  if (!existsSync(p)) return {};
  const out = {};
  const text = readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/s);
    if (!m) {
      process.stderr.write(`[warn] Unparseable line in ${p} (use KEY=VALUE): ${t.slice(0, 64)}${t.length > 64 ? "…" : ""}\n`);
      continue;
    }
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

const env = { ...loadEnvFile(join(root, ".env")), ...loadEnvFile(join(root, ".env.local")) };

function r(ok, name, detail) {
  const s = ok ? "OK" : "FAIL";
  const d = detail ? ` — ${detail}` : "";
  console.log(`[${s}] ${name}${d}`);
  return ok;
}

async function main() {
  const results = { ok: 0, fail: 0, skip: 0 };

  const ok = (name, d) => (r(true, name, d), results.ok++);
  const fail = (name, d) => (r(false, name, d), results.fail++);
  const skip = (name, d) => (console.log(`[SKIP] ${name}${d ? ` — ${d}` : ""}`), results.skip++);

  // OpenAI
  if (env.OPENAI_API_KEY?.length > 5) {
    try {
      const res = await fetch("https://api.openai.com/v1/models?limit=1", {
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      });
      if (res.ok) ok("OPENAI_API_KEY", `HTTP ${res.status}`);
      else fail("OPENAI_API_KEY", `HTTP ${res.status}`);
    } catch (e) {
      fail("OPENAI_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("OPENAI_API_KEY", "not set or empty");
  }

  // Supabase — auth health (no key), then anon JWT against PostgREST
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const u = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
      const h = await fetch(`${u.origin}/auth/v1/health`);
      if (!h.ok) fail("Supabase (Auth health)", `HTTP ${h.status}`);
      else {
        ok("Supabase (Auth /auth/v1/health)", `HTTP ${h.status}`);
        if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          const res = await fetch(`${u.origin}/rest/v1/`, {
            headers: {
              apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          });
          if (res.ok || res.status === 400 || res.status === 406) {
            ok("Supabase (anon + PostgREST)", `HTTP ${res.status}`);
          } else {
            fail("Supabase (anon + PostgREST — JWT may be wrong or expired)", `HTTP ${res.status}`);
          }
        } else {
          skip("Supabase (anon + PostgREST)", "NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
        }
      }
    } catch (e) {
      fail("Supabase", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("Supabase (NEXT_PUBLIC_*)", "URL missing");
  }

  // SendGrid
  if (env.SENDGRID_API_KEY?.length > 5) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/scopes", {
        headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}` },
      });
      if (res.ok) ok("SENDGRID_API_KEY", `HTTP ${res.status}`);
      else fail("SENDGRID_API_KEY", `HTTP ${res.status}`);
    } catch (e) {
      fail("SENDGRID_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("SENDGRID_API_KEY", "not set");
  }

  // Twilio
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    try {
      const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}.json`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      if (res.ok) ok("Twilio (Account SID + auth token)", `HTTP ${res.status}`);
      else fail("Twilio (Account SID + auth token)", `HTTP ${res.status}`);
    } catch (e) {
      fail("Twilio (Account SID + auth token)", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("Twilio", "SID or token missing");
  }

  // Netlify
  if (env.NETLIFY_AUTH_TOKEN?.length > 3) {
    try {
      const res = await fetch("https://api.netlify.com/api/v1/user", {
        headers: { Authorization: `Bearer ${env.NETLIFY_AUTH_TOKEN}` },
      });
      if (res.ok) ok("NETLIFY_AUTH_TOKEN", `HTTP ${res.status}`);
      else fail("NETLIFY_AUTH_TOKEN", `HTTP ${res.status}`);
    } catch (e) {
      fail("NETLIFY_AUTH_TOKEN", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("NETLIFY_AUTH_TOKEN", "empty or missing");
  }

  // Google Maps Geocoding (validates this key + that Geocoding API is enabled for it)
  if (env.GOOGLE_MAPS_API_KEY?.length > 5) {
    try {
      const u = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      u.searchParams.set("address", "1600+Pennsylvania+Ave+NW+Washington+DC");
      u.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);
      const res = await fetch(u);
      const j = await res.json();
      if (j.status === "OK" || j.status === "ZERO_RESULTS") {
        ok("GOOGLE_MAPS_API_KEY (Geocoding)", j.status);
      } else {
        fail("GOOGLE_MAPS_API_KEY (Geocoding)", j.status + (j.error_message ? ` — ${j.error_message}` : ""));
      }
    } catch (e) {
      fail("GOOGLE_MAPS_API_KEY (Geocoding)", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("GOOGLE_MAPS_API_KEY", "not set");
  }

  // Generic Google API key — try a lightweight call (may fail if key is restricted to other APIs)
  if (env.GOOGLE_API_KEY?.length > 5) {
    try {
      const u = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      u.searchParams.set("address", "Portland+OR");
      u.searchParams.set("key", env.GOOGLE_API_KEY);
      const res = await fetch(u);
      const j = await res.json();
      if (j.status === "OK" || j.status === "ZERO_RESULTS") {
        ok("GOOGLE_API_KEY (tested with Geocoding like Maps)", j.status);
      } else {
        fail(
          "GOOGLE_API_KEY (tested with Geocoding like Maps — may be OK if key is API-restricted)",
          j.status + (j.error_message ? ` — ${j.error_message}` : "")
        );
      }
    } catch (e) {
      fail("GOOGLE_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("GOOGLE_API_KEY", "not set");
  }

  // OpenCage
  if (env.OPENCAGE_API_KEY?.length > 3) {
    try {
      const u = new URL("https://api.opencagedata.com/geocode/v1/json");
      u.searchParams.set("q", "Eiffel Tower");
      u.searchParams.set("key", env.OPENCAGE_API_KEY);
      u.searchParams.set("limit", "1");
      const res = await fetch(u);
      const j = await res.json();
      if (j?.status?.code === 200) ok("OPENCAGE_API_KEY", "status 200 in JSON");
      else
        fail(
          "OPENCAGE_API_KEY",
          j?.status?.code != null ? `code ${j.status?.code} ${j.status?.message ?? ""}` : `HTTP ${res.status}`
        );
    } catch (e) {
      fail("OPENCAGE_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("OPENCAGE_API_KEY", "not set");
  }

  // api.data.gov (NREL alt fuel stations is a common consumer)
  if (env.API_DOT_GOV_KEY?.length > 3) {
    try {
      const u = new URL("https://developer.nrel.gov/api/alt-fuel-stations/v1.json");
      u.searchParams.set("api_key", env.API_DOT_GOV_KEY);
      u.searchParams.set("state", "OR");
      u.searchParams.set("limit", "1");
      const res = await fetch(u);
      const j = await res.json();
      if (j.errors) fail("API_DOT_GOV_KEY (via NREL alt-fuel)", `errors: ${String(j.errors)}`);
      else if (res.ok) ok("API_DOT_GOV_KEY (via NREL alt-fuel)", `HTTP ${res.status}`);
      else fail("API_DOT_GOV_KEY (via NREL alt-fuel)", `HTTP ${res.status}`);
    } catch (e) {
      fail("API_DOT_GOV_KEY (via NREL alt-fuel)", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("API_DOT_GOV_KEY", "not set");
  }

  // Open States v3 (REST, not GraphQL)
  if (env.OPENSTATES_API_KEY?.length > 3) {
    try {
      const u = new URL("https://v3.openstates.org/jurisdictions");
      u.searchParams.set("jurisdiction", "ocd-jurisdiction/country:us");
      u.searchParams.set("page", "1");
      u.searchParams.set("per_page", "1");
      u.searchParams.set("apikey", env.OPENSTATES_API_KEY);
      const res = await fetch(u, { headers: { "X-API-KEY": env.OPENSTATES_API_KEY } });
      if (res.ok) ok("OPENSTATES_API_KEY (v3 REST /jurisdictions)", `HTTP ${res.status}`);
      else
        fail(
          "OPENSTATES_API_KEY (v3 REST /jurisdictions)",
          `HTTP ${res.status} ${(await res.text()).slice(0, 160)}`
        );
    } catch (e) {
      fail("OPENSTATES_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("OPENSTATES_API_KEY", "not set");
  }

  // Congress.gov
  if (env.CONGRESS_GOV_API_KEY?.length > 3) {
    try {
      const u = new URL("https://api.congress.gov/v3/member");
      u.searchParams.set("api_key", env.CONGRESS_GOV_API_KEY);
      u.searchParams.set("format", "json");
      u.searchParams.set("limit", "1");
      const res = await fetch(u);
      if (res.ok) ok("CONGRESS_GOV_API_KEY", `HTTP ${res.status}`);
      else fail("CONGRESS_GOV_API_KEY", `HTTP ${res.status}`);
    } catch (e) {
      fail("CONGRESS_GOV_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("CONGRESS_GOV_API_KEY", "not set");
  }

  // OpenFEC
  if (env.OPENFEC_API_KEY?.length > 3) {
    try {
      const u = new URL("https://api.open.fec.gov/v1/candidates/");
      u.searchParams.set("api_key", env.OPENFEC_API_KEY);
      u.searchParams.set("per_page", "1");
      const res = await fetch(u);
      if (res.ok) ok("OPENFEC_API_KEY", `HTTP ${res.status}`);
      else fail("OPENFEC_API_KEY", `HTTP ${res.status}`);
    } catch (e) {
      fail("OPENFEC_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("OPENFEC_API_KEY", "not set");
  }

  // Socrata: Chicago open data (app token; may differ from Socrata vs FEC usage)
  if (env.SOCRATA_APP_TOKEN?.length > 3) {
    try {
      const u = new URL("https://data.cityofchicago.org/resource/6zsd-36xi.json");
      u.searchParams.set("$limit", "1");
      u.searchParams.set("$$app_token", env.SOCRATA_APP_TOKEN);
      const res = await fetch(u);
      if (res.ok) ok("SOCRATA_APP_TOKEN (sample: Chicago 311, app_token)", `HTTP ${res.status}`);
      else fail("SOCRATA_APP_TOKEN (sample: Chicago 311, app_token)", `HTTP ${res.status}`);
    } catch (e) {
      fail("SOCRATA_APP_TOKEN (sample: Chicago 311, app_token)", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("SOCRATA_APP_TOKEN", "not set");
  }

  // Foursquare Places v3
  if (env.FOURSQUARE_API_KEY?.length > 3) {
    try {
      const u = new URL("https://api.foursquare.com/v3/places/search");
      u.searchParams.set("query", "coffee");
      u.searchParams.set("limit", "1");
      const res = await fetch(u, { headers: { Authorization: env.FOURSQUARE_API_KEY, Accept: "application/json" } });
      if (res.ok) ok("FOURSQUARE_API_KEY (Places v3 /search)", `HTTP ${res.status}`);
      else fail("FOURSQUARE_API_KEY (Places v3 /search)", `HTTP ${res.status} ${(await res.text()).slice(0, 100)}`);
    } catch (e) {
      fail("FOURSQUARE_API_KEY (Places v3 /search)", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("FOURSQUARE_API_KEY", "not set");
  }

  // NewsAPI
  if (env.NEWSAPI_API_KEY?.length > 3) {
    try {
      const u = new URL("https://newsapi.org/v2/sources");
      u.searchParams.set("apiKey", env.NEWSAPI_API_KEY);
      u.searchParams.set("country", "us");
      const res = await fetch(u);
      const j = await res.json();
      if (res.ok && j.status === "ok") ok("NEWSAPI_API_KEY", "status=ok in JSON");
      else fail("NEWSAPI_API_KEY", j.message || j.code || `HTTP ${res.status}`);
    } catch (e) {
      fail("NEWSAPI_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("NEWSAPI_API_KEY", "not set");
  }

  // Guardian
  if (env.GUARDIAN_API_KEY?.length > 3) {
    try {
      const u = new URL("https://content.guardianapis.com/search");
      u.searchParams.set("api-key", env.GUARDIAN_API_KEY);
      u.searchParams.set("q", "news");
      u.searchParams.set("page-size", "1");
      const res = await fetch(u);
      const j = await res.json();
      if (res.ok && j?.response?.status === "ok") ok("GUARDIAN_API_KEY", "response.status=ok");
      else fail("GUARDIAN_API_KEY", j?.response?.message || `HTTP ${res.status}`);
    } catch (e) {
      fail("GUARDIAN_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("GUARDIAN_API_KEY", "not set");
  }

  // Google Civic
  if (env.GOOGLE_CIVIC_API_KEY?.length > 3) {
    try {
      const u = new URL("https://civicinfo.googleapis.com/civicinfo/v2/elections");
      u.searchParams.set("key", env.GOOGLE_CIVIC_API_KEY);
      const res = await fetch(u);
      const j = await res.json();
      if (res.ok && (j.elections || j.error?.message)) {
        if (j.error) fail("GOOGLE_CIVIC_API_KEY", j.error?.message);
        else ok("GOOGLE_CIVIC_API_KEY", "elections payload");
      } else {
        fail("GOOGLE_CIVIC_API_KEY", j.error?.message || `HTTP ${res.status}`);
      }
    } catch (e) {
      fail("GOOGLE_CIVIC_API_KEY", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("GOOGLE_CIVIC_API_KEY", "not set");
  }

  // GitHub PAT
  if (env.GITHUB_PAT?.length > 5) {
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${env.GITHUB_PAT}`, "User-Agent": "RedDirt-verify-env" },
      });
      if (res.ok) ok("GITHUB_PAT", `HTTP ${res.status}`);
      else fail("GITHUB_PAT", `HTTP ${res.status}`);
    } catch (e) {
      fail("GITHUB_PAT", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("GITHUB_PAT", "not set");
  }

  // Google OAuth client — cannot validate secret without a code exchange; at least check vars present
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    console.log(
      "[INFO] GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET: present (not verified via HTTP; use OAuth or Google Cloud test tools)"
    );
  } else {
    skip("GOOGLE_CLIENT_ID/SECRET (OAuth web client)", "not both set");
  }

  // NPPES: public, no key in env — reachability
  {
    const url = "https://npiregistry.cms.hhs.gov/api/?version=2.1&number=1003000126";
    try {
      const res = await fetch(url);
      if (res.ok) ok("NPPES (public, no key)", "reachable");
      else fail("NPPES (public, no key)", `HTTP ${res.status}`);
    } catch (e) {
      fail("NPPES (public, no key)", e instanceof Error ? e.message : String(e));
    }
  }
  if (env.TIGER_GEOCODER_BASE) {
    try {
      const b = String(env.TIGER_GEOCODER_BASE).replace(/\/$/, "");
      // 2020 locations endpoint (geographies/ path often 404s for simple oneline uses)
      const u = `${b}/geocoder/locations/onelineaddress?address=Portland%20OR&benchmark=2020&format=json`;
      const res = await fetch(u);
      if (res.ok) ok("TIGER_GEOCODER_BASE (Census oneline, benchmark=2020)", `HTTP ${res.status}`);
      else fail("TIGER_GEOCODER_BASE (Census oneline)", `HTTP ${res.status}`);
    } catch (e) {
      fail("TIGER_GEOCODER_BASE", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("TIGER_GEOCODER_BASE", "not set");
  }

  // Prisma / Postgres
  if (env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.$disconnect();
      ok("DATABASE_URL (Prisma $connect)", "connected");
    } catch (e) {
      fail("DATABASE_URL (Prisma $connect)", e instanceof Error ? e.message : String(e));
    }
  } else {
    skip("DATABASE_URL", "not set");
  }

  console.log("\n— Summary —");
  console.log(`OK: ${results.ok}  FAIL: ${results.fail}  SKIP: ${results.skip}`);
  process.exitCode = results.fail > 0 ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
