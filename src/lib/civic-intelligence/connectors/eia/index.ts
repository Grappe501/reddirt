import path from "node:path";
import type { PublicStatisticsConnector } from "../shared/contract";
import { fetchWithRetry, persistRawResponse, safeLog } from "../shared/http";
import { isUsableApiKey } from "../../env/loadPublicdataEnv";
import { resolveGeography } from "../../geography/registry";
import type {
  ConnectorValidation,
  DatasetDescriptor,
  NormalizedObservation,
  NormalizedStatisticsBatch,
  PublicStatisticsRequest,
  RawStatisticsResponse,
} from "../../types";

const SOURCE = "eia";
const BASE = "https://api.eia.gov/v2";

function keyPresent(): boolean {
  return isUsableApiKey(process.env.EIA_API_KEY);
}

function yearOnly(period: string): string {
  return period.slice(0, 4);
}

export function createEiaConnector(opts: {
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
          : ["EIA_API_KEY missing or placeholder — EIA ingest fail-closed"],
        errors: present
          ? []
          : ["EIA_API_KEY not configured or not usable (placeholder/invalid format)"],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "total-energy",
          title: "EIA Total Energy (MER MSN series)",
          frequency: "annual",
          documentationUrl: "https://www.eia.gov/opendata/browser/total-energy",
        },
        {
          code: "electricity/retail-sales",
          title: "EIA Electricity Retail Sales",
          frequency: "annual",
          documentationUrl: "https://www.eia.gov/opendata/browser/electricity/retail-sales",
        },
        {
          code: "electricity/state-electricity-profiles/summary",
          title: "EIA State Electricity Profiles Summary",
          frequency: "annual",
          documentationUrl:
            "https://www.eia.gov/opendata/browser/electricity/state-electricity-profiles",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const validation = await this.validateConfiguration();
      if (!validation.ok) {
        throw new Error(validation.errors.join("; "));
      }
      const apiKey = process.env.EIA_API_KEY!.trim();
      const route = request.dataset.replace(/^\/+|\/+$/g, "");
      const frequency = request.frequency || "annual";
      const start = yearOnly(request.period);
      const end = yearOnly(request.endPeriod || request.period);
      const dataColumns = request.dataColumns?.length ? request.dataColumns : ["value"];
      const params = new URLSearchParams();
      params.set("api_key", apiKey);
      params.set("frequency", frequency);
      params.set("start", start);
      params.set("end", end);
      params.set("sort[0][column]", "period");
      params.set("sort[0][direction]", "asc");
      params.set("offset", "0");
      params.set("length", "5000");
      for (const col of dataColumns) {
        params.append("data[]", col);
      }
      // total-energy uses msn facet from variablesOrSeries
      if (route === "total-energy" || route.startsWith("total-energy/")) {
        for (const msn of request.variablesOrSeries) {
          params.append("facets[msn][]", msn);
        }
      }
      if (request.facets) {
        for (const [facet, values] of Object.entries(request.facets)) {
          for (const v of values) {
            params.append(`facets[${facet}][]`, v);
          }
        }
      }
      const endpoint = `${BASE}/${route}/data/`;
      const url = `${endpoint}?${params.toString()}`;
      const safeParams: Record<string, string> = {
        route,
        frequency,
        start,
        end,
        series: request.variablesOrSeries.join(","),
        dataColumns: dataColumns.join(","),
        geography: request.geography,
        facets: request.facets ? JSON.stringify(request.facets) : "",
        unit: request.unit || "",
        seriesTitle: request.seriesTitle || "",
        consumerMetricId: request.consumerMetricId || "",
      };
      safeLog("eia.fetch", { endpoint, safeParams });
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
      const dataset = response.safeParams.route || "eia";
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`EIA HTTP ${response.status}`],
        };
      }
      let parsed: {
        response?: {
          data?: Array<Record<string, unknown>>;
          total?: number;
        };
        error?: string;
      };
      try {
        parsed = JSON.parse(response.bodyText);
      } catch {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Malformed EIA JSON"],
        };
      }
      if (parsed.error) {
        warnings.push(`EIA error: ${parsed.error}`);
      }
      const rows = parsed.response?.data || [];
      if (!rows.length) {
        warnings.push("EIA returned zero data rows");
      }
      const geography = resolveGeography(response.safeParams.geography || "nation");
      const seriesHint = (response.safeParams.series || "").split(",")[0] || "EIA";
      const title =
        response.safeParams.seriesTitle ||
        `EIA ${seriesHint}${response.safeParams.facets ? ` ${response.safeParams.facets}` : ""}`;
      const unit = response.safeParams.unit || "as_reported";
      const dataColumns = (response.safeParams.dataColumns || "value").split(",");
      const valueKey = dataColumns[0] || "value";
      const consumerMetricId = response.safeParams.consumerMetricId || undefined;
      const observations: NormalizedObservation[] = [];
      const isTotalEnergy =
        response.safeParams.route === "total-energy" ||
        Boolean(response.safeParams.route?.startsWith("total-energy"));

      for (const row of rows) {
        const periodRaw = String(row.period ?? "");
        if (!periodRaw) continue;
        const rawVal = row[valueKey];
        const value =
          rawVal == null || rawVal === ""
            ? null
            : Number(typeof rawVal === "string" ? rawVal : rawVal);
        const msn = row.msn != null ? String(row.msn) : seriesHint;
        // Prefer MSN for MER total-energy; otherwise stable consumer metric id
        // so warehouse arrays group cleanly for CC bind.
        const seriesCode = isTotalEnergy
          ? msn
          : consumerMetricId ||
            `${response.safeParams.route}|${response.safeParams.facets || ""}|${valueKey}|${response.safeParams.geography}`;
        observations.push({
          seriesCode,
          seriesTitle: title,
          geographyId: geography.geographyId,
          geographyType: geography.geographyType,
          geographyName: geography.name,
          period: periodRaw,
          value: Number.isFinite(value as number) ? (value as number) : null,
          unit,
          estimateType: "eia_api_v2",
          definition: `EIA Open Data v2 ${response.safeParams.route} series ${seriesCode}`,
          limitations: [
            "EIA series revisions occur; STEO-linked annuals may revise",
            "Do not treat energy production/trade as proof of public-return or prosperity-fund design",
            "Keep Arkansas and U.S. series separate unless definitions match",
          ],
          consumerMetricId,
        });
      }

      return { source: SOURCE, dataset, observations, warnings };
    },
  };
}

export function eiaRawRoot(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "raw");
}
