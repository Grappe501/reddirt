import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const stubUrl = pathToFileURL(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "server-only-stub.mjs"),
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return { url: stubUrl, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
