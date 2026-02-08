# Marketing Agency OS

> Instruction file for Kimi CLI agents to scaffold and implement the "Marketing Agency OS" app.

***

## 1. Project overview

### 1.1 Vision

Build a Marketing Agency OS web app where an agency can:

- Onboard brands and define their visual identity.
- Define products and campaigns.
- Generate AI carousels and social posts (using Kimi CLI + a carousel generator).
- Schedule and publish content to Instagram/TikTok via Postiz.
- Track performance per campaign and per product.

The app is used primarily by the agency team; optionally, brand clients can log in to review and approve content.

***

## 2. Stack and constraints

### 2.1 Tech stack

- Frontend: Next.js (latest LTS), TypeScript, React, Tailwind CSS, Shadcn UI.
- Backend: Next.js API routes / server actions.
- Database: Supabase Postgres (cloud or self-hosted; must be switchable via env).
- Auth: Supabase Auth (email/password, magic links; OAuth optional).
- Storage: Supabase Storage for assets (e.g., logos, optionally generated images).
- LLM: Kimi CLI (local command line calls from the backend).
- Social distribution: Postiz API (for scheduling/publishing + fetching metrics).

### 2.2 External dependencies

- Supabase JS client.  
- Postiz API client (or generic HTTP wrapper).  
- Carousel generator:
  - Use patterns from open-source carousel generators (e.g. carousel-generator on GitHub) for slide modeling, editing UX, and export approach. The actual code should be cleanly integrated in this repo, not tightly coupled to a specific external repo.[1][2]

***

## 3. Functional PRD

### 3.1 User roles

1. Agency Owner
   - Manages subscription/clients.
   - Full access to all brands, campaigns, content, metrics.

2. Agency Staff – Content Strategist
   - Creates campaigns and briefs.
   - Defines content themes and angles.

3. Agency Staff – Content Creator
   - Uses AI tools to generate carousels/posts.
   - Edits and prepares posts for approval and scheduling.

4. Brand Client (optional portal)
   - Sees only their brand(s).
   - Reviews, comments, approves/rejects content.
   - Views performance dashboards for their campaigns.

### 3.2 Core domains & workflows

#### 3.2.1 Brand onboarding & visual identity

- Create a brand workspace with:
  - Name, industry, short description.
  - Logo upload.
  - Color palette (primary, secondary, accent).
  - Typography (heading, body fonts).
  - Voice guidelines (tone, examples).
- Visual identity is stored as tokens and used to:
  - Style carousel slides (colors / fonts).
  - Condition AI prompts (tone of voice).

#### 3.2.2 Products

- Each brand defines products:
  - Name, description, price, URL, product type.
  - Images (optional).
- Products link to campaigns (one campaign can target one or multiple products).

#### 3.2.3 Campaigns

- Define campaigns per brand:
  - Name, objective (awareness, engagement, conversions).
  - Start/end dates.
  - Target products.
  - Target channels (Instagram, TikTok; extensible).
  - Posting frequency target (e.g., 3 posts/week).
- Campaign dashboard shows:
  - Number of posts created/scheduled/published.
  - Aggregate performance (impressions, engagement, clicks).

#### 3.2.4 AI-assisted content creation (carousels + posts)

- Inputs:
  - Brand identity and voice guidelines.
  - Product(s) and campaign objective.
  - Brief from strategist (theme, angle, hook).
- Outputs:
  - A set of content ideas (e.g., 5 post concepts).
  - For each idea: carousel structure (slide list) and caption.

Flow:

1. Strategist selects campaign → "Generate ideas" button.
2. Backend calls Kimi CLI with a structured prompt, returns:
   - List of post ideas with titles, short descriptions.
3. For each idea, Creator can:
   - "Generate carousel": Kimi returns structured JSON describing each slide:
     - Slide type (hook, proof, tutorial, CTA, etc.).
     - Headline, body text, CTA, suggested imagery.
4. Creator uses a carousel editor to:
   - Reorder slides.
   - Edit text fields.
   - See a live preview styled with the brand's visual identity.
5. When done, Creator can request export:
   - Generate final slides as images (via headless browser screenshot of HTML/CSS).
   - Select aspect ratio suitable for Instagram/TikTok.

#### 3.2.5 Scheduling & publishing (Postiz)

- Brands connect their social accounts through Postiz (process will depend on Postiz capabilities; assume we have API keys or account linking).
- For each approved content piece:
  - Choose:
    - Channel(s) (Instagram/TikTok).
    - Publish date and time.
    - Caption, hashtags.
  - Call Postiz API to create a scheduled post with:
    - Media assets (carousel images).
    - Caption/meta.
- Store:
  - Postiz job ID.
  - Status: pending, published, failed.
- Handle:
  - Basic error reporting and manual retry.

#### 3.2.6 Performance tracking & dashboards

- Periodically fetch metrics from Postiz for each scheduled/published post:
  - Impressions/reach.
  - Likes, comments, shares.
  - Clicks (if available from Postiz).
- Map metrics to:
  - Content piece.
  - Campaign.
  - Product(s).
- Dashboards:
  - Brand-level: overview of all campaigns.
  - Campaign-level: performance over time, best posts, basic charts.

#### 3.2.7 Client portal & approvals

- Brand clients log in and only see their brand(s).
- For each content piece:
  - Status: draft → pending_approval → approved / rejected.
  - Comments thread.
- Clients can:
  - Approve / reject.
  - Leave comments.
- Email notification hooks are desirable but can be added in later phases.

***

## 4. Data model (Supabase)

Kimi agents must create a SQL migration (or Supabase migrations) implementing the following tables. Add standard columns: id (uuid), created_at, updated_at, deleted_at (nullable) where appropriate.

### 4.1 Core identity

- users  
  Use Supabase Auth as primary identity; extend with a profiles table:

- profiles
  - id (uuid, PK, references auth.users).
  - full_name.
  - avatar_url.
  - role (enum: owner, staff, `client`).

- organizations
  - Agency or brand organizations.
  - Fields: id, name, type (enum: agency, `brand`).

- memberships
  - id.
  - user_id → profiles.id.
  - organization_id → organizations.id.
  - role (enum: owner, staff, `client`).

### 4.2 Brands & identity

- brands
  - id.
  - organization_id (references organizations.id, type = brand).
  - name.
  - description.
  - industry.

- brand_style_guides
  - id.
  - brand_id.
  - primary_color.
  - secondary_color.
  - accent_color.
  - heading_font.
  - body_font.
  - logo_url.
  - voice_guidelines (text).

### 4.3 Products & campaigns

- products
  - id.
  - brand_id.
  - name.
  - description.
  - price (numeric).
  - url.
  - image_url.

- campaigns
  - id.
  - brand_id.
  - name.
  - objective (enum: awareness, engagement, `conversions`).
  - start_date.
  - end_date.
  - frequency_target_per_week (int).
  - channels (array of text: e.g., `{instagram,tiktok}`).

- campaign_products (many-to-many)
  - id.
  - campaign_id.
  - product_id.

### 4.4 Content & carousels

- content_pieces
  - id.
  - campaign_id.
  - brand_id.
  - title.
  - content_type (enum: carousel, `single_post`).
  - status (enum: draft, pending_approval, approved, rejected, scheduled, `published`).
  - approval_state (same as status or subset).
  - approval_comment (text).
  - llm_prompt (JSON/text).
  - llm_raw_output (JSON/text).

- carousel_slides
  - id.
  - content_piece_id.
  - position (int).
  - slide_type (enum: hook, proof, tutorial, cta, `generic`).
  - headline.
  - body.
  - cta_text.
  - image_description.
  - image_url (optional, if we attach a specific image).

- content_comments
  - id.
  - content_piece_id.
  - author_profile_id.
  - body.
  - created_at.

### 4.5 Social accounts, scheduling, metrics

- social_accounts
  - id.
  - brand_id.
  - platform (enum: instagram, `tiktok`).
  - postiz_account_id (string).
  - display_name.

- scheduled_posts
  - id.
  - content_piece_id.
  - platform.
  - postiz_job_id (string).
  - scheduled_at (timestamp).
  - published_at (timestamp).
  - status (enum: pending, published, `failed`).
  - error_message.

- metrics
  - id.
  - scheduled_post_id.
  - platform.
  - impressions (int).
  - likes (int).
  - comments (int).
  - shares (int).
  - clicks (int).
  - captured_at (timestamp).

***

## 5. Security: Supabase RLS rules (high-level)

Kimi should generate RLS policies along these lines:

- profiles: a user can select/update only their own profile row.
- organizations:
  - Members of an organization can select that organization.
  - Only owner members can update/delete.
- brands:
  - A brand belongs to an organization.
  - Access to a brand is limited to:
    - Members of the corresponding organization_id.
- campaigns, products, content_pieces, carousel_slides, scheduled_posts, metrics:
  - Accessible only if the current user is member of the associated brand's organization.
- content_comments:
  - Readable by members of the brand's organization.
  - Insert allowed only for logged-in users in that organization.

Supabase RLS policies should use auth.uid() and memberships to resolve permissions.

***

## 6. Kimi CLI integration design

### 6.1 Pattern

- Implement a local Node wrapper to call Kimi CLI via child_process.spawn or similar.
- Define prompt templates and JSON schemas for outputs.

### 6.2 APIs to implement

In Next.js app/api routes or pages/api:

1. POST /api/ai/generate-ideas
   - Input: campaign_id, num_ideas.
   - Fetch brand, style guide, products, campaign objective.
   - Create prompt, call Kimi CLI.
   - Expect JSON:
         {
       "ideas": [
         {
           "title": "string",
           "description": "string"
         }
       ]
     }
        - Create corresponding content_pieces in draft state.

2. POST /api/ai/generate-carousel
   - Input: content_piece_id.
   - Fetch brand, style guide, product(s), campaign info.
   - Call Kimi with a prompt to produce a list of slides.
   - Expected JSON:
         {
       "slides": [
         {
           "slide_type": "hook",
           "headline": "string",
           "body": "string",
           "cta_text": "string",
           "image_description": "string"
         }
       ]
     }
        - Store slides in carousel_slides.

Kimi must ensure outputs are valid JSON and error-handled.

***

## 7. Postiz integration design

### 7.1 Config

- Keep Postiz API endpoint and credentials in environment variables.
- Implement a minimal Postiz client inside lib/postiz.ts with:
  - createScheduledPost(input).
  - getPostStatus(jobId).
  - getPostMetrics(jobId).

### 7.2 APIs/routes

1. POST /api/postiz/schedule
   - Input: content_piece_id, platform, scheduled_at, caption, hashtags.
   - Flow:
     - Ensure content is approved.
     - Render HTML slides to images using a headless browser (server-side; see below).
     - Upload images to Supabase Storage.
     - Send URLs and caption to Postiz as a scheduled post.
     - Save scheduled_posts with postiz_job_id and status = pending.

2. POST /api/postiz/refresh-status
   - Input: scheduled_post_id.
   - Calls Postiz to get status; updates scheduled_posts.

3. POST /api/postiz/refresh-metrics
   - Input: scheduled_post_id.
   - Fetch metrics from Postiz.
   - Insert a row into metrics.

You may also define cron jobs/edge functions to periodically refresh metrics.

***

## 8. Carousel editor & export

### 8.1 Editor

Implement a React component:

- Displays slides in order with drag-and-drop reordering.
- Inline editing of:
  - Headline.
  - Body.
  - CTA text.
- Preview uses brand style tokens:
  - Colors for backgrounds and text.
  - Fonts for headings/body.

### 8.2 Export

- Use a headless browser (Playwright or Puppeteer) server-side.
- Render a dedicated HTML page (server route) that:
  - Uses Tailwind + brand style tokens.
  - Layout: 1080×1350 (Instagram portrait) by default.
- The export function:
  - Calls the headless browser → screenshot each slide → returns URLs or stores in Supabase Storage.
- Keep this module encapsulated (e.g., `lib/carouselExport.ts`).

***

## 9. Implementation phases & dependencies

Kimi agents must follow this phased plan. Each phase should be a coherent PR / module.

### Phase 0 – Project bootstrap

- Initialize Next.js + TypeScript project.
- Add Tailwind and Shadcn UI.
- Add Supabase client and environment configuration.
- Setup basic layout and navigation shell.

### Phase 1 – Supabase integration & auth

- Connect project to a Supabase instance (cloud for now).
- Implement profiles, organizations, memberships tables and migrations.
- Implement auth flows (sign in/up, org selection).
- Implement basic RLS policies.

### Phase 2 – Brand and visual identity

- Implement brands and brand_style_guides tables.
- UI:
  - Brand list and creation form.
  - Style guide editor (colors, fonts, voice guidelines).
- Ensure only members of a brand's organization can access it.

### Phase 3 – Products and campaigns

- Implement products, campaigns, campaign_products tables.
- UI:
  - Product CRUD under each brand.
  - Campaign create/edit form.
- Basic campaign dashboard (list campaigns, show counts of linked content pieces).

### Phase 4 – AI content generation (Kimi integration)

- Implement Kimi CLI wrapper.
- API:
  - /api/ai/generate-ideas.
  - /api/ai/generate-carousel.
- Implement content_pieces and carousel_slides tables.
- UI:
  - From campaign page, "Generate ideas" flow.
  - From content row, "Generate carousel" button.
- Store prompts and raw outputs for debugging.

### Phase 5 – Carousel editor & preview

- Implement full carousel editor (list of slides, editing, drag-and-drop).
- Implement preview with brand styles.
- Implement save/update endpoints.

### Phase 6 – Export to images

- Integrate Playwright/Puppeteer.
- HTML template for slides.
- API:
  - /api/carousel/export (input: `content_piece_id`).
- Save output image URLs to storage and update carousel_slides or content_pieces metadata with exported_image_urls.

### Phase 7 – Postiz integration

- Implement social_accounts, scheduled_posts, metrics tables.
- Integrate Postiz client.
- APIs:
  - /api/postiz/schedule.
  - /api/postiz/refresh-status.
  - /api/postiz/refresh-metrics.
- UI:
  - Connect accounts page under brand.
  - Scheduling form from content piece detail.

### Phase 8 – Analytics dashboards

- Aggregate metrics by:
  - Brand.
  - Campaign.
  - Content piece.
- Build simple charts (time series, leaderboard of posts) on frontend using the metrics table.

### Phase 9 – Client portal & approvals

- Implement content_comments table.
- Client-facing views:
  - List content pieces per campaign.
  - Approve/reject with comments.
- Update workflows: only approved content can be scheduled.

***

## 10. Coding guidelines for Kimi agents

- Use TypeScript everywhere (frontend and backend).
- Keep domain logic separated in lib/ modules:
  - lib/ai.ts (Kimi wrapper).
  - lib/postiz.ts.
  - lib/carouselExport.ts.
  - lib/db/* for DB helpers.
- Use environment variables for:
  - Supabase URLs and keys.
  - Kimi CLI configuration.
  - Postiz credentials.
- Ensure all AI outputs are validated (Zod schemas) before writing to DB.
- Implement error handling and logging for:
  - Failed AI calls.
  - Failed Postiz calls.
  - Failed exports.

***

This .md file should be placed at the root of the repo (e.g., `marketing-agency-os.md`) and treated as the source of truth for architecture, PRD, and implementation plan.

Sources
[1] FranciscoMoretti/carousel-generator - GitHub https://github.com/FranciscoMoretti/carousel-generator
[2] carousel-generator/README.md at main · FranciscoMoretti/carousel-generator https://github.com/FranciscoMoretti/carousel-generator/blob/main/README.md
