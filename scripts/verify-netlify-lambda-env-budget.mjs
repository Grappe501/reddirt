#!/usr/bin/env node
/** @deprecated Use verify-netlify-lambda-env-budget.cjs */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("./verify-netlify-lambda-env-budget.cjs");
