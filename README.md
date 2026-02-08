# Marketing Agency OS

A comprehensive social media content management platform for marketing agencies. Manage brands, campaigns, generate AI-powered content, and schedule posts to Instagram and TikTok via Postiz.

## Features

### Core Modules
- **Brand Management** - Onboard clients with full brand identity (colors, fonts, voice guidelines)
- **Product Catalog** - Define products/services for each brand
- **Campaign Management** - Create campaigns with objectives, dates, and target channels
- **AI-Powered Content Creation** - Generate content ideas and carousel slides using Kimi CLI
- **Carousel Editor** - Drag-and-drop slide editor with live preview
- **Content Approval Workflow** - Draft → Pending Approval → Approved → Scheduled → Published
- **Social Scheduling** - Schedule posts to Instagram/TikTok via Postiz API
- **Performance Metrics** - Track impressions, likes, comments, shares, clicks

### User Roles
- **Agency Owner** - Full access, manage subscription/clients
- **Agency Staff (Content Strategist)** - Create campaigns and briefs
- **Agency Staff (Content Creator)** - Generate and edit content
- **Brand Client** - Review, comment, approve/reject content

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Kimi CLI (local command line)
- **Social Distribution**: Postiz API

## Quick Start

### Prerequisites

1. Node.js 18+
2. Supabase account (or self-hosted instance)
3. Kimi CLI installed locally
4. Postiz account (optional, for scheduling)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-instance.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Postiz API Configuration (optional)
POSTIZ_API_URL=https://api.postiz.com
POSTIZ_API_KEY=your-postiz-api-key

# Kimi CLI Path
KIMI_CLI_PATH=kimi

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the SQL migration in Supabase SQL Editor:

```bash
# Copy contents of db/schema.sql into Supabase SQL Editor and execute
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
marketing-agency-os/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Dashboard routes (with layout)
│   │   ├── brands/           # Brand management
│   │   ├── campaigns/        # Campaign management
│   │   ├── content/          # Content & carousel editor
│   │   ├── products/         # Product catalog
│   │   ├── analytics/        # Dashboard analytics
│   │   └── settings/         # User settings
│   ├── api/                  # API routes
│   │   ├── ai/               # AI generation endpoints
│   │   └── postiz/           # Postiz integration
│   ├── auth/                 # Authentication pages
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Shadcn UI components
│   ├── carousel/             # Carousel editor components
│   └── dashboard/            # Dashboard components
├── lib/                      # Utility libraries
│   ├── supabase/             # Supabase client & auth
│   ├── ai/                   # Kimi CLI integration
│   ├── postiz/               # Postiz API client
│   └── carousel/             # Carousel export utilities
├── db/                       # Database schema
│   └── schema.sql            # Full database schema
├── types/                    # TypeScript types
└── public/                   # Static assets
```

## Database Schema

### Core Tables
- `profiles` - User profiles extending Supabase Auth
- `organizations` - Agency or brand organizations
- `memberships` - User-organization relationships
- `brands` - Brand workspaces
- `brand_style_guides` - Visual identity (colors, fonts, voice)
- `products` - Products/services per brand
- `campaigns` - Marketing campaigns
- `campaign_products` - Many-to-many linking
- `content_pieces` - Content items (carousels/posts)
- `carousel_slides` - Individual slides
- `content_comments` - Approval comments
- `social_accounts` - Connected social accounts
- `scheduled_posts` - Scheduled/published posts
- `metrics` - Performance data

## API Routes

### AI Generation
- `POST /api/ai/generate-ideas` - Generate content ideas from campaign context
- `POST /api/ai/generate-carousel` - Generate carousel slides for a content piece

### Postiz Integration
- `POST /api/postiz/schedule` - Schedule a post to social media

## Key Workflows

### 1. Brand Onboarding
1. Create brand (name, industry, description)
2. Set up style guide (colors, fonts, voice)
3. Add products

### 2. Campaign Creation
1. Create campaign with objective and dates
2. Select target products
3. Define posting frequency

### 3. AI Content Generation
1. Select campaign → "Generate Ideas"
2. AI generates 5 content ideas
3. Select idea → "Generate Carousel"
4. AI creates 5-7 slides with headlines, body, CTAs

### 4. Content Editing
1. Edit slides in drag-and-drop editor
2. Reorder slides
3. Edit text fields
4. Preview with brand styling

### 5. Approval & Publishing
1. Submit for approval
2. Client reviews and approves
3. Schedule via Postiz
4. Track metrics

## Carousel Export

Slides can be exported as images (1080×1350) using Puppeteer:

```typescript
import { exportSlidesToImages } from '@/lib/carousel/export';

const images = await exportSlidesToImages(slides, styleGuide);
```

## Security

- Row Level Security (RLS) policies on all tables
- Users can only access their organization's data
- JWT-based authentication via Supabase Auth

## Roadmap

- [ ] Email notifications for approvals
- [ ] Advanced analytics dashboards
- [ ] Bulk scheduling
- [ ] AI image generation integration
- [ ] Team collaboration features
- [ ] Client portal white-labeling

## License

MIT
