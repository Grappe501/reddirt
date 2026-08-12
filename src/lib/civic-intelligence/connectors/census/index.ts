import path from "node:path";
import type { PublicStatisticsConnector } from "../shared/contract";
import { fetchWithRetry, persistRawResponse, safeLog, sha256 } from "../shared/http";
import { isUsableApiKey } from "../../env/loadPublicdataEnv";
import { resolveGeography } from "../../geography/registry";
import type {
  ConnectorValidation,
  DatasetDescriptor,
  NormalizedStatisticsBatch,
  PublicStatisticsRequest,
  RawStatisticsResponse,
} from "../../types";

const SOURCE = "census";
const ACS5_YEAR = "2022";

function keyPresent(): boolean {
  return isUsableApiKey(process.env.CENSUS_API_KEY);
}

function acsProductPath(variable: string): string {
  if (variable.startsWith("S")) return `acs/acs5/subject`;
  if (variable.startsWith("DP")) return `acs/acs5/profile`;
  return `acs/acs5`;
}

function buildCensusUrl(
  request: PublicStatisticsRequest,
  apiKey: string,
): {
  url: string;
  safeParams: Record<string, string>;
  endpoint: string;
} {
  const geo = resolveGeography(request.geography);
  const dataset = request.dataset || "acs5";

  if (dataset === "bds" || dataset === "timeseries/bds") {
    const variable = request.variablesOrSeries[0] || "";
    const year = request.period;
    const base = "https://api.census.gov/data/timeseries/bds";
    const params = new URLSearchParams({
      get: variable,
      YEAR: year,
      key: apiKey,
    });
    if (geo.geographyType === "nation") {
      params.set("for", "us:*");
    } else if (geo.geographyType === "state" && geo.stateCode) {
      params.set("for", `state:${geo.stateCode}`);
    } else {
      throw new Error(`BDS geography not supported: ${request.geography}`);
    }
    const url = `${base}?${params.toString()}`;
    return {
      url,
      endpoint: base,
      safeParams: {
        get: variable,
        for: params.get("for") || "",
        year,
        dataset: "bds",
      },
    };
  }

  const primaryVar = request.variablesOrSeries[0] || "";
  const product = acsProductPath(primaryVar);
  const get = ["NAME", ...request.variablesOrSeries].join(",");
  const base = `https://api.census.gov/data/${ACS5_YEAR}/${product}`;
  const params = new URLSearchParams({ get, key: apiKey });
  if (geo.geographyType === "nation") {
    params.set("for", "us:*");
  } else if (geo.geographyType === "state" && geo.stateCode) {
    params.set("for", `state:${geo.stateCode}`);
  } else {
    throw new Error(`Census geography not supported: ${request.geography}`);
  }
  const url = `${base}?${params.toString()}`;
  return {
    url,
    endpoint: base,
    safeParams: {
      get,
      for: params.get("for") || "",
      year: ACS5_YEAR,
      dataset: product,
    },
  };
}

function parseCensusNumber(raw: string | undefined): number | null {
  if (raw == null || raw === "" || raw === "-" || raw === "N" || raw === "(X)") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function createCensusConnector(opts: {
  rawRoot: string;
  commit: string | null;
}): PublicStatisticsConnector {
  return {
    source: SOURCE,
    async validateConfiguration(): Promise<ConnectorValidation> {
      const present = keyPresent();
      return {
        ok: present,
        source: SOURCE,
        keyPresent: present,
        warnings: present
          ? []
          : ["CENSUS_API_KEY missing or placeholder — Census ingest fail-closed"],
        errors: present
          ? []
          : ["CENSUS_API_KEY not configured or not usable (placeholder/invalid format)"],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "acs5",
          title: "American Community Survey 5-Year Estimates",
          frequency: "annual",
          documentationUrl: "https://www.census.gov/programs-surveys/acs",
        },
        {
          code: "bds",
          title: "Business Dynamics Statistics (timeseries API)",
          frequency: "annual",
          documentationUrl: "https://www.census.gov/data/developers/data-sets/business-dynamics.html",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const validation = await this.validateConfiguration();
      if (!validation.ok) {
        throw new Error(validation.errors.join("; "));
      }
      const apiKey = process.env.CENSUS_API_KEY!.trim();
      const { url, safeParams, endpoint } = buildCensusUrl(request, apiKey);
      safeLog("census.fetch", { endpoint, safeParams });
      const { status, text, retryCount } = await fetchWithRetry(url);
      return persistRawResponse({
        root: opts.rawRoot,
        source: SOURCE,
        endpoint,
        safeParams,
        status,
        bodyText: text,
        retryCount,
        commit: opts.commit,
      });
    },
    async normalize(response: RawStatisticsResponse): Promise<NormalizedStatisticsBatch> {
      const warnings: string[] = [];
      const dataset = response.safeParams.dataset || "acs5";
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`Census HTTP ${response.status}`],
        };
      }
      if (/^\s*</.test(response.bodyText)) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Census returned HTML instead of JSON (check dataset path / API key)"],
        };
      }
      let rows: string[][];
      try {
        rows = JSON.parse(response.bodyText) as string[][];
      } catch {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Malformed Census JSON"],
        };
      }
      if (!Array.isArray(rows) || rows.length < 2) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Empty Census response"],
        };
      }
      const headers = rows[0];
      const geoFor = response.safeParams.for || "";
      const geography = geoFor.startsWith("state:")
        ? resolveGeography(`state:${geoFor.split(":")[1]}`)
        : resolveGeography("nation");

      const isBds = dataset === "bds";
      const yearIdx = headers.findIndex((h) => h === "YEAR" || h === "year");
      const observations = [];
      const dataRows = rows.slice(1);
      for (const values of dataRows) {
        const rowYear =
          yearIdx >= 0 ? values[yearIdx] : response.safeParams.year || (isBds ? "" : ACS5_YEAR);
        for (let i = 0; i < headers.length; i += 1) {
          const code = headers[i];
          if (
            code === "NAME" ||
            code === "state" ||
            code === "us" ||
            code === "YEAR" ||
            code === "year"
          ) {
            continue;
          }
          if (!isBds && (code.endsWith("M") || code.endsWith("MA") || code.endsWith("EA"))) {
            continue;
          }
          const value = parseCensusNumber(values[i]);
          const moeIdx = headers.indexOf(
            code.endsWith("E") ? `${code.slice(0, -1)}M` : `${code}M`,
          );
          const moe = !isBds && moeIdx >= 0 ? parseCensusNumber(values[moeIdx]) : null;
          observations.push({
            seriesCode: code,
            seriesTitle: isBds ? `BDS ${code}` : `ACS5 ${code}`,
            geographyId: geography.geographyId,
            geographyType: geography.geographyType,
            geographyName: geography.name,
            period: String(rowYear),
            value,
            marginOfError: moe,
            unit: isBds
              ? code.includes("RATE")
                ? "percent"
                : "count"
              : "as_reported",
            estimateType: isBds ? "bds_annual" : "acs5_estimate",
            definition: isBds
              ? `Census Business Dynamics Statistics variable ${code}`
              : `Census ACS 5-Year variable ${code}`,
            limitations: isBds
              ? [
                  "BDS annual establishment/firm dynamics; do not confuse with Business Formation Statistics (BFS)",
                  "Economy-wide national cell unless geography explicitly narrower",
                ]
              : [
                  "ACS 5-Year estimate; do not mix with ACS 1-Year without disclosure",
                  "Margins of error stored when provided",
                ],
          });
        }
      }

      return {
        source: SOURCE,
        dataset,
        observations,
        warnings,
      };
    },
  };
}

export function censusCanonicalQuery(safeParams: Record<string, string>): string {
  if (safeParams.dataset === "bds") {
    return `census|bds|${safeParams.year}|${safeParams.get}|${safeParams.for}`;
  }
  return `census|acs5|${safeParams.year}|${safeParams.get}|${safeParams.for}`;
}

export function censusQueryChecksum(safeParams: Record<string, string>): string {
  return sha256(censusCanonicalQuery(safeParams));
}

export function censusRawRoot(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "raw");
}
