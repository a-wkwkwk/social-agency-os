// Analytics Types for Marketing Agency OS

export interface TimeSeriesPoint {
  date: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  status: string;
  publishedAt: string | null;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  objective: string;
  startDate: string | null;
  endDate: string | null;
  totalContent: number;
  publishedContent: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  avgEngagementRate: number;
  timeSeries: TimeSeriesPoint[];
  topPerformingContent: ContentPerformance[];
}

export interface BrandAnalytics {
  brandId: string;
  brandName: string;
  totalCampaigns: number;
  activeCampaigns: number;
  totalContent: number;
  publishedContent: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  avgEngagementRate: number;
  campaignBreakdown: {
    campaignId: string;
    campaignName: string;
    impressions: number;
    engagement: number;
  }[];
  platformBreakdown: {
    platform: string;
    impressions: number;
    posts: number;
  }[];
  monthlyTrend: TimeSeriesPoint[];
}

export interface AgencyOverview {
  totalBrands: number;
  totalCampaigns: number;
  totalContent: number;
  totalPublished: number;
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPerformingBrands: {
    brandId: string;
    brandName: string;
    impressions: number;
    engagementRate: number;
  }[];
  recentActivity: {
    date: string;
    impressions: number;
    likes: number;
    comments: number;
  }[];
}

export type MetricType = 'impressions' | 'likes' | 'comments' | 'shares' | 'clicks' | 'engagement';

export interface DateRange {
  from: Date;
  to: Date;
}
