# Remaining Issues to Create (10-28)

This document contains all remaining issues for the Marketing Agency OS project in the proper Kimi GitHub Agent format. Create each issue exactly as specified below, maintaining the structure and dependencies.

---

## Issue #10: Products management API and UI

**Labels**: `phase-2`, `priority-high`

**Dependencies**:
- [ ] #8 - Brands management API and UI

**Issue Body**:

```markdown
## Description
Implement complete product catalog management system with CRUD operations and UI pages. Products represent services or items that brands offer and can be linked to campaigns for targeted content generation.

Each brand can have multiple products with details like name, description, pricing, images, and URLs.

## Dependencies
- [ ] #8 - Brands management API and UI

## Acceptance Criteria
- [ ] Product CRUD API endpoints implemented
- [ ] Products list page with filtering by brand
- [ ] Create product form with validation
- [ ] Edit product page with image upload
- [ ] Delete product with confirmation dialog
- [ ] Product images stored in Supabase Storage
- [ ] Product search functionality
- [ ] Soft delete implementation (deleted_at)
- [ ] All operations respect RLS policies
- [ ] Success/error toast notifications

## Technical Notes
- API endpoints:
  - POST /api/products - Create product
  - GET /api/products?brandId={id} - List products for brand
  - GET /api/products/[id] - Get product details
  - PATCH /api/products/[id] - Update product
  - DELETE /api/products/[id] - Soft delete product
- Product fields:
  - name (required, max 200 chars)
  - description (optional, rich text)
  - price (optional, decimal)
  - url (optional, product landing page)
  - image_url (Supabase Storage path)
- UI pages:
  - app/(dashboard)/products/page.tsx - List view with brand filter
  - app/(dashboard)/products/new/page.tsx - Create form
  - app/(dashboard)/products/[id]/page.tsx - Edit page
- Image upload: Max 5MB, formats: PNG, JPG, WebP
- Store images in: brands/{brandId}/products/{productId}/
- Use react-hook-form with Zod validation
- Table component with sorting by name, price, date
- Product selection UI for campaigns (multi-select)

## Files to Modify
- app/api/products/route.ts - List and create
- app/api/products/[id]/route.ts - Get, update, delete
- app/(dashboard)/products/page.tsx - Products list
- app/(dashboard)/products/new/page.tsx - Create form
- app/(dashboard)/products/[id]/page.tsx - Edit page
- components/products/ProductList.tsx - List component
- components/products/ProductForm.tsx - Form component
- components/products/ProductCard.tsx - Card display
- components/products/ProductImageUpload.tsx - Image uploader
- lib/actions/products.ts - Server Actions
- lib/validations/products.ts - Zod schemas
- lib/storage/product-images.ts - Image handling
```

---

## Issue #11: Campaigns management API and UI

**Labels**: `phase-2`, `priority-high`

**Dependencies**:
- [ ] #8 - Brands management API and UI

**Issue Body**:

```markdown
## Description
Implement campaign management system for organizing marketing campaigns with objectives, dates, target channels, and frequency goals. Campaigns are the organizing unit for content creation.

Each campaign links to a brand and can target specific products for content generation.

## Dependencies
- [ ] #8 - Brands management API and UI

## Acceptance Criteria
- [ ] Campaign CRUD API endpoints implemented
- [ ] Campaigns list page with status indicators
- [ ] Create campaign wizard with validation
- [ ] Edit campaign page
- [ ] Campaign detail page with analytics
- [ ] Date range picker for start/end dates
- [ ] Objective selection (awareness, engagement, conversions)
- [ ] Channel selection (Instagram, TikTok)
- [ ] Frequency target configuration
- [ ] Campaign status management (draft, active, completed)

## Technical Notes
- API endpoints:
  - POST /api/campaigns - Create campaign
  - GET /api/campaigns?brandId={id} - List campaigns for brand
  - GET /api/campaigns/[id] - Get campaign details
  - PATCH /api/campaigns/[id] - Update campaign
  - DELETE /api/campaigns/[id] - Soft delete campaign
- Campaign fields:
  - name (required)
  - objective (enum: awareness, engagement, conversions)
  - start_date, end_date (date range)
  - frequency_target_per_week (integer)
  - channels (array: instagram, tiktok)
- UI pages:
  - app/(dashboard)/campaigns/page.tsx - List with filters
  - app/(dashboard)/campaigns/new/page.tsx - Creation wizard
  - app/(dashboard)/campaigns/[id]/page.tsx - Campaign detail
  - app/(dashboard)/campaigns/[id]/edit/page.tsx - Edit page
- Status indicators:
  - Draft: Not started
  - Active: Within date range
  - Completed: Past end date
  - Paused: Manually paused
- Use date-fns for date calculations
- Campaign card should show progress (posts created vs. target)
- Filter campaigns by status, objective, dates

## Files to Modify
- app/api/campaigns/route.ts - List and create
- app/api/campaigns/[id]/route.ts - Get, update, delete
- app/(dashboard)/campaigns/page.tsx - Campaigns list
- app/(dashboard)/campaigns/new/page.tsx - Creation wizard
- app/(dashboard)/campaigns/[id]/page.tsx - Campaign detail
- app/(dashboard)/campaigns/[id]/edit/page.tsx - Edit page
- components/campaigns/CampaignList.tsx - List component
- components/campaigns/CampaignForm.tsx - Form component
- components/campaigns/CampaignCard.tsx - Card display
- components/campaigns/CampaignWizard.tsx - Multi-step wizard
- lib/actions/campaigns.ts - Server Actions
- lib/validations/campaigns.ts - Zod schemas
- lib/utils/campaign-status.ts - Status calculation
```

---

## Issue #12: Campaign-products linking system

**Labels**: `phase-2`, `priority-medium`

**Dependencies**:
- [ ] #10 - Products management API and UI
- [ ] #11 - Campaigns management API and UI

**Issue Body**:

```markdown
## Description
Implement many-to-many relationship between campaigns and products. Allow campaigns to target specific products for content generation, and show which products are featured in which campaigns.

This enables product-focused content generation within campaigns.

## Dependencies
- [ ] #10 - Products management API and UI
- [ ] #11 - Campaigns management API and UI

## Acceptance Criteria
- [ ] Campaign-products API endpoints implemented
- [ ] Add products to campaign functionality
- [ ] Remove products from campaign
- [ ] Display linked products in campaign detail
- [ ] Display linked campaigns in product detail
- [ ] Multi-select product picker in campaign form
- [ ] Validation prevents duplicate links
- [ ] Junction table queries optimized
- [ ] Product selection shown during content generation
- [ ] Bulk add/remove products functionality

## Technical Notes
- API endpoints:
  - POST /api/campaigns/[id]/products - Link products to campaign
  - DELETE /api/campaigns/[id]/products/[productId] - Remove link
  - GET /api/campaigns/[id]/products - List campaign products
  - GET /api/products/[id]/campaigns - List product campaigns
- Use campaign_products junction table
- Prevent duplicate entries with unique constraint
- When creating campaign, allow product selection
- When editing campaign, show current products with add/remove
- Product picker should:
  - Show only products from same brand
  - Support multi-select
  - Show product thumbnails and names
  - Filter and search functionality
- Display linked products as badges/chips in campaign card
- Use optimistic updates for better UX

## Files to Modify
- app/api/campaigns/[id]/products/route.ts - Link operations
- app/api/campaigns/[id]/products/[productId]/route.ts - Remove link
- app/api/products/[id]/campaigns/route.ts - List campaigns
- components/campaigns/ProductPicker.tsx - Multi-select picker
- components/campaigns/LinkedProducts.tsx - Display linked products
- components/products/LinkedCampaigns.tsx - Display linked campaigns
- lib/actions/campaign-products.ts - Server Actions
- lib/queries/campaign-products.ts - Database queries
```

---

## Issue #13: Social accounts integration setup

**Labels**: `phase-2`, `priority-medium`

**Dependencies**:
- [ ] #8 - Brands management API and UI

**Issue Body**:

```markdown
## Description
Implement social accounts management for connecting Instagram and TikTok accounts to brands. Store Postiz account IDs for scheduling integration later. Each brand can have multiple social accounts.

This prepares the foundation for social media scheduling and publishing.

## Dependencies
- [ ] #8 - Brands management API and UI

## Acceptance Criteria
- [ ] Social accounts CRUD API endpoints
- [ ] Add social account form
- [ ] Platform selection (Instagram, TikTok)
- [ ] Postiz account ID input and validation
- [ ] List connected accounts per brand
- [ ] Remove social account with confirmation
- [ ] Account status indicator (connected/disconnected)
- [ ] Display account info (username, platform icon)
- [ ] Validation prevents duplicate accounts
- [ ] All operations respect RLS policies

## Technical Notes
- API endpoints:
  - POST /api/social-accounts - Create social account
  - GET /api/social-accounts?brandId={id} - List brand accounts
  - GET /api/social-accounts/[id] - Get account details
  - PATCH /api/social-accounts/[id] - Update account
  - DELETE /api/social-accounts/[id] - Delete account
- Social account fields:
  - brand_id (foreign key)
  - platform (enum: instagram, tiktok)
  - postiz_account_id (string, from Postiz)
  - display_name (optional, for UI display)
- UI locations:
  - app/(dashboard)/brands/[id]/social-accounts/page.tsx - Manage accounts
  - components/brands/SocialAccountsList.tsx - List component
  - components/brands/AddSocialAccountForm.tsx - Add form
- Platform icons from lucide-react (Instagram, Video)
- Postiz integration notes:
  - Account ID obtained from Postiz dashboard
  - Validation: must be valid UUID or Postiz format
  - Store for later use in scheduling
- Show connected accounts count in brand card

## Files to Modify
- app/api/social-accounts/route.ts - List and create
- app/api/social-accounts/[id]/route.ts - Get, update, delete
- app/(dashboard)/brands/[id]/social-accounts/page.tsx - Accounts page
- components/brands/SocialAccountsList.tsx - List component
- components/brands/AddSocialAccountForm.tsx - Add form
- components/brands/SocialAccountCard.tsx - Account display
- lib/actions/social-accounts.ts - Server Actions
- lib/validations/social-accounts.ts - Zod schemas
```

---

## Issue #14: TypeScript types and interfaces consolidation

**Labels**: `phase-2`, `priority-medium`

**Dependencies**:
- [ ] #7 - Organizations and memberships API

**Issue Body**:

```markdown
## Description
Consolidate and organize all TypeScript types, interfaces, and type utilities for the application. Create a comprehensive type system that covers database models, API responses, form data, and component props.

This ensures type safety throughout the application and improves developer experience.

## Dependencies
- [ ] #7 - Organizations and memberships API

## Acceptance Criteria
- [ ] Database types exported from generated schema
- [ ] API response types defined for all endpoints
- [ ] Form data types with Zod integration
- [ ] Component prop types organized
- [ ] Utility types for common patterns
- [ ] Type guards implemented
- [ ] No `any` types in codebase
- [ ] All exports properly typed
- [ ] JSDoc comments for complex types
- [ ] Type imports use `type` keyword

## Technical Notes
- Type organization:
  - types/database.ts - Generated from Supabase (already present)
  - types/api.ts - API request/response types
  - types/models.ts - Domain models
  - types/forms.ts - Form data types
  - types/components.ts - Component prop types
  - types/utils.ts - Utility types
- Create type utilities:
  - ApiResponse<T> - Standard API response wrapper
  - PaginatedResponse<T> - Paginated data
  - FormState<T> - Form validation state
  - SelectOption - Select/dropdown options
- Database type helpers:
  - Extract table types from generated schema
  - Create Insert/Update/Select variants
  - Type-safe query builders
- Zod schema integration:
  - Export inferred types from Zod schemas
  - Use z.infer<typeof schema> pattern
- Component prop types:
  - Use React.ComponentProps for extending
  - Discriminated unions for variant props
- Ensure strict TypeScript settings:
  - strict: true
  - noImplicitAny: true
  - strictNullChecks: true

## Files to Modify
- types/api.ts - API types
- types/models.ts - Domain models
- types/forms.ts - Form types
- types/components.ts - Component types
- types/utils.ts - Utility types
- types/index.ts - Central exports
- lib/types/guards.ts - Type guard functions
- lib/types/helpers.ts - Type helper functions
- tsconfig.json - Ensure strict settings
```

---

## Issue #15: Content pieces CRUD operations

**Labels**: `phase-3`, `priority-high`

**Dependencies**:
- [ ] #11 - Campaigns management API and UI

**Issue Body**:

```markdown
## Description
Implement content pieces management system for creating and organizing content items (carousels/posts). Content pieces are the core unit of content creation, supporting draft, approval, scheduling, and publishing workflows.

Each content piece belongs to a brand and optionally to a campaign.

## Dependencies
- [ ] #11 - Campaigns management API and UI

## Acceptance Criteria
- [ ] Content pieces CRUD API endpoints implemented
- [ ] Content list page with status filters
- [ ] Create content piece form
- [ ] Content detail page with preview
- [ ] Status workflow (draft → pending → approved → scheduled → published)
- [ ] Rejection workflow with comments
- [ ] Content type selection (carousel, single_post)
- [ ] LLM prompt storage (for regeneration)
- [ ] Caption and hashtags fields
- [ ] Content search and filtering

## Technical Notes
- API endpoints:
  - POST /api/content - Create content piece
  - GET /api/content?brandId={id}&status={status} - List content
  - GET /api/content/[id] - Get content details
  - PATCH /api/content/[id] - Update content
  - DELETE /api/content/[id] - Soft delete content
  - POST /api/content/[id]/submit - Submit for approval
  - POST /api/content/[id]/approve - Approve content
  - POST /api/content/[id]/reject - Reject with comment
- Content piece fields:
  - title (required)
  - content_type (enum: carousel, single_post)
  - status (enum: draft, pending_approval, approved, rejected, scheduled, published)
  - campaign_id (optional, foreign key)
  - brand_id (required, foreign key)
  - llm_prompt (JSONB, stores generation context)
  - llm_raw_output (JSONB, stores AI response)
  - caption (text)
  - hashtags (text)
  - approval_comment (text, for rejections)
- UI pages:
  - app/(dashboard)/content/page.tsx - Content list
  - app/(dashboard)/content/new/page.tsx - Create form
  - app/(dashboard)/content/[id]/page.tsx - Content detail
- Status badge colors:
  - Draft: gray
  - Pending: yellow
  - Approved: green
  - Rejected: red
  - Scheduled: blue
  - Published: purple
- Filter by status, campaign, date range
- Sort by created_at, updated_at, status

## Files to Modify
- app/api/content/route.ts - List and create
- app/api/content/[id]/route.ts - Get, update, delete
- app/api/content/[id]/submit/route.ts - Submit for approval
- app/api/content/[id]/approve/route.ts - Approve
- app/api/content/[id]/reject/route.ts - Reject
- app/(dashboard)/content/page.tsx - Content list
- app/(dashboard)/content/new/page.tsx - Create form
- app/(dashboard)/content/[id]/page.tsx - Content detail
- components/content/ContentList.tsx - List component
- components/content/ContentCard.tsx - Card display
- components/content/ContentStatusBadge.tsx - Status indicator
- components/content/ApprovalActions.tsx - Approve/reject buttons
- lib/actions/content.ts - Server Actions
- lib/validations/content.ts - Zod schemas
```

---

## Issue #16: Carousel slides management system

**Labels**: `phase-3`, `priority-high`

**Dependencies**:
- [ ] #15 - Content pieces CRUD operations

**Issue Body**:

```markdown
## Description
Implement carousel slides management for creating multi-slide content pieces. Each content piece can have multiple slides with different types (hook, proof, tutorial, cta, generic) and structured content fields.

Slides support text content, CTAs, image descriptions, and reordering.

## Dependencies
- [ ] #15 - Content pieces CRUD operations

## Acceptance Criteria
- [ ] Carousel slides CRUD API endpoints
- [ ] Create slide functionality
- [ ] Update slide content
- [ ] Delete slide with confirmation
- [ ] Reorder slides (drag-and-drop)
- [ ] Slide type selection
- [ ] Text fields (headline, body, cta_text)
- [ ] Image description for AI generation
- [ ] Image upload functionality
- [ ] Position management (1-10)

## Technical Notes
- API endpoints:
  - POST /api/content/[contentId]/slides - Create slide
  - GET /api/content/[contentId]/slides - List slides
  - GET /api/slides/[id] - Get slide details
  - PATCH /api/slides/[id] - Update slide
  - DELETE /api/slides/[id] - Delete slide
  - PATCH /api/slides/[id]/reorder - Update position
- Slide fields:
  - content_piece_id (foreign key)
  - position (integer, 1-based)
  - slide_type (enum: hook, proof, tutorial, cta, generic)
  - headline (text, max 100 chars)
  - body (text, max 500 chars)
  - cta_text (text, max 30 chars)
  - image_description (text, for AI generation)
  - image_url (Supabase Storage path)
- Slide types:
  - hook: Attention-grabbing opener
  - proof: Social proof, testimonials
  - tutorial: How-to, step-by-step
  - cta: Call to action
  - generic: General content
- Reordering:
  - Drag-and-drop interface
  - Update all affected positions
  - Use optimistic updates
- Image handling:
  - Upload to: content/{contentId}/slides/{slideId}/
  - Max 5MB, formats: PNG, JPG, WebP
  - Generate thumbnails (300x300)
- Unique constraint on (content_piece_id, position)

## Files to Modify
- app/api/content/[contentId]/slides/route.ts - List and create
- app/api/slides/[id]/route.ts - Get, update, delete
- app/api/slides/[id]/reorder/route.ts - Reorder
- components/content/SlidesList.tsx - List with drag-drop
- components/content/SlideForm.tsx - Edit form
- components/content/SlideCard.tsx - Slide preview
- components/content/SlideTypeSelector.tsx - Type selection
- lib/actions/slides.ts - Server Actions
- lib/validations/slides.ts - Zod schemas
- lib/utils/slide-reorder.ts - Reorder logic
```

---

## Issue #17: Kimi CLI integration library

**Labels**: `phase-3`, `priority-high`

**Dependencies**:
- [ ] #1 - Initial project setup and dependencies

**Issue Body**:

```markdown
## Description
Create a library for integrating with Kimi CLI from Node.js. This includes spawning Kimi processes, handling input/output streams, managing context, and error handling for AI-powered content generation.

This is the core integration layer for AI content generation features.

## Dependencies
- [ ] #1 - Initial project setup and dependencies

## Acceptance Criteria
- [ ] Kimi CLI wrapper class implemented
- [ ] Execute Kimi commands programmatically
- [ ] Stream responses from Kimi
- [ ] Context management (save/load sessions)
- [ ] Error handling for all failure modes
- [ ] Timeout handling (max 2 minutes per request)
- [ ] Input sanitization
- [ ] Response parsing (JSON extraction)
- [ ] Kimi CLI path configuration
- [ ] Test mode with mock responses

## Technical Notes
- Library location: lib/ai/kimi-cli.ts
- Core class: KimiClient
  - execute(prompt: string, options?: KimiOptions): Promise<KimiResponse>
  - stream(prompt: string, onChunk: (chunk: string) => void): Promise<void>
  - saveContext(sessionId: string): Promise<void>
  - loadContext(sessionId: string): Promise<void>
- Kimi CLI execution:
  - Use child_process.spawn for streaming
  - Pass prompt via stdin
  - Read response from stdout
  - Handle stderr for errors
- Configuration from env:
  - KIMI_CLI_PATH (default: 'kimi')
  - KIMI_TIMEOUT_MS (default: 120000)
  - KIMI_MAX_RETRIES (default: 3)
- Error types:
  - KimiTimeoutError
  - KimiQuotaExceededError
  - KimiNetworkError
  - KimiParseError
- Response format:
  ```typescript
  interface KimiResponse {
    content: string;
    usage: {
      tokens: number;
      cost: number;
    };
    sessionId?: string;
  }
  ```
- Context sessions:
  - Store in: SESSIONS_DIR/kimi-{sessionId}.json
  - Auto-cleanup after 24 hours
- JSON extraction:
  - Parse code blocks with ```json
  - Validate with Zod schemas
  - Handle malformed responses

## Files to Modify
- lib/ai/kimi-cli.ts - Main KimiClient class
- lib/ai/kimi-types.ts - TypeScript types
- lib/ai/kimi-errors.ts - Error classes
- lib/ai/kimi-parser.ts - Response parsing
- lib/ai/kimi-context.ts - Context management
- lib/ai/kimi-mock.ts - Mock for testing
- .env.example - Add Kimi configuration
```

---

## Issue #18: AI content ideas generation endpoint

**Labels**: `phase-3`, `priority-high`

**Dependencies**:
- [ ] #15 - Content pieces CRUD operations
- [ ] #17 - Kimi CLI integration library

**Issue Body**:

```markdown
## Description
Implement AI-powered content ideas generation using Kimi CLI. Generate 5 content ideas based on campaign context, brand identity, target products, and marketing objectives.

This enables automated content ideation for campaigns.

## Dependencies
- [ ] #15 - Content pieces CRUD operations
- [ ] #17 - Kimi CLI integration library

## Acceptance Criteria
- [ ] API endpoint for generating content ideas
- [ ] Generate 5 ideas per campaign
- [ ] Include campaign context (objective, products)
- [ ] Include brand style guide context
- [ ] Return structured ideas (title, description, rationale)
- [ ] Store prompt and response in database
- [ ] Loading state during generation (30-60s)
- [ ] Error handling for API failures
- [ ] Rate limiting (max 10 requests/hour per brand)
- [ ] Retry logic for transient failures

## Technical Notes
- API endpoint:
  - POST /api/ai/generate-ideas
  - Request body: { campaignId: string }
  - Response: { ideas: ContentIdea[] }
- Prompt structure:
  ```
  You are a social media content strategist for a marketing agency.
  
  Brand: {brand.name}
  Industry: {brand.industry}
  Brand Voice: {styleGuide.voice_guidelines}
  
  Campaign: {campaign.name}
  Objective: {campaign.objective}
  Target Products: {products[].name}
  
  Generate 5 content ideas for Instagram/TikTok carousels that:
  - Align with the campaign objective
  - Feature the target products
  - Match the brand voice
  - Drive engagement
  
  For each idea, provide:
  - Title (catchy, under 10 words)
  - Description (2-3 sentences)
  - Rationale (why this will work)
  - Suggested slide count (5-7 slides)
  
  Return as JSON array.
  ```
- Response format:
  ```typescript
  interface ContentIdea {
    title: string;
    description: string;
    rationale: string;
    slideCount: number;
  }
  ```
- Store in content_pieces.llm_prompt and llm_raw_output
- Use Zod to validate AI response
- Implement exponential backoff for retries
- Cache ideas for 24 hours (same campaign context)

## Files to Modify
- app/api/ai/generate-ideas/route.ts - API endpoint
- lib/ai/prompts/content-ideas.ts - Prompt builder
- lib/ai/parsers/content-ideas.ts - Response parser
- lib/validations/content-ideas.ts - Zod schemas
- components/campaigns/GenerateIdeasButton.tsx - UI trigger
- components/campaigns/IdeasList.tsx - Display ideas
- lib/cache/ideas-cache.ts - Caching logic
```

---

## Issue #19: AI carousel generation endpoint

**Labels**: `phase-3`, `priority-high`

**Dependencies**:
- [ ] #16 - Carousel slides management
- [ ] #17 - Kimi CLI integration library

**Issue Body**:

```markdown
## Description
Implement AI-powered carousel slide generation using Kimi CLI. Generate 5-7 complete slides with headlines, body text, CTAs, and image descriptions based on selected content idea and brand context.

This automates the slide creation process for carousels.

## Dependencies
- [ ] #16 - Carousel slides management
- [ ] #17 - Kimi CLI integration library

## Acceptance Criteria
- [ ] API endpoint for generating carousel slides
- [ ] Generate 5-7 slides per content idea
- [ ] Include slide type (hook, proof, tutorial, cta)
- [ ] Generate headline, body, CTA for each slide
- [ ] Generate image descriptions for each slide
- [ ] Follow brand style guide (voice, tone)
- [ ] Store prompt and response in database
- [ ] Create slides in database with positions
- [ ] Loading state during generation (60-90s)
- [ ] Error handling and retry logic

## Technical Notes
- API endpoint:
  - POST /api/ai/generate-carousel
  - Request body: { contentPieceId: string }
  - Response: { slides: GeneratedSlide[] }
- Prompt structure:
  ```
  You are a social media content creator for a marketing agency.
  
  Brand: {brand.name}
  Brand Voice: {styleGuide.voice_guidelines}
  Brand Colors: {styleGuide.primary_color}, {styleGuide.secondary_color}
  
  Content Idea: {contentPiece.title}
  Description: {contentPiece.description}
  
  Create a 5-7 slide carousel with:
  
  Slide 1 (Hook):
  - Attention-grabbing headline (5-8 words)
  - Compelling body text (20-30 words)
  - Image description for visual
  
  Slides 2-5 (Content):
  - Educational/entertaining content
  - Clear, concise copy
  - Type: proof, tutorial, or generic
  
  Slide 6-7 (CTA):
  - Strong call-to-action
  - Next steps for audience
  - CTA button text (2-4 words)
  
  For each slide provide:
  - slide_type (hook/proof/tutorial/cta/generic)
  - headline (max 100 chars)
  - body (max 500 chars)
  - cta_text (max 30 chars, if applicable)
  - image_description (detailed visual concept)
  
  Return as JSON array.
  ```
- Response format:
  ```typescript
  interface GeneratedSlide {
    position: number;
    slide_type: SlideType;
    headline: string;
    body: string;
    cta_text?: string;
    image_description: string;
  }
  ```
- Create slides in database after generation
- Use database transaction for atomic creation
- Validate all fields with Zod
- Handle partial failures (rollback transaction)

## Files to Modify
- app/api/ai/generate-carousel/route.ts - API endpoint
- lib/ai/prompts/carousel-slides.ts - Prompt builder
- lib/ai/parsers/carousel-slides.ts - Response parser
- lib/validations/carousel-slides.ts - Zod schemas
- components/content/GenerateCarouselButton.tsx - UI trigger
- components/content/GenerationProgress.tsx - Loading state
- lib/actions/create-slides.ts - Database creation
```

---

## Issue #20: Carousel drag-and-drop editor

**Labels**: `phase-3`, `priority-high`

**Dependencies**:
- [ ] #16 - Carousel slides management

**Issue Body**:

```markdown
## Description
Build an interactive drag-and-drop carousel editor with live preview. Allow users to reorder slides, edit content inline, preview with brand styling, and see real-time changes.

This provides the core editing experience for carousel content.

## Dependencies
- [ ] #16 - Carousel slides management

## Acceptance Criteria
- [ ] Drag-and-drop slide reordering
- [ ] Inline editing for all text fields
- [ ] Live preview of carousel slides
- [ ] Brand styling applied in preview (colors, fonts)
- [ ] Add new slide functionality
- [ ] Delete slide with confirmation
- [ ] Duplicate slide functionality
- [ ] Undo/redo support
- [ ] Auto-save with debouncing
- [ ] Mobile-responsive layout

## Technical Notes
- Use @dnd-kit/core for drag-and-drop
  - Sortable list of slides
  - Touch support for mobile
  - Smooth animations
- Editor layout:
  - Left panel: Slide list with thumbnails
  - Center: Selected slide editor
  - Right panel: Live preview
- Text editing:
  - Contenteditable divs or textarea
  - Character count indicators
  - Validation (max lengths)
- Preview rendering:
  - Apply brand colors from style guide
  - Use Google Fonts for typography
  - Size: 1080x1350px (Instagram carousel format)
  - Show slide number (1/7)
- Auto-save:
  - Debounce 500ms after last edit
  - Show "Saving..." / "Saved" indicator
  - Use optimistic updates
- Undo/redo:
  - Track edit history (last 20 actions)
  - Cmd+Z / Cmd+Shift+Z shortcuts
- Keyboard shortcuts:
  - Cmd+S: Manual save
  - Cmd+D: Duplicate slide
  - Delete: Remove slide
  - Arrow keys: Navigate slides

## Files to Modify
- app/(dashboard)/content/[id]/edit/page.tsx - Editor page
- components/content/CarouselEditor.tsx - Main editor
- components/content/SlidesList.tsx - Draggable list
- components/content/SlideEditor.tsx - Edit selected slide
- components/content/SlidePreview.tsx - Live preview
- components/content/EditorToolbar.tsx - Actions toolbar
- hooks/useCarouselEditor.ts - Editor state
- hooks/useAutoSave.ts - Auto-save logic
- hooks/useUndoRedo.ts - Undo/redo state
- lib/utils/slide-preview.ts - Preview rendering
```

---

## Issue #21: Content approval workflow system

**Labels**: `phase-3`, `priority-medium`

**Dependencies**:
- [ ] #15 - Content pieces CRUD operations

**Issue Body**:

```markdown
## Description
Implement content approval workflow allowing clients to review, comment, approve, or reject content. Support multi-stage approval with notifications, comment threads, and revision history.

This enables client collaboration and quality control.

## Dependencies
- [ ] #15 - Content pieces CRUD operations

## Acceptance Criteria
- [ ] Submit content for approval functionality
- [ ] Approve content action (client role)
- [ ] Reject content with required comment
- [ ] Comment threads on content pieces
- [ ] Revision history tracking
- [ ] Email notifications (optional)
- [ ] Approval status indicators
- [ ] Approval actions restricted by role
- [ ] Content locked during review
- [ ] Resubmission after rejection

## Technical Notes
- Workflow states:
  1. draft → Submit for review
  2. pending_approval → Approve or Reject
  3. approved → Can schedule/publish
  4. rejected → Back to draft with comments
- API endpoints:
  - POST /api/content/[id]/submit - Submit for approval
  - POST /api/content/[id]/approve - Approve (client only)
  - POST /api/content/[id]/reject - Reject with comment
  - GET /api/content/[id]/history - Revision history
- Comments system:
  - Use content_comments table
  - Thread comments by content_piece_id
  - Author is current user (profile)
  - Timestamp and display name
- Role restrictions:
  - Staff: Can submit for approval
  - Client: Can approve/reject
  - Owner: Can approve/reject
- UI components:
  - Approval panel in content detail
  - Comment box with rich text
  - Comments thread display
  - Approval action buttons
  - Status timeline
- Notifications:
  - On submit: Notify client
  - On approve: Notify staff
  - On reject: Notify staff with comment
  - Use toast notifications in-app
  - Optional email via Supabase functions
- Prevent editing when status is pending_approval

## Files to Modify
- app/api/content/[id]/submit/route.ts - Already created in #15
- app/api/content/[id]/approve/route.ts - Already created in #15
- app/api/content/[id]/reject/route.ts - Already created in #15
- app/api/content/[id]/comments/route.ts - Comments endpoint
- app/api/content/[id]/history/route.ts - Revision history
- components/content/ApprovalPanel.tsx - Approval actions
- components/content/CommentsThread.tsx - Comments display
- components/content/CommentForm.tsx - Add comment
- components/content/ApprovalTimeline.tsx - Status history
- lib/actions/approval.ts - Server Actions
- lib/notifications/approval-notifications.ts - Notification logic
```

---

## Issue #22: Postiz API client integration

**Labels**: `phase-4`, `priority-high`

**Dependencies**:
- [ ] #13 - Social accounts integration setup

**Issue Body**:

```markdown
## Description
Create Postiz API client for scheduling posts to Instagram and TikTok. Implement authentication, post creation, scheduling, status checking, and error handling for the Postiz API.

This enables automated social media publishing from the platform.

## Dependencies
- [ ] #13 - Social accounts integration setup

## Acceptance Criteria
- [ ] Postiz API client class implemented
- [ ] Authentication with API key
- [ ] Create post on Postiz
- [ ] Schedule post for specific time
- [ ] Upload media files to Postiz
- [ ] Check post status
- [ ] Cancel scheduled post
- [ ] Error handling for API failures
- [ ] Rate limiting compliance
- [ ] Retry logic with backoff

## Technical Notes
- Library location: lib/postiz/client.ts
- Core class: PostizClient
  - authenticate(): Promise<void>
  - createPost(data: PostData): Promise<PostizPost>
  - schedulePost(postId: string, scheduledAt: Date): Promise<void>
  - uploadMedia(file: Buffer, mimeType: string): Promise<MediaUrl>
  - getPostStatus(postId: string): Promise<PostStatus>
  - cancelPost(postId: string): Promise<void>
- Configuration:
  - POSTIZ_API_URL from env
  - POSTIZ_API_KEY from env
  - Base URL: https://api.postiz.com/v1
- API endpoints:
  - POST /auth - Authentication
  - POST /posts - Create post
  - POST /posts/{id}/schedule - Schedule
  - POST /media - Upload media
  - GET /posts/{id} - Get status
  - DELETE /posts/{id} - Cancel
- Request types:
  ```typescript
  interface PostData {
    accountId: string; // Postiz account ID
    platform: 'instagram' | 'tiktok';
    content: string; // Caption
    mediaUrls: string[]; // Image URLs
    scheduledAt?: Date;
  }
  ```
- Response types:
  ```typescript
  interface PostizPost {
    id: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    accountId: string;
    scheduledAt?: string;
    publishedAt?: string;
    error?: string;
  }
  ```
- Error handling:
  - PostizAuthError (401)
  - PostizRateLimitError (429)
  - PostizValidationError (400)
  - PostizNetworkError (network failures)
- Retry logic:
  - Max 3 retries
  - Exponential backoff (1s, 2s, 4s)
  - Don't retry on 400/401

## Files to Modify
- lib/postiz/client.ts - Main PostizClient
- lib/postiz/types.ts - TypeScript types
- lib/postiz/errors.ts - Error classes
- lib/postiz/utils.ts - Helper functions
- .env.example - Add Postiz configuration
```

---

## Issue #23: Carousel export to images using Puppeteer

**Labels**: `phase-4`, `priority-high`

**Dependencies**:
- [ ] #20 - Carousel drag-and-drop editor

**Issue Body**:

```markdown
## Description
Implement carousel slide export to images using Puppeteer. Render each slide with brand styling as a 1080x1350px image suitable for Instagram/TikTok carousels.

This converts carousel slides into publishable image files.

## Dependencies
- [ ] #20 - Carousel drag-and-drop editor

## Acceptance Criteria
- [ ] Export all slides to images
- [ ] Each image is 1080x1350px (Instagram ratio)
- [ ] Apply brand styling (colors, fonts)
- [ ] Render text with proper formatting
- [ ] Generate images in parallel (performance)
- [ ] Upload images to Supabase Storage
- [ ] Store image URLs in slides table
- [ ] Progress tracking during export
- [ ] Error handling per slide
- [ ] Clean up temporary files

## Technical Notes
- Use Puppeteer for rendering
  - Headless Chrome
  - Viewport: 1080x1350px
  - Device scale factor: 2 (for retina)
- HTML template for slides:
  - Create slide.html template
  - Apply brand colors dynamically
  - Load Google Fonts
  - Render headline, body, CTA
- Export process:
  1. Generate HTML for each slide
  2. Launch Puppeteer browser
  3. Render each slide in new page
  4. Take screenshot as PNG
  5. Upload to Supabase Storage
  6. Update slide with image_url
- Storage path: content/{contentId}/exports/{slideId}.png
- Performance:
  - Reuse browser instance
  - Export slides in parallel (3 concurrent)
  - Timeout: 30s per slide
- Font loading:
  - Load Google Fonts from CDN
  - Wait for fonts to load before screenshot
- Image quality:
  - PNG format
  - Quality: 90
  - Size: ~200-500KB per image
- Clean up:
  - Close browser after export
  - Delete temp HTML files

## Files to Modify
- lib/carousel/export.ts - Main export function
- lib/carousel/template.ts - HTML template
- lib/carousel/puppeteer.ts - Puppeteer wrapper
- templates/slide.html - Slide HTML template
- app/api/content/[id]/export/route.ts - Export endpoint
- components/content/ExportButton.tsx - UI trigger
- components/content/ExportProgress.tsx - Progress indicator
- package.json - Add puppeteer dependency
```

---

## Issue #24: Social post scheduling system

**Labels**: `phase-4`, `priority-high`

**Dependencies**:
- [ ] #22 - Postiz API client integration
- [ ] #23 - Carousel export to images

**Issue Body**:

```markdown
## Description
Implement complete social post scheduling system that exports carousels, creates posts on Postiz, schedules them for specific times, and tracks publication status.

This completes the content-to-publish pipeline.

## Dependencies
- [ ] #22 - Postiz API client integration
- [ ] #23 - Carousel export to images

## Acceptance Criteria
- [ ] Schedule post to Instagram/TikTok
- [ ] Select social account and platform
- [ ] Choose scheduled time (date + time picker)
- [ ] Export carousel to images automatically
- [ ] Upload images to Postiz
- [ ] Create post on Postiz with caption/hashtags
- [ ] Track scheduling status
- [ ] Display scheduled posts list
- [ ] Cancel scheduled posts
- [ ] Handle scheduling failures with retry

## Technical Notes
- Scheduling workflow:
  1. User selects content piece to schedule
  2. Choose social account and platform
  3. Pick scheduled time (future date)
  4. System exports carousel to images
  5. Uploads images to Postiz
  6. Creates post with caption/hashtags
  7. Schedules post on Postiz
  8. Saves scheduled_post record
- API endpoints:
  - POST /api/content/[id]/schedule - Schedule post
  - GET /api/scheduled-posts?brandId={id} - List scheduled
  - DELETE /api/scheduled-posts/[id] - Cancel post
  - POST /api/scheduled-posts/[id]/retry - Retry failed
- Scheduled post fields:
  - content_piece_id
  - platform (instagram/tiktok)
  - postiz_job_id (from Postiz)
  - scheduled_at (user-selected time)
  - published_at (null until published)
  - status (pending/published/failed)
  - error_message (if failed)
- UI components:
  - Schedule modal with form
  - Calendar + time picker
  - Social account selector
  - Scheduled posts calendar view
  - Status indicators
- Status sync:
  - Cron job checks Postiz every 15 minutes
  - Updates published_at when post goes live
  - Updates status to published/failed
- Error handling:
  - Export failure → Show error, allow retry
  - Postiz API failure → Retry 3 times
  - Store error message for debugging
- Validation:
  - Scheduled time must be in future
  - At least 5 minutes from now
  - Content must be approved
  - Social account must exist

## Files to Modify
- app/api/content/[id]/schedule/route.ts - Schedule endpoint
- app/api/scheduled-posts/route.ts - List scheduled
- app/api/scheduled-posts/[id]/route.ts - Cancel/retry
- app/api/scheduled-posts/sync/route.ts - Status sync
- app/(dashboard)/scheduled/page.tsx - Scheduled posts page
- components/content/ScheduleModal.tsx - Schedule form
- components/scheduled/ScheduledPostsList.tsx - List view
- components/scheduled/ScheduledPostsCalendar.tsx - Calendar view
- lib/actions/schedule-post.ts - Scheduling logic
- lib/cron/sync-postiz-status.ts - Status sync job
```

---

## Issue #25: Content publishing workflow completion

**Labels**: `phase-4`, `priority-medium`

**Dependencies**:
- [ ] #21 - Content approval workflow
- [ ] #24 - Social post scheduling system

**Issue Body**:

```markdown
## Description
Complete the end-to-end content publishing workflow connecting approval, scheduling, and publication. Update content status through the full lifecycle and provide visibility into the publishing pipeline.

This ties together approval and scheduling into a seamless workflow.

## Dependencies
- [ ] #21 - Content approval workflow
- [ ] #24 - Social post scheduling system

## Acceptance Criteria
- [ ] Approved content can be scheduled
- [ ] Schedule button only shows for approved content
- [ ] Content status updates to "scheduled" after scheduling
- [ ] Content status updates to "published" after publication
- [ ] Publishing history visible in content detail
- [ ] Bulk scheduling for multiple content pieces
- [ ] Publishing calendar view
- [ ] Filter content by publishing status
- [ ] Publishing analytics (scheduled vs published counts)
- [ ] Notification on successful publication

## Technical Notes
- Status flow:
  - draft → pending_approval → approved → scheduled → published
- After scheduling:
  - Update content_pieces.status to 'scheduled'
  - Create scheduled_posts record
  - Link content to scheduled post
- After publication:
  - Update content_pieces.status to 'published'
  - Update scheduled_posts.published_at
  - Update scheduled_posts.status to 'published'
- UI additions:
  - Publishing tab in content list
  - Publishing calendar (month view)
  - Scheduled vs Published metrics
  - Bulk actions: "Schedule selected"
- Publishing calendar:
  - Month view with date cells
  - Show scheduled posts as events
  - Click event to see details
  - Color coding by platform
- Bulk scheduling:
  - Select multiple approved content
  - Choose schedule dates/times
  - Distribute evenly or custom
  - Handle failures gracefully
- Analytics:
  - Total content pieces
  - Approved count
  - Scheduled count
  - Published count
  - Publishing rate (posts/week)
- Notifications:
  - Toast on successful schedule
  - Toast on successful publish
  - Email digest (optional)

## Files to Modify
- app/(dashboard)/publishing/page.tsx - Publishing overview
- app/(dashboard)/publishing/calendar/page.tsx - Calendar view
- components/publishing/PublishingCalendar.tsx - Calendar component
- components/publishing/BulkSchedule.tsx - Bulk actions
- components/publishing/PublishingMetrics.tsx - Analytics
- components/content/ScheduleButton.tsx - Conditional rendering
- lib/actions/update-content-status.ts - Status updates
- lib/queries/publishing-stats.ts - Analytics queries
```

---

## Issue #26: Metrics tracking and display system

**Labels**: `phase-5`, `priority-medium`

**Dependencies**:
- [ ] #25 - Content publishing workflow

**Issue Body**:

```markdown
## Description
Implement metrics tracking system for published content. Store and display performance metrics like impressions, likes, comments, shares, and clicks for each published post.

This provides performance visibility for published content.

## Dependencies
- [ ] #25 - Content publishing workflow

## Acceptance Criteria
- [ ] Metrics CRUD API endpoints
- [ ] Store metrics per published post
- [ ] Display metrics in content detail
- [ ] Metrics fields: impressions, likes, comments, shares, clicks
- [ ] Captured_at timestamp tracking
- [ ] Historical metrics (multiple captures)
- [ ] Metrics comparison over time
- [ ] Export metrics to CSV
- [ ] Metrics sync from social platforms (manual entry for now)
- [ ] Metrics badges in content cards

## Technical Notes
- API endpoints:
  - POST /api/metrics - Create metrics entry
  - GET /api/metrics?scheduledPostId={id} - Get metrics
  - PATCH /api/metrics/[id] - Update metrics
  - GET /api/metrics/export?brandId={id} - Export CSV
- Metrics fields (per scheduled_post):
  - impressions (integer)
  - likes (integer)
  - comments (integer)
  - shares (integer)
  - clicks (integer)
  - captured_at (timestamp)
- Multiple captures:
  - Allow multiple metrics entries per post
  - Track over time (daily, weekly)
  - Show trends (up/down arrows)
- UI components:
  - Metrics panel in content detail
  - Metrics input form (manual entry)
  - Metrics chart (line graph)
  - Metrics comparison table
- Metrics display:
  - Format numbers (1.2K, 10.5K)
  - Percentage changes
  - Best performing metric highlighted
- CSV export:
  - Include all metrics fields
  - Timestamp each row
  - Filter by date range, brand, campaign
- Future: Auto-sync from Instagram/TikTok API
  - Not implemented in this issue
  - Manual entry for now

## Files to Modify
- app/api/metrics/route.ts - Create and list
- app/api/metrics/[id]/route.ts - Update
- app/api/metrics/export/route.ts - CSV export
- app/(dashboard)/content/[id]/metrics/page.tsx - Metrics page
- components/metrics/MetricsPanel.tsx - Display metrics
- components/metrics/MetricsForm.tsx - Manual entry
- components/metrics/MetricsChart.tsx - Line chart
- components/metrics/MetricsBadge.tsx - Small display
- lib/actions/metrics.ts - Server Actions
- lib/validations/metrics.ts - Zod schemas
- lib/utils/metrics-format.ts - Number formatting
- lib/export/metrics-csv.ts - CSV generation
```

---

## Issue #27: Analytics dashboard with visualizations

**Labels**: `phase-5`, `priority-medium`

**Dependencies**:
- [ ] #26 - Metrics tracking and display

**Issue Body**:

```markdown
## Description
Build comprehensive analytics dashboard with visualizations for campaigns, content performance, publishing trends, and social media metrics. Provide insights into content effectiveness and campaign ROI.

This gives agency owners and clients data-driven insights.

## Dependencies
- [ ] #26 - Metrics tracking and display

## Acceptance Criteria
- [ ] Analytics dashboard page
- [ ] Campaign performance overview
- [ ] Content performance metrics
- [ ] Publishing activity charts
- [ ] Social media engagement metrics
- [ ] Date range filter (7d, 30d, 90d, custom)
- [ ] Brand filter (multi-select)
- [ ] Campaign filter (multi-select)
- [ ] Export reports to PDF
- [ ] Responsive charts and tables

## Technical Notes
- Dashboard sections:
  1. Overview cards (total posts, total engagement, avg performance)
  2. Publishing activity chart (posts per day/week)
  3. Top performing content (by engagement)
  4. Campaign comparison table
  5. Engagement trends (line chart)
  6. Platform breakdown (pie chart)
- Charts library: Recharts or Chart.js
  - Line charts for trends
  - Bar charts for comparisons
  - Pie charts for distribution
  - Area charts for cumulative metrics
- KPI cards:
  - Total posts published
  - Total impressions
  - Total engagement (likes + comments + shares)
  - Average engagement rate
  - Posts per week
- Top content:
  - Sort by engagement
  - Show thumbnail, title, metrics
  - Link to content detail
- Campaign comparison:
  - Table with campaigns as rows
  - Metrics as columns
  - Sort by any metric
  - Highlight top performer
- Filters:
  - Date range picker
  - Brand multi-select
  - Campaign multi-select
  - Platform filter
- API endpoints:
  - GET /api/analytics/overview - Summary stats
  - GET /api/analytics/trends - Time series data
  - GET /api/analytics/top-content - Best performers
  - GET /api/analytics/campaigns - Campaign stats
  - POST /api/analytics/export - PDF report
- PDF export:
  - Include all dashboard data
  - Charts as images
  - Tables formatted
  - Brand header/footer
  - Use Puppeteer or PDFKit

## Files to Modify
- app/(dashboard)/analytics/page.tsx - Dashboard page
- app/api/analytics/overview/route.ts - Overview stats
- app/api/analytics/trends/route.ts - Trends data
- app/api/analytics/top-content/route.ts - Top content
- app/api/analytics/campaigns/route.ts - Campaign stats
- app/api/analytics/export/route.ts - PDF export
- components/analytics/OverviewCards.tsx - KPI cards
- components/analytics/PublishingChart.tsx - Activity chart
- components/analytics/EngagementChart.tsx - Engagement trends
- components/analytics/TopContentList.tsx - Best performers
- components/analytics/CampaignTable.tsx - Comparison table
- components/analytics/PlatformBreakdown.tsx - Pie chart
- components/analytics/DateRangePicker.tsx - Date filter
- components/analytics/ExportButton.tsx - PDF export
- lib/queries/analytics.ts - Database queries
- lib/export/analytics-pdf.ts - PDF generation
```

---

## Issue #28: Performance optimization and error handling

**Labels**: `phase-5`, `priority-high`

**Dependencies**:
- [ ] #27 - Analytics dashboard

**Issue Body**:

```markdown
## Description
Implement comprehensive performance optimizations and error handling throughout the application. Add caching, database query optimization, loading states, error boundaries, and monitoring.

This ensures the application is production-ready, fast, and reliable.

## Dependencies
- [ ] #27 - Analytics dashboard

## Acceptance Criteria
- [ ] Database query optimization (indexes, N+1 prevention)
- [ ] API response caching (Redis or in-memory)
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting and lazy loading
- [ ] Error boundaries for all major sections
- [ ] Global error handling
- [ ] Loading skeletons for all pages
- [ ] Toast notifications for user actions
- [ ] Performance monitoring setup
- [ ] Security headers configured

## Technical Notes
- Database optimization:
  - Review all queries for N+1 problems
  - Add missing indexes (check slow query log)
  - Use select() to limit columns
  - Implement pagination everywhere
  - Use database views for complex queries
- Caching strategy:
  - Cache static data (brands, campaigns)
  - Cache computed analytics (5 minutes)
  - Use SWR or TanStack Query for client caching
  - Implement stale-while-revalidate
- Image optimization:
  - Replace <img> with next/image
  - Use proper sizes and quality settings
  - Lazy load offscreen images
  - Serve WebP format
- Code splitting:
  - Lazy load dashboard pages
  - Lazy load heavy components (charts, editor)
  - Use dynamic imports
  - Split vendor chunks
- Error boundaries:
  - app/(dashboard)/error.tsx - Dashboard errors
  - app/(dashboard)/[...]/error.tsx - Nested errors
  - Fallback UI with retry button
  - Error logging to console/service
- Global error handler:
  - Catch unhandled promise rejections
  - Catch unhandled exceptions
  - Log to error monitoring service (Sentry optional)
- Loading states:
  - Skeleton components for all pages
  - Loading spinners for actions
  - Optimistic updates where appropriate
  - Disable buttons during submission
- Toast notifications:
  - Success: green toast
  - Error: red toast
  - Info: blue toast
  - Position: top-right
  - Auto-dismiss: 3-5 seconds
- Performance monitoring:
  - Next.js Analytics
  - Web Vitals tracking
  - Core Web Vitals reporting
- Security headers:
  - CSP (Content Security Policy)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- Environment checks:
  - Validate env vars on startup
  - Fail fast if required vars missing
  - Type-safe env var access

## Files to Modify
- app/(dashboard)/error.tsx - Error boundary
- app/(dashboard)/loading.tsx - Loading state
- app/global-error.tsx - Global error handler
- components/ui/skeleton.tsx - Skeleton component
- components/ui/toast.tsx - Already from Shadcn
- lib/cache/redis.ts - Cache client (optional)
- lib/monitoring/performance.ts - Performance tracking
- lib/monitoring/error-logger.ts - Error logging
- lib/utils/env.ts - Environment validation
- next.config.ts - Security headers, image config
- middleware.ts - Add security headers
- lib/db/query-builder.ts - Query optimization helpers
- package.json - Add @tanstack/react-query
```

---

## Summary

**Total Issues**: 28 (9 created, 19 remaining)

**Phases**:
- Phase 1 (Foundation): 6 issues - All created ✅
- Phase 2 (Core API): 8 issues - 5 remaining (10-14)
- Phase 3 (Content): 7 issues - All remaining (15-21)
- Phase 4 (Distribution): 4 issues - All remaining (22-25)
- Phase 5 (Analytics): 3 issues - All remaining (26-28)

**Next Steps**:
1. Create issues 10-28 using the exact markdown above
2. Each issue should be created with the labels specified
3. Dependencies will be automatically tracked
4. As Phase 1 completes, Phase 2 issues will become kimi-ready
5. The workflow will continue automatically through all phases

**Important Notes**:
- Maintain the exact dependency structure as specified
- Use the labels exactly as shown (phase-X, priority-X)
- Do not add kimi-ready label to issues with unmet dependencies
- The workflows will handle automatic progression
- Issue #1 is already kimi-ready and will start the chain
