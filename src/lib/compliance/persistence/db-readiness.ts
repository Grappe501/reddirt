export type DbPersistenceReadiness = {
  score: number;
  migrationRequired: boolean;
  jsonFallbackActive: boolean;
  modelsDrafted: boolean;
  summary: string;
};

export async function assessDbPersistenceReadiness(): Promise<DbPersistenceReadiness> {
  const migrationRequired = process.env.COMPLIANCE_DB_MIGRATED !== "true";
  const modelsDrafted = true;
  const jsonFallbackActive = true;
  const score = migrationRequired ? 40 : 90;
  return {
    score,
    migrationRequired,
    jsonFallbackActive,
    modelsDrafted,
    summary: migrationRequired
      ? "JSON repositories active. Prisma compliance ops models drafted — run migration plan before production DB cutover."
      : "DB-backed compliance repositories enabled.",
  };
}
