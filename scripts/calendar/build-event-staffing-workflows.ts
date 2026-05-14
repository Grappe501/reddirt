import { spawn } from "node:child_process";

const steps = [
  ["calendar:staffing:build", "build staffing plans and assignments"],
  ["calendar:callouts:build", "build volunteer callout drafts"],
  ["calendar:reminders:build", "build volunteer reminder drafts"],
] as const;

function runScript(script: string, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Running ${script}: ${label}`);
    const child = spawn("npm", ["run", script], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  for (const [script, label] of steps) {
    await runScript(script, label);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
