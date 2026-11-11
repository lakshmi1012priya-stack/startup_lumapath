# Implementation Plan — LumaPath AWS & GitHub Integration

## Codebase Summary (read before implementing)

- **Project root:** `c:\Users\laksh\OneDrive\Attachments\Desktop\LumaPath`
- **Stack:** Next.js 14.2.5 App Router, TypeScript strict, Tailwind CSS 3, `@/` alias = project root
- **Existing pages:** `app/page.tsx`, `app/pay/page.tsx`, `app/bride/page.tsx`, `app/groom/page.tsx`, `app/ledger/page.tsx` — all `'use client'`
- **Existing components:** `components/Navbar.tsx`, `components/Footer.tsx`, `components/ReceiptModal.tsx`
- **Data model:** `Submission { transactionId, name, address, phone, amount, allocation, paymentMode, timestamp, event }` stored in `localStorage('moi_submissions')`
- **Build commands:** `npm run lint` (ESLint), `npm run build` (Next.js / tsc)
- **Shell note (Windows/PowerShell):** chain commands with `;` not `&&`

---

## Implementation Order

```
FEAT-001 (AWS packages + lib files)
  └─ FEAT-002 (API routes + middleware)  ← depends on lib/ from FEAT-001
       └─ FEAT-003 (login page + updated frontend)  ← depends on API routes
FEAT-004 (GitHub Actions + docs)  ← independent, run last
```

---

- [ ] 1. **Install AWS SDK packages**
      Run from project root: `npm install @aws-sdk/client-dynamodb@3.620.0 @aws-sdk/lib-dynamodb@3.620.0 @aws-sdk/client-s3@3.620.0 @aws-sdk/client-ses@3.620.0 @aws-sdk/client-cognito-identity-provider@3.620.0 @aws-sdk/s3-request-presigner@3.620.0`
      Files: `package.json`, `package-lock.json` (auto-updated)
      Verify: `npm run build` exits 0.

- [ ] 2. **Update .gitignore and create .env.local.example**
      Replace `.gitignore` with: `node_modules/`, `.next/`, `.env.local`, `.env*.local`, `*.pem`, `.vercel/`, `coverage/`
      Create `.env.local.example` with all 10 required env vars (placeholder values, never real credentials):
      `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DYNAMODB_TABLE_NAME`, `S3_BUCKET_NAME`, `SES_FROM_EMAIL`, `SES_REPLY_TO`, `ADMIN_SECRET`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
      Files: `.gitignore`, `.env.local.example`
      Verify: Both files created, `npm run build` still exits 0.

- [ ] 3. **Create lib/dynamodb.ts**
      Export `Submission` interface (canonical type used by all API routes).
      Export `getDynamoClient()` → `DynamoDBDocumentClient | null` (returns null if `AWS_ACCESS_KEY_ID` is falsy — allows CI builds without real creds).
      Export `DYNAMODB_TABLE_NAME` constant.
      Export `putSubmission(s: Submission): Promise<void>` — no-op if client is null, wrapped in try/catch.
      Export `getSubmissions(): Promise<Submission[]>` — ScanCommand, sort desc by timestamp, return `[]` on error or null client.
      Export `getSubmissionById(id: string): Promise<Submission | null>` — GetCommand, return null on error or null client.
      Uses `@aws-sdk/lib-dynamodb` PutCommand / ScanCommand / GetCommand.
      Files: `lib/dynamodb.ts`
      Verify: `npm run build` exits 0 (no TypeScript errors, no throw at import time).

- [ ] 4. **Create lib/s3.ts**
      Export `uploadReceiptToS3(transactionId: string, pngBuffer: Buffer): Promise<string | null>`.
      Uses `@aws-sdk/client-s3` `PutObjectCommand`. Bucket from `S3_BUCKET_NAME` env. Key: `receipts/{transactionId}.png`.
      Returns S3 URL on success, null on error or missing creds. Never throws.
      Files: `lib/s3.ts`
      Verify: `npm run build` exits 0.

- [ ] 5. **Create lib/ses.ts**
      Export `sendReceiptEmail(submission: Submission, toEmail?: string): Promise<void>`.
      Uses `@aws-sdk/client-ses` `SendEmailCommand`. Source from `SES_FROM_EMAIL` env.
      Sends a branded HTML email with LumaPath violet/emerald styling and a receipt table.
      No-op immediately if `AWS_ACCESS_KEY_ID` or `SES_FROM_EMAIL` is falsy. Never throws.
      Import `Submission` from `./dynamodb`.
      Files: `lib/ses.ts`
      Verify: `npm run build` exits 0.

- [ ] 6. **Create lib/cognito.ts**
      Export `verifyAdminPassword(password: string): boolean` — compares against `ADMIN_SECRET` env var.
      Export `generateSessionToken(): string` — base64-encodes JSON `{iat: Date.now(), exp: Date.now()+86400000}`.
      Export `verifySessionToken(token: string): boolean` — decodes base64 JSON, checks `exp > Date.now()`, returns false on parse error.
      Import (but do not instantiate unless `COGNITO_USER_POOL_ID` is set) `CognitoIdentityProviderClient` from `@aws-sdk/client-cognito-identity-provider`.
      **Critical:** `generateSessionToken` and `verifySessionToken` must only use `btoa`/`atob` or `Buffer.from`/`toString('base64')` — no Node crypto — so the same logic can be inlined in middleware edge code.
      Files: `lib/cognito.ts`
      Verify: `npm run build` exits 0.

- [ ] 7. **Create API route: app/api/submissions/route.ts**
      **GET** handler: calls `getSubmissions()`, returns `NextResponse.json(submissions)`.
      **POST** handler: validates body fields (400 on missing/invalid), generates `transactionId` as `'MOI-' + String(Date.now()).slice(-6).padStart(6,'0')`, builds `Submission` object, calls `putSubmission()`, fire-and-forgets `sendReceiptEmail()`, returns `NextResponse.json({ success: true, submission }, { status: 201 })`.
      Explicit TypeScript return type `Promise<NextResponse>` on both handlers.
      Files: `app/api/submissions/route.ts`
      Verify: `npm run build` exits 0.

- [ ] 8. **Create API route: app/api/submissions/[id]/route.ts**
      **GET** handler with `{ params: { id: string } }`: calls `getSubmissionById(params.id)`, returns 404 if null.
      Files: `app/api/submissions/[id]/route.ts`
      Verify: `npm run build` exits 0.

- [ ] 9. **Create API route: app/api/export/route.ts**
      **GET** handler: calls `getSubmissions()`, builds CSV with header row and one row per submission (name/address fields double-quoted with internal double-quotes escaped).
      Returns `new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="master-ledger.csv"' } })`.
      Files: `app/api/export/route.ts`
      Verify: `npm run build` exits 0.

- [ ] 10. **Create API routes: app/api/auth/login/route.ts and app/api/auth/logout/route.ts**
       **login POST:** validates body `{ password }`, calls `verifyAdminPassword`, on success calls `generateSessionToken`, sets httpOnly `lumapath_auth` cookie (`secure: production`, `sameSite: lax`, `maxAge: 86400`), returns `{ success: true }`. On failure returns 401.
       **logout POST:** clears `lumapath_auth` cookie by setting `maxAge: 0`, returns `{ success: true }`.
       Files: `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`
       Verify: `npm run build` exits 0.

- [ ] 11. **Create middleware.ts at project root**
       Uses `NextRequest`, `NextResponse` from `'next/server'` only (edge-compatible, no Node.js imports).
       Protected routes: `/bride`, `/groom`, `/ledger`.
       Token verification inlined (do NOT import from `lib/cognito.ts` to avoid bundling Node.js modules into the edge runtime): get cookie value, decode with `atob()`, parse JSON, check `exp > Date.now()`. If invalid, `NextResponse.redirect(new URL('/login', request.url))`.
       Export `config = { matcher: ['/bride', '/groom', '/ledger'] }`.
       Files: `middleware.ts`
       Verify: `npm run build` exits 0 (Next.js validates middleware edge compatibility at build time).

- [ ] 12. **Create app/login/page.tsx**
       `'use client'` page. Centered dark-themed card on `bg-slate-900`. LumaPath logo block at top (violet-600 'L' square, bold 'LumaPath', violet-400 'Digital Moi Express' subtext). Password input + 'Access Dashboard' button (violet-600 full-width). On submit: POST to `/api/auth/login`, on 200 `router.push('/ledger')`, on error show inline red error. Back-to-home link in slate-400. No imports from `lib/`.
       Files: `app/login/page.tsx`
       Verify: `npm run build` exits 0.

- [ ] 13. **Update app/pay/page.tsx — API-first with localStorage fallback**
       Make `handleSubmit` async. Try `POST /api/submissions` with body `{ name, address, phone, amount: parseInt(amountStr,10), allocation, paymentMode }`. On 201 use `submission` from response. On network error or non-201: execute existing localStorage logic unchanged (generate ID from `moi_tx_counter`, build submission, push to `moi_submissions`). The existing disabled-button spinner text covers loading UX. Keep all JSX unchanged.
       Files: `app/pay/page.tsx`
       Verify: `npm run build` exits 0.

- [ ] 14. **Update app/bride/page.tsx — API fetch with localStorage fallback**
       Add `import { useRouter } from 'next/navigation'`. In `useEffect`: try `fetch('/api/submissions')`. On 401 → `router.push('/login')`. On 200 → `setSubmissions(await res.json())`. On catch → `setSubmissions(JSON.parse(localStorage.getItem('moi_submissions') ?? '[]'))`. Keep all filtering/sorting/rendering JSX unchanged.
       Files: `app/bride/page.tsx`
       Verify: `npm run build` exits 0.

- [ ] 15. **Update app/groom/page.tsx — same pattern as bride**
       Identical fetch pattern to Step 14. Keep all JSX unchanged.
       Files: `app/groom/page.tsx`
       Verify: `npm run build` exits 0.

- [ ] 16. **Update app/ledger/page.tsx — API fetch + API export**
       Fetch pattern in `useEffect` same as bride/groom (Steps 14–15).
       Update `handleExportCSV`: try `fetch('/api/export')`, on success `const blob = await res.blob()`, create object URL, trigger download as `master-ledger-{Date.now()}.csv`. On network error fall back to existing client-side CSV build.
       Files: `app/ledger/page.tsx`
       Verify: `npm run build` exits 0.

- [ ] 17. **Create .github/workflows/deploy.yml**
       Trigger: `push` and `pull_request` targeting `main`.
       Job 1 `lint-and-build` (ubuntu-latest): `actions/checkout@v4` → `actions/setup-node@v4` (node 20, npm cache) → `npm ci` → `npm run lint` → `npm run build` with env `AWS_REGION: ap-south-1`, `DYNAMODB_TABLE_NAME: MoiSubmissions`, `S3_BUCKET_NAME: lumapath-receipts`, `ADMIN_SECRET: ci-placeholder`, `NEXTAUTH_SECRET: ci-placeholder`.
       Job 2 `deploy` (needs: lint-and-build, only on push to main): `actions/checkout@v4` → install vercel CLI → `vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}` → `vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}` → `vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}`.
       Files: `.github/workflows/deploy.yml`
       Verify: `npm run build` exits 0 (workflow file not executed locally; validate YAML structure by visual review or `npx js-yaml .github/workflows/deploy.yml`).

- [ ] 18. **Create docs/aws-setup.md**
       Step-by-step instructions for: DynamoDB table (partition key `transactionId`, sort key `timestamp`, GSI `allocation-index` on `allocation`), S3 bucket policy, SES domain verify + sandbox exit, IAM user minimal-permission inline policy, Vercel environment variable configuration, GitHub secret `VERCEL_TOKEN`.
       Files: `docs/aws-setup.md`
       Verify: `npm run build` exits 0.

- [ ] 19. **Create docs/aws-architecture.md**
       ASCII architecture diagram (Browser → Vercel Edge middleware → API Routes → DynamoDB / S3 / SES) plus description of each component and a note on graceful localStorage degradation when AWS creds are absent.
       Files: `docs/aws-architecture.md`
       Verify: `npm run build` exits 0.

- [ ] 20. **Full build verification and fix any remaining TypeScript errors**
       Run `npm run lint` — fix any ESLint errors (most likely `any` types or unused imports).
       Run `npm run build` — fix any remaining TypeScript or Next.js build errors.
       Common issues to anticipate: (a) middleware.ts importing anything that uses Node.js APIs — keep it pure edge code; (b) API route handlers missing `export const dynamic = 'force-dynamic'` if Next.js static analysis is too aggressive; (c) `Submission` type mismatch between lib/dynamodb.ts and pages — ensure pages import the type from `@/lib/dynamodb`; (d) `btoa`/`atob` not available in some TypeScript lib targets — if needed, use `Buffer.from(...).toString('base64')` in `lib/cognito.ts` (Node.js environment) and inline `atob`/`btoa` only in `middleware.ts` (edge environment).
       Files: any files with errors
       Verify: `npm run lint` exits 0, `npm run build` exits 0 with no errors or warnings.

---

## Dependency Graph Summary

```
Step 1  (npm install)
Step 2  (.gitignore, .env.local.example)
Steps 3–6  (lib/ files) — can be written in parallel, all independent
Step 7  (submissions POST/GET) — needs Steps 3,5
Step 8  (submissions/[id] GET) — needs Step 3
Step 9  (export GET) — needs Step 3
Steps 10  (auth routes) — needs Step 6
Step 11  (middleware) — needs nothing from lib at runtime (inlined logic)
Step 12  (login page) — needs Step 10 to exist for POST target
Steps 13–16  (frontend updates) — need Steps 7,9,10 to exist
Step 17  (GitHub Actions) — independent
Steps 18–19  (docs) — independent
Step 20  (final build fix) — last
```
