/**
 * Stop Compose services (keeps volumes by default).
 * Usage: npm run stack:down
 */
const { execSync } = require("child_process");
const path = require("path");

process.chdir(path.join(__dirname, ".."));
execSync("docker compose down", { stdio: "inherit", shell: true });
