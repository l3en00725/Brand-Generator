# Security dependency remediation — 2026-10-22

Next.js 15.5.28, compatible React 19.2.4, and refreshed dependencies remove all matches in the local October 21 OSV npm snapshot plus supplemental advisories. Scoped Next.js overrides select PostCSS 8.5.23 and Sharp 0.35.5 instead of retained affected copies. This describes the checked-in npm lockfile, not the production deployment.

Validation: clean `npm ci --ignore-scripts --no-audit` passed on Node 24.22.1. The production build compiled application bundles, then failed type checking at `api/chat.ts:1`: missing `@vercel/node` types. The baseline manifest does not declare that package either; an original-version baseline build has not been reproduced. Do not treat this draft as release-ready.

Before merge, resolve the missing dependency, rerun the full production build, and test an approved isolated preview of the AI routes and image processing. No real provider calls or credentials were used here. Verify the actual deployed Node patch and commit after an authorized release.

Rollback: revert this dependency commit and restore the preceding deployment artifact. Keep package.json and package-lock.json together. The old artifact reintroduces the previous security findings, so rollback is temporary and requires compensating exposure controls.
