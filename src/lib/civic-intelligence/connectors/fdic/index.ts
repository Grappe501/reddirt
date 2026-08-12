import path from "node:path";
import type { PublicStatisticsConnector } from "../shared/contract";
import { fetchWithRetry, persistRawResponse, safeLog } from "../shared/http";
import { resolveGeography } from "../../geography/registry";
import type {
  ConnectorValidation,
  DatasetDescriptor,
  NormalizedObservation,
  NormalizedStatisticsBatch,
  PublicStatisticsRequest,
  RawStatisticsResponse,
} from "../../types";

const SOURCE = "fdic";
const BASE = "https://api.fdic.gov/banks";

function stnameForGeography(geography: string): string {
  if (geography === "state:05") return "Arkansas";
  if (geography === "nation") return "U.S. States and DC";
  throw new Error(`Unsupported FDIC geography: ${geography}`);
}

function stalpForGeography(geography: string): string | null {
  if (geography === "state:05") return "AR";
  if (geography === "nation") return null;
  throw new Error(`Unsupported FDIC geography: ${geography}`);
}

export function createFdicConnector(opts: {
  rawRoot: string;
  commit: string | null;
}): PublicStatisticsConnector {
  return {
    source: SOURCE,
    async validateConfiguration(): Promise<ConnectorValidation> {
      return {
        ok: true,
        source: SOURCE,
        keyPresent: true,
        warnings: [
          "FDIC BankFind api_key is optional; connector uses credential-free public endpoints",
          "CB_SI:CB = commercial banks, not FDIC community-bank (CB:1) definition",
        ],
        errors: [],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "summary",
          title: "FDIC BankFind historical summary (banks/branches/deposits)",
          frequency: "annual",
          documentationUrl: "https://api.fdic.gov/banks/docs",
        },
        {
          code: "institutions",
          title: "FDIC BankFind institutions (current snapshot)",
          frequency: "point_in_time",
          documentationUrl: "https://api.fdic.gov/banks/docs",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const dataset = request.dataset.replace(/^\/+|\/+$/g, "");
      const params = new URLSearchParams();
      params.set("format", "json");
      params.set("limit", dataset === "summary" ? "500" : "1");
      let endpoint = `${BASE}/${dataset}`;

      if (dataset === "summary") {
        const stname = stnameForGeography(request.geography);
        const cbSi = request.facets?.CB_SI?.[0] || "CB";
        params.set("filters", `STNAME:"${stname}" AND CB_SI:${cbSi}`);
        params.set("fields", "STNAME,YEAR,BANKS,BRANCHES,OFFICES,DEP,CB_SI");
        params.set("sort_by", "YEAR");
        params.set("sort_order", "ASC");
      } else if (dataset === "institutions") {
        const stalp = stalpForGeography(request.geography);
        const parts = ["ACTIVE:1"];
        if (stalp) parts.push(`STALP:"${stalp}"`);
        if (request.facets?.CB?.[0] === "1") parts.push("CB:1");
        params.set("filters", parts.join(" AND "));
        params.set("fields", "CERT,DEP,CB,STALP");
        params.set("total_fields", "DEP");
      } else {
        throw new Error(`Unsupported FDIC dataset: ${dataset}`);
      }

      const url = `${endpoint}?${params.toString()}`;
      const safeParams: Record<string, string> = {
        route: dataset,
        geography: request.geography,
        series: request.variablesOrSeries.join(","),
        facets: request.facets ? JSON.stringify(request.facets) : "",
        unit: request.unit || "",
        seriesTitle: request.seriesTitle || "",
        consumerMetricId: request.consumerMetricId || "",
        period: request.period,
        endPeriod: request.endPeriod || "",
        filters: params.get("filters") || "",
      };
      safeLog("fdic.fetch", { endpoint, safeParams });
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
      const dataset = response.safeParams.route || "fdic";
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`FDIC HTTP ${response.status}`],
        };
      }
      let parsed: {
        meta?: { total?: number };
        totals?: { DEP?: number; count?: number };
        data?: Array<{ data?: Record<string, unknown> } | Record<string, unknown>>;
      };
      try {
        parsed = JSON.parse(response.bodyText);
      } catch {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Malformed FDIC JSON"],
        };
      }

      const geography = resolveGeography(response.safeParams.geography || "nation");
      const seriesList = (response.safeParams.series || "BANKS").split(",").filter(Boolean);
      const title = response.safeParams.seriesTitle || `FDIC ${dataset}`;
      const unit = response.safeParams.unit || "as_reported";
      const consumerMetricId = response.safeParams.consumerMetricId || undefined;
      const observations: NormalizedObservation[] = [];
      const limitations = [
        "FDIC BankFind Suite public API",
        "CB_SI:CB is commercial banks — not identical to FDIC community-bank (CB:1) definition",
        "DEP amounts are FDIC $ thousands unless converted at bind time",
        "Do not treat bank/branch/deposit structure as proof of community prosperity accounts",
      ];

      if (dataset === "summary") {
        const start = Number(response.safeParams.period || "1934");
        const end = Number(response.safeParams.endPeriod || "2099");
        const rows = parsed.data || [];
        for (const rowWrap of rows) {
          const row = (rowWrap as { data?: Record<string, unknown> }).data || (rowWrap as Record<string, unknown>);
          const year = Number(row.YEAR);
          if (!Number.isFinite(year) || year < start || year > end) continue;
          for (const field of seriesList) {
            const raw = row[field];
            const value =
              raw == null || raw === ""
                ? null
                : Number(typeof raw === "string" ? raw : raw);
            observations.push({
              seriesCode: field,
              seriesTitle: title,
              geographyId: geography.geographyId,
              geographyType: geography.geographyType,
              geographyName: geography.name,
              period: String(year),
              value: Number.isFinite(value as number) ? (value as number) : null,
              unit,
              estimateType: "fdic_bankfind_summary",
              definition: `FDIC BankFind /summary field ${field} for ${row.STNAME} (CB_SI=${row.CB_SI})`,
              limitations,
              consumerMetricId,
            });
          }
        }
        if (!observations.length) warnings.push("FDIC summary returned zero in-range rows");
      } else if (dataset === "institutions") {
        const period = response.safeParams.period || new Date().toISOString().slice(0, 10);
        const totalCount = Number(parsed.meta?.total ?? parsed.totals?.count ?? 0);
        const totalDep = Number(parsed.totals?.DEP ?? NaN);
        const cbFacet = /CB:1/.test(response.safeParams.filters || "");
        for (const field of seriesList) {
          let value: number | null = null;
          if (field === "COUNT" || field === "BANKS") value = totalCount;
          else if (field === "DEP") value = Number.isFinite(totalDep) ? totalDep : null;
          else warnings.push(`Unsupported institutions field ${field}`);
          // Include CB vs ACTIVE in seriesCode so warehouse upsert does not collapse snapshots.
          const seriesCode =
            consumerMetricId || `${field}|${cbFacet ? "CB1" : "ACTIVE"}|${geography.geographyId}`;
          observations.push({
            seriesCode,
            seriesTitle: title,
            geographyId: geography.geographyId,
            geographyType: geography.geographyType,
            geographyName: geography.name,
            period,
            value,
            unit,
            estimateType: "fdic_bankfind_institutions_snapshot",
            definition: `FDIC BankFind /institutions aggregate ${field} (${response.safeParams.filters})`,
            limitations: [
              ...limitations,
              "Institutions endpoint is a current snapshot — not a historical path",
            ],
            consumerMetricId,
          });
        }
      }

      return { source: SOURCE, dataset, observations, warnings };
    },
  };
}

export function fdicRawRoot(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "raw");
}
