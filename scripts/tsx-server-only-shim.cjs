/**
 * CJS preload for tsx sandbox — must patch Module._load synchronously before tsx starts.
 */
const Module = require("node:module");
const path = require("node:path");

const originalLoad = Module._load;
const isServerOnlyRequest = (request) => {
  const normalized = String(request).replace(/\\/g, "/");
  return (
    request === "server-only" ||
    normalized.includes("/server-only/") ||
    normalized.endsWith("/server-only")
  );
};

Module._load = function tsxServerOnlyShim(request, parent, isMain) {
  if (isServerOnlyRequest(request)) {
    return {};
  }
  return originalLoad.apply(this, arguments);
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function patchedRequire(request) {
  if (isServerOnlyRequest(request)) {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

const registerPath = path.join(__dirname, "tsx-server-only-register.mjs");

function sandboxNodeOptions() {
  const prior = process.env.NODE_OPTIONS?.trim() ?? "";
  const requireFlag = `--require ${path.join(__dirname, "tsx-server-only-shim.cjs")}`;
  const importFlag = `--import ${registerPath}`;
  let merged = prior;
  if (!merged.includes("tsx-server-only-shim.cjs")) {
    merged = [merged, requireFlag].filter(Boolean).join(" ");
  }
  if (!merged.includes("tsx-server-only-register.mjs")) {
    merged = [merged, importFlag].filter(Boolean).join(" ");
  }
  return merged;
}

module.exports = { sandboxNodeOptions, registerPath };
