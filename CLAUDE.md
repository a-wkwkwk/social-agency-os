# Social Agency OS

## Mission
Build and operate an internal social media agency operating system for up to 10 client brands. Support Instagram, TikTok, Facebook, and YouTube. Claude is the strategic and AI work partner; this repository is the application source of truth.

## Working principles
- Inspect the existing code before changing it. Preserve working features and existing conventions.
- Do not rewrite the application from scratch or replace the current stack without evidence and approval.
- Prefer small, reversible changes. Explain affected files and risks before destructive changes.
- Never commit secrets, API keys, access tokens, client credentials, or real client personal data.
- Keep `.env*` files out of Git except `.env.example` with placeholders.
- Use server-side secrets only. Never expose Supabase service-role keys or social-platform tokens in browser code.
- Enforce organization/brand data separation and authorization on the server and database.
- Human approval is mandatory before any content can be scheduled or published.
- An approval applies to an exact content version. Any edit after approval invalidates that approval.
- Do not claim a post was published unless the platform integration confirms success.
- Prefer official platform APIs and compliant integrations. Never promise unsupported automatic publishing.
- Treat analytics and AI scores as decision support, not guarantees of reach or virality.
- Ask before adding paid services or dependencies that create recurring costs.

## Product scope
- Agency capacity: up to 10 client brands/accounts initially.
- Roles: Agency Owner, Strategist, Creator, Client Reviewer.
- Core workflow: client onboarding → brand profile → campaign/brief → content draft → internal review → client approval → schedule/publish → analytics/report.
- Channels: Instagram, TikTok, Facebook, YouTube.
- AI provider direction: Claude-first. Keep AI provider access behind a server-side adapter so providers can be changed without rewriting product features.
- Existing repository stack, as described in its README: Next.js 16, React 19, TypeScript, Tailwind, shadcn/ui, Supabase PostgreSQL/Auth/Storage, and Postiz integration. Verify actual files and installed versions before relying on this description.

## Definition of done
For every change:
1. Inspect relevant files and current behavior.
2. State the implementation plan briefly.
3. Implement the smallest complete change.
4. Run available lint, typecheck, tests, and/or build commands.
5. Report what changed, checks run, failures, and manual setup still required.
6. Update documentation and `.env.example` when configuration changes.

## Data and workflow requirements
- Every client-owned record must be scoped to its organization/brand.
- Use database constraints and server-side authorization, not UI hiding alone.
- Keep audit history for content status changes, approvals, scheduling, and publishing.
- Store content versions. Approval records must reference the exact version approved.
- Publishing jobs must be blocked unless that exact version has a valid approval.
- Keep platform account credentials encrypted or in a secure secrets store; never plain-text in ordinary client-readable tables.
- Provide manual publishing/export fallback when official API permissions or platform capabilities are unavailable.

## How to respond
Be concise, practical, and explicit about assumptions. Use Indonesian by default. Do not invent repository files, API capabilities, costs, or test results. If information is missing, inspect the repository first; ask only when a decision cannot safely be inferred.
