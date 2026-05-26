import fs from "node:fs";
import path from "node:path";
import type {
  CandidateTimeAllocationFile,
  CountyResourcePressureFile,
  EventROIModelFile,
  FieldCoverageReadinessFile,
  ResourceAllocationModelFile,
  ResourceAllocationReadinessFile,
  TravelPriorityMapFile,
} from "./resourceAllocationTypes";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

export function loadResourceAllocationModel(): ResourceAllocationModelFile {
  return readJson<ResourceAllocationModelFile>("data/resource-allocation/resource-allocation-model.json");
}

export function loadCandidateTimeAllocation(): CandidateTimeAllocationFile {
  return readJson<CandidateTimeAllocationFile>("data/resource-allocation/candidate-time-allocation.json");
}

export function loadFieldCoverageReadiness(): FieldCoverageReadinessFile {
  return readJson<FieldCoverageReadinessFile>("data/resource-allocation/field-coverage-readiness.json");
}

export function loadCountyResourcePressureTable(): CountyResourcePressureFile {
  return readJson<CountyResourcePressureFile>("data/resource-allocation/county-resource-pressure-table.json");
}

export function loadEventROIModel(): EventROIModelFile {
  return readJson<EventROIModelFile>("data/resource-allocation/event-roi-model.json");
}

export function loadTravelPriorityMap(): TravelPriorityMapFile {
  return readJson<TravelPriorityMapFile>("data/resource-allocation/travel-priority-map.json");
}

export function loadResourceAllocationReadiness(): ResourceAllocationReadinessFile {
  return readJson<ResourceAllocationReadinessFile>("data/audit/resource-allocation-readiness-table.json");
}

