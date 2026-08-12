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

const SOURCE = "hrsa";
const HPSA_LAYER =
  "https://gisportal.hrsa.gov/server/rest/services/Shortage/HealthProfessionalShortageAreas_FS/MapServer/10/query";

function whereForGeography(geography: string): string {
  if (geography === "state:05") {
    return "PRIMARY_STATE_FIPS_CD='05' AND HPSA_STATUS_CD='D'";
  }
  if (geography === "nation") {
    return "HPSA_STATUS_CD='D'";
  }
  throw new Error(`Unsupported HRSA geography: ${geography}`);
}

export function createHrsaConnector(opts: {
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
          "HRSA GIS MapServer is credential-free; registered HDW web services do not expose HPSA",
          "HPSA designation population sums can overlap — not a population share",
          "No official multi-year HPSA time-series API — current snapshot only",
        ],
        errors: [],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "hpsa-primary-care-areas",
          title: "HRSA Primary Care HPSA area polygons (designated)",
          frequency: "point_in_time",
          documentationUrl:
            "https://gisportal.hrsa.gov/server/rest/services/Shortage/HealthProfessionalShortageAreas_FS/MapServer",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const dataset = request.dataset;
      if (dataset !== "hpsa-primary-care-areas") {
        throw new Error(`Unsupported HRSA dataset: ${dataset}`);
      }
      const where = whereForGeography(request.geography);
      const outStats = JSON.stringify([
        {
          statisticType: "sum",
          onStatisticField: "HPSA_DESIGNATION_POP",
          outStatisticFieldName: "pop_sum",
        },
        {
          statisticType: "sum",
          onStatisticField: "HPSA_FTE",
          outStatisticFieldName: "fte_sum",
        },
        {
          statisticType: "count",
          onStatisticField: "OBJECTID",
          outStatisticFieldName: "n",
        },
      ]);
      const params = new URLSearchParams();
      params.set("where", where);
      params.set("outStatistics", outStats);
      params.set("returnGeometry", "false");
      params.set("f", "json");
      const url = `${HPSA_LAYER}?${params.toString()}`;
      const safeParams: Record<string, string> = {
        route: dataset,
        geography: request.geography,
        series: request.variablesOrSeries.join(","),
        where,
        unit: request.unit || "",
        seriesTitle: request.seriesTitle || "",
        consumerMetricId: request.consumerMetricId || "",
        period: request.period,
      };
      safeLog("hrsa.fetch", { endpoint: HPSA_LAYER, safeParams });
      const { status, text, retryCount } = await fetchWithRetry(url);
      return persistRawResponse({
        root: opts.rawRoot,
        source: SOURCE,
        endpoint: HPSA_LAYER,
        safeParams,
        status,
        bodyText: text,
        retryCount,
        commit: opts.commit,
      });
    },
    async normalize(response: RawStatisticsResponse): Promise<NormalizedStatisticsBatch> {
      const warnings: string[] = [];
      const dataset = response.safeParams.route || "hrsa";
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`HRSA HTTP ${response.status}`],
        };
      }
      let parsed: {
        features?: Array<{ attributes?: Record<string, unknown> }>;
        error?: { message?: string };
      };
      try {
        parsed = JSON.parse(response.bodyText);
      } catch {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Malformed HRSA JSON"],
        };
      }
      if (parsed.error) {
        warnings.push(`HRSA error: ${parsed.error.message || "unknown"}`);
      }
      const attrs = parsed.features?.[0]?.attributes || {};
      const geography = resolveGeography(response.safeParams.geography || "nation");
      const period = response.safeParams.period || new Date().toISOString().slice(0, 10);
      const title = response.safeParams.seriesTitle || "HRSA primary-care HPSA areas";
      const consumerMetricId = response.safeParams.consumerMetricId || undefined;
      const seriesList = (response.safeParams.series || "COUNT").split(",").filter(Boolean);
      const limitations = [
        "HRSA GIS Primary Care HPSA area layer (designated status only)",
        "Current snapshot — no official multi-year HPSA API",
        "Designation population sums can overlap across HPSAs — not a statewide population share",
        "Primary-care HPSAs only; mental-health HPSAs are separate",
        "Designation ≠ utilization or visits delivered",
      ];
      const map: Record<string, { value: number | null; unit: string; definition: string }> = {
        COUNT: {
          value: attrs.n == null ? null : Number(attrs.n),
          unit: "hpsa_areas",
          definition: "Count of designated primary-care HPSA area polygons",
        },
        DESIGNATION_POP_SUM: {
          value: attrs.pop_sum == null ? null : Number(attrs.pop_sum),
          unit: "persons_sum_may_overlap",
          definition:
            "Sum of HPSA_DESIGNATION_POP across designated area HPSAs (overlap possible — not a population share)",
        },
        FTE_SUM: {
          value: attrs.fte_sum == null ? null : Number(attrs.fte_sum),
          unit: "fte",
          definition: "Sum of HPSA_FTE across designated primary-care area HPSAs",
        },
      };
      const observations: NormalizedObservation[] = [];
      for (const field of seriesList) {
        const spec = map[field];
        if (!spec) {
          warnings.push(`Unsupported HRSA series ${field}`);
          continue;
        }
        observations.push({
          seriesCode: field,
          seriesTitle: title,
          geographyId: geography.geographyId,
          geographyType: geography.geographyType,
          geographyName: geography.name,
          period,
          value: Number.isFinite(spec.value as number) ? (spec.value as number) : null,
          unit: response.safeParams.unit || spec.unit,
          estimateType: "hrsa_gis_hpsa_area_aggregate",
          definition: spec.definition,
          limitations,
          consumerMetricId,
        });
      }
      if (!observations.length) warnings.push("HRSA returned no usable aggregates");
      return { source: SOURCE, dataset, observations, warnings };
    },
  };
}

export function hrsaRawRoot(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "raw");
}
