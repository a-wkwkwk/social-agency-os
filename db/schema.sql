-- Marketing Agency OS - Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 4.1 Core Identity
-- ============================================

-- Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('owner', 'staff', 'client')) DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (agency or brand)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('agency', 'brand')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Memberships (users to organizations)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'staff', 'client')) DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- ============================================
-- 4.2 Brands & Identity
-- ============================================

-- Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Brand Style Guides
CREATE TABLE brand_style_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    primary_color TEXT,
    secondary_color TEXT,
    accent_color TEXT,
    heading_font TEXT,
    body_font TEXT,
    logo_url TEXT,
    voice_guidelines TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4.3 Products & Campaigns
-- ============================================

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT CHECK (objective IN ('awareness', 'engagement', 'conversions')) NOT NULL,
    start_date DATE,
    end_date DATE,
    frequency_target_per_week INTEGER,
    channels TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Campaign Products (many-to-many)
CREATE TABLE campaign_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, product_id)
);

-- ============================================
-- 4.4 Content & Carousels
-- ============================================

-- Content Pieces
CREATE TABLE content_pieces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('carousel', 'single_post')) DEFAULT 'carousel',
    status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'published')) DEFAULT 'draft',
    approval_comment TEXT,
    llm_prompt JSONB,
    llm_raw_output JSONB,
    caption TEXT,
    hashtags TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Carousel Slides
CREATE TABLE carousel_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_piece_id UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    slide_type TEXT CHECK (slide_type IN ('hook', 'proof', 'tutorial', 'cta', 'generic')) DEFAULT 'generic',
    headline TEXT,
    body TEXT,
    cta_text TEXT,
    image_description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_piece_id, position)
);

-- Content Comments
CREATE TABLE content_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_piece_id UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
    author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4.5 Social Accounts, Scheduling, Metrics
-- ============================================

-- Social Accounts
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    platform TEXT CHECK (platform IN ('instagram', 'tiktok')) NOT NULL,
    postiz_account_id TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Posts
CREATE TABLE scheduled_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_piece_id UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
    platform TEXT CHECK (platform IN ('instagram', 'tiktok')) NOT NULL,
    postiz_job_id TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'published', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(organization_id);
CREATE INDEX idx_brands_org ON brands(organization_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_campaigns_brand ON campaigns(brand_id);
CREATE INDEX idx_content_brand ON content_pieces(brand_id);
CREATE INDEX idx_content_campaign ON content_pieces(campaign_id);
CREATE INDEX idx_content_status ON content_pieces(status);
CREATE INDEX idx_slides_content ON carousel_slides(content_piece_id);
CREATE INDEX idx_comments_content ON content_comments(content_piece_id);
CREATE INDEX idx_social_brand ON social_accounts(brand_id);
CREATE INDEX idx_scheduled_content ON scheduled_posts(content_piece_id);
CREATE INDEX idx_metrics_post ON metrics(scheduled_post_id);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_style_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/update their own
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE user_id = auth.uid()
        AND organization_id = org_id
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organization IDs
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS TABLE(org_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id FROM memberships
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations: members can view, owners can update/delete
CREATE POLICY "Org members can view" ON organizations
    FOR SELECT USING (is_org_member(id));

CREATE POLICY "Org owners can update" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE user_id = auth.uid()
            AND organization_id = organizations.id
            AND role = 'owner'
        )
    );

-- Memberships: viewable by org members
CREATE POLICY "Org members can view memberships" ON memberships
    FOR SELECT USING (is_org_member(organization_id));

-- Brands: accessible to org members
CREATE POLICY "Org members can view brands" ON brands
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organizations o
            JOIN memberships m ON m.organization_id = o.id
            WHERE o.id = brands.organization_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can create brands" ON brands
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE user_id = auth.uid()
            AND organization_id = brands.organization_id
        )
    );

CREATE POLICY "Org members can update brands" ON brands
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE user_id = auth.uid()
            AND organization_id = brands.organization_id
        )
    );

-- Style Guides: follows brand permissions
CREATE POLICY "Org members can view style guides" ON brand_style_guides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands b
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE b.id = brand_style_guides.brand_id
            AND m.user_id = auth.uid()
        )
    );

-- Products: follows brand permissions
CREATE POLICY "Org members can view products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands b
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE b.id = products.brand_id
            AND m.user_id = auth.uid()
        )
    );

-- Campaigns: follows brand permissions
CREATE POLICY "Org members can view campaigns" ON campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands b
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE b.id = campaigns.brand_id
            AND m.user_id = auth.uid()
        )
    );

-- Content Pieces: follows brand permissions
CREATE POLICY "Org members can view content" ON content_pieces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands b
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE b.id = content_pieces.brand_id
            AND m.user_id = auth.uid()
        )
    );

-- Carousel Slides: follows content permissions
CREATE POLICY "Org members can view slides" ON carousel_slides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content_pieces cp
            JOIN brands b ON b.id = cp.brand_id
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE cp.id = carousel_slides.content_piece_id
            AND m.user_id = auth.uid()
        )
    );

-- Comments: readable by org members, insertable by org members
CREATE POLICY "Org members can view comments" ON content_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content_pieces cp
            JOIN brands b ON b.id = cp.brand_id
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE cp.id = content_comments.content_piece_id
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can create comments" ON content_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM content_pieces cp
            JOIN brands b ON b.id = cp.brand_id
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE cp.id = content_comments.content_piece_id
            AND m.user_id = auth.uid()
        )
    );

-- Social Accounts: follows brand permissions
CREATE POLICY "Org members can view social accounts" ON social_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands b
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE b.id = social_accounts.brand_id
            AND m.user_id = auth.uid()
        )
    );

-- Scheduled Posts: follows content permissions
CREATE POLICY "Org members can view scheduled posts" ON scheduled_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content_pieces cp
            JOIN brands b ON b.id = cp.brand_id
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE cp.id = scheduled_posts.content_piece_id
            AND m.user_id = auth.uid()
        )
    );

-- Metrics: follows scheduled post permissions
CREATE POLICY "Org members can view metrics" ON metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scheduled_posts sp
            JOIN content_pieces cp ON cp.id = sp.content_piece_id
            JOIN brands b ON b.id = cp.brand_id
            JOIN organizations o ON o.id = b.organization_id
            JOIN memberships m ON m.organization_id = o.id
            WHERE sp.id = metrics.scheduled_post_id
            AND m.user_id = auth.uid()
        )
    );

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_style_guides_updated_at BEFORE UPDATE ON brand_style_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pieces_updated_at BEFORE UPDATE ON content_pieces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carousel_slides_updated_at BEFORE UPDATE ON carousel_slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
