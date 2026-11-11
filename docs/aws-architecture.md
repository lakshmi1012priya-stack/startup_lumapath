# AWS Architecture — LumaPath / Digital Moi Express

## System Overview

LumaPath is a Next.js 14 App Router application hosted on Vercel. AWS services handle persistent storage, file archiving, and transactional email. The app degrades gracefully to `localStorage` when AWS credentials are absent (CI environment or local development without `.env.local`).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT                                    │
│                      Browser (Mobile/Desktop)                        │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                           │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              middleware.ts — Auth Check                      │   │
│   │   (validates ADMIN_SECRET for protected /admin routes)       │   │
│   └───────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│   ┌───────────────────────────▼─────────────────────────────────┐   │
│   │              Next.js API Routes (app/api/*)                  │   │
│   │   POST /api/submit  · GET /api/submissions · POST /api/email │   │
│   └───┬───────────────────────┬──────────────────┬──────────────┘   │
└───────┼───────────────────────┼──────────────────┼──────────────────┘
        │                       │                  │
        │ PutItem / Query       │ PutObject        │ SendEmail
        ▼                       ▼                  ▼
┌───────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│   DynamoDB    │   │        S3         │   │        SES          │
│               │   │                  │   │                     │
│ MoiSubmissions│   │ lumapath-receipts│   │ noreply@lumapath.com│
│  (ap-south-1) │   │   (ap-south-1)   │   │   (ap-south-1)      │
│               │   │                  │   │                     │
│ PK: transId   │   │ receipt-{id}.png │   │ Guest receipt email │
│ SK: timestamp │   │                  │   │                     │
│ GSI: alloc.   │   │                  │   │                     │
└───────────────┘   └───────────────────┘   └─────────────────────┘

                        CI / CD Pipeline
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                                │
│                                                                      │
│  push / PR → main                                                    │
│       │                                                              │
│       ▼                                                              │
│  Job 1: lint-and-build (ubuntu-latest)                               │
│    npm ci → npm run lint → npm run build                             │
│    (CI env vars: AWS_REGION, DYNAMODB_TABLE_NAME, etc.)              │
│       │                                                              │
│       │  on push to main only                                        │
│       ▼                                                              │
│  Job 2: deploy (ubuntu-latest)                                       │
│    vercel pull → vercel build --prod → vercel deploy --prebuilt      │
│    (uses secrets.VERCEL_TOKEN)                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Descriptions

### Vercel (Hosting + Edge Middleware)

Vercel serves the Next.js application globally via its CDN edge network. Static pages and assets are cached at the edge for sub-millisecond response. `middleware.ts` runs at the edge before any request reaches an API route — it validates the `ADMIN_SECRET` header for protected administration endpoints. All environment variables (AWS credentials, secrets) are stored encrypted in Vercel's environment variable store and injected at runtime.

### DynamoDB — MoiSubmissions (Single-Table Design)

DynamoDB is the primary datastore for all gift submissions.

- **Partition key:** `transactionId` (String) — unique per submission, format `MOI-XXXXXX`
- **Sort key:** `timestamp` (String) — ISO-8601 datetime string, enables time-range queries
- **Global Secondary Index — `allocation-index`:** partition key `allocation` (String: `Both`, `Bride`, or `Groom`) — enables the bride/groom split-dashboard queries without a full table scan
- **Billing mode:** On-demand (pay-per-request) — scales to zero cost when idle

Each item stores the full submission shape: `{ transactionId, name, address, phone, amount, allocation, paymentMode, timestamp, event }`.

### S3 — lumapath-receipts (Receipt PNG Archive)

After a submission is processed, the API route renders the digital receipt as a PNG (using `html-to-image` on the client, or a server-side canvas equivalent) and uploads it to `lumapath-receipts` as `receipt-{transactionId}.png`. The bucket has all public access blocked; objects are accessible only via presigned URLs generated server-side when the guest or host requests a receipt download.

### SES — Transactional Email

Amazon SES dispatches the digital receipt to the guest's email address (if provided) using the verified sender `noreply@lumapath.com`. The email contains the transaction ID, gift amount, and a link to download the receipt PNG from S3 via a presigned URL. SES is used in production mode (sandbox exit required — see `aws-setup.md`).

### GitHub Actions (CI → Vercel Deploy)

Two-job pipeline defined in `.github/workflows/deploy.yml`:

1. **lint-and-build** — runs on every push and pull request to `main`. Installs dependencies, lints with ESLint, and runs `next build` with placeholder CI environment variables so the build succeeds without real AWS credentials.
2. **deploy** — runs only on direct pushes to `main` (not PRs). Uses the official Vercel CLI to pull production environment variables from Vercel, build the production bundle, and deploy it. Requires `VERCEL_TOKEN` stored as a GitHub repository secret.

---

## Graceful Degradation (localStorage Fallback)

When `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` environment variables are absent (local development without `.env.local`, or CI), all AWS SDK calls return `null` or no-op gracefully. Submissions are instead written to `localStorage` under the key `moi_submissions` and remain fully functional in the browser. This ensures:

- `npm run build` exits 0 in CI without real credentials
- Local development works offline without an AWS account
- Data automatically syncs to DynamoDB when credentials become available (on the next full page load with a valid backend)
