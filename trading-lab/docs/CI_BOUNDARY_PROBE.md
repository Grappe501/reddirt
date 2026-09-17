# Trading Lab CI Boundary Probe

This file exists as a path-scoped CI proof artifact for the standalone Trading Lab.

A commit that changes only `trading-lab/**` must trigger **Trading Lab CI** and must not require the repository-wide RedDirt Next.js quality or production-build gates.

The separation is intentional: Trading Lab is a standalone Vite/Netlify application with its own build, tests, Netlify Functions, and Netlify Database migrations. It does not compile through the RedDirt campaign application's root Next.js build.

Proof date: 2026-09-16.
