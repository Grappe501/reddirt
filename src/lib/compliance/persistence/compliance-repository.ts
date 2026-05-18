import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type ComplianceJsonRepository<T> = {
  load: () => Promise<T>;
  save: (value: T) => Promise<void>;
};

export function createJsonRepository<T>(relativePath: string, fallback: T): ComplianceJsonRepository<T> {
  const filePath = path.join(process.cwd(), relativePath);
  return {
    async load() {
      try {
        return JSON.parse(await readFile(filePath, "utf8")) as T;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
        throw error;
      }
    },
    async save(value) {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    },
  };
}

export async function loadWithDbFallback<T>(jsonRepo: ComplianceJsonRepository<T>, dbLoader?: () => Promise<T | null>): Promise<T> {
  if (process.env.COMPLIANCE_DB_MIGRATED === "true" && dbLoader) {
    const dbValue = await dbLoader();
    if (dbValue) return dbValue;
  }
  return jsonRepo.load();
}
