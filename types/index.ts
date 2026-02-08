// ============================================
// Core Identity Types
// ============================================

export type UserRole = 'owner' | 'staff' | 'client';
export type OrganizationType = 'agency' | 'brand';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ============================================
// Brand & Identity Types
// ============================================

export interface Brand {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BrandStyleGuide {
  id: string;
  brand_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  heading_font: string | null;
  body_font: string | null;
  logo_url: string | null;
  voice_guidelines: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Product & Campaign Types
// ============================================

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  price: number | null;
  url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CampaignObjective = 'awareness' | 'engagement' | 'conversions';

export interface Campaign {
  id: string;
  brand_id: string;
  name: string;
  objective: CampaignObjective;
  start_date: string | null;
  end_date: string | null;
  frequency_target_per_week: number | null;
  channels: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CampaignProduct {
  id: string;
  campaign_id: string;
  product_id: string;
  created_at: string;
}

export interface CampaignWithProducts extends Campaign {
  products: Product[];
}

// ============================================
// Content & Carousel Types
// ============================================

export type ContentType = 'carousel' | 'single_post';
export type ContentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'scheduled' | 'published';
export type SlideType = 'hook' | 'proof' | 'tutorial' | 'cta' | 'generic';

export interface ContentPiece {
  id: string;
  campaign_id: string | null;
  brand_id: string;
  title: string;
  content_type: ContentType;
  status: ContentStatus;
  approval_comment: string | null;
  llm_prompt: Record<string, unknown> | null;
  llm_raw_output: Record<string, unknown> | null;
  caption: string | null;
  hashtags: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CarouselSlide {
  id: string;
  content_piece_id: string;
  position: number;
  slide_type: SlideType;
  headline: string | null;
  body: string | null;
  cta_text: string | null;
  image_description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentComment {
  id: string;
  content_piece_id: string;
  author_profile_id: string;
  body: string;
  created_at: string;
  author?: Profile;
}

export interface ContentPieceWithSlides extends ContentPiece {
  slides: CarouselSlide[];
  comments: ContentComment[];
  brand?: Brand;
  campaign?: Campaign;
}

// ============================================
// Social & Scheduling Types
// ============================================

export type Platform = 'instagram' | 'tiktok';
export type ScheduledPostStatus = 'pending' | 'published' | 'failed';

export interface SocialAccount {
  id: string;
  brand_id: string;
  platform: Platform;
  postiz_account_id: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  content_piece_id: string;
  platform: Platform;
  postiz_job_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  status: ScheduledPostStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
  id: string;
  scheduled_post_id: string;
  platform: Platform;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  captured_at: string;
  created_at: string;
}

// ============================================
// AI Generation Types
// ============================================

export interface ContentIdea {
  title: string;
  description: string;
}

export interface GeneratedSlide {
  slide_type: SlideType;
  headline: string;
  body: string;
  cta_text: string;
  image_description: string;
}

export interface GenerateIdeasResponse {
  ideas: ContentIdea[];
}

export interface GenerateCarouselResponse {
  slides: GeneratedSlide[];
}

// ============================================
// UI Types
// ============================================

export interface DashboardStats {
  totalBrands: number;
  activeCampaigns: number;
  pendingApprovals: number;
  scheduledPosts: number;
}

export interface CampaignStats {
  campaignId: string;
  totalContent: number;
  publishedContent: number;
  totalImpressions: number;
  totalEngagement: number;
}

// Export analytics types
export * from './analytics';
