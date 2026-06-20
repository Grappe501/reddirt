import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./tsx-server-only-resolve-hook.mjs", import.meta.url);
