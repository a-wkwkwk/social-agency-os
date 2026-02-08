import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BrandAnalytics, CampaignAnalytics, AgencyOverview } from '@/types/analytics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const brandId = searchParams.get('brandId');
    const campaignId = searchParams.get('campaignId');

    if (type === 'agency') {
      // Get agency-wide overview
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name');

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, brand_id');

      const { data: contentPieces } = await supabase
        .from('content_pieces')
        .select('id, brand_id, status');

      const { data: metrics } = await supabase
        .from('metrics')
        .select('impressions, likes, comments, shares, clicks, captured_at');

      const totalBrands = brands?.length || 0;
      const totalCampaigns = campaigns?.length || 0;
      const totalContent = contentPieces?.length || 0;
      const totalPublished = contentPieces?.filter(c => c.status === 'published').length || 0;
      
      const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
      const totalLikes = metrics?.reduce((sum, m) => sum + (m.likes || 0), 0) || 0;
      const totalComments = metrics?.reduce((sum, m) => sum + (m.comments || 0), 0) || 0;
      const totalShares = metrics?.reduce((sum, m) => sum + (m.shares || 0), 0) || 0;
      const totalEngagement = totalLikes + totalComments + totalShares;
      const avgEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

      // Calculate top brands by impressions
      const brandImpressions: Record<string, number> = {};
      metrics?.forEach((m) => {
        // This is simplified - in reality you'd join through scheduled_posts -> content_pieces
        // For now, we'll aggregate randomly
      });

      const overview: AgencyOverview = {
        totalBrands,
        totalCampaigns,
        totalContent,
        totalPublished,
        totalImpressions,
        totalEngagement,
        avgEngagementRate,
        topPerformingBrands: [],
        recentActivity: [],
      };

      return NextResponse.json(overview);
    }

    if (type === 'brand' && brandId) {
      // Get brand-specific analytics
      const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (!brand) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', brandId);

      const { data: contentPieces } = await supabase
        .from('content_pieces')
        .select('*, carousel_slides(*)')
        .eq('brand_id', brandId);

      const { data: scheduledPosts } = await supabase
        .from('scheduled_posts')
        .select('*, metrics(*)')
        .in('content_piece_id', contentPieces?.map(c => c.id) || []);

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => {
        const endDate = c.end_date ? new Date(c.end_date) : null;
        return !endDate || endDate >= new Date();
      }).length || 0;

      const totalContent = contentPieces?.length || 0;
      const publishedContent = contentPieces?.filter(c => c.status === 'published').length || 0;

      let totalImpressions = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalClicks = 0;

      scheduledPosts?.forEach((post) => {
        if (post.metrics && Array.isArray(post.metrics)) {
          post.metrics.forEach((m: any) => {
            totalImpressions += m.impressions || 0;
            totalLikes += m.likes || 0;
            totalComments += m.comments || 0;
            totalShares += m.shares || 0;
            totalClicks += m.clicks || 0;
          });
        }
      });

      const totalEngagement = totalLikes + totalComments + totalShares;
      const avgEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

      // Campaign breakdown
      const campaignBreakdown = campaigns?.map(c => {
        const campaignPosts = scheduledPosts?.filter(p => {
          const content = contentPieces?.find(cp => cp.id === p.content_piece_id);
          return content?.campaign_id === c.id;
        }) || [];
        
        let impressions = 0;
        let engagement = 0;
        campaignPosts.forEach((post: any) => {
          if (post.metrics) {
            post.metrics.forEach((m: any) => {
              impressions += m.impressions || 0;
              engagement += (m.likes || 0) + (m.comments || 0) + (m.shares || 0);
            });
          }
        });

        return {
          campaignId: c.id,
          campaignName: c.name,
          impressions,
          engagement,
        };
      }) || [];

      // Platform breakdown
      const platformStats: Record<string, { impressions: number; posts: number }> = {};
      scheduledPosts?.forEach((post: any) => {
        const platform = post.platform || 'unknown';
        if (!platformStats[platform]) {
          platformStats[platform] = { impressions: 0, posts: 0 };
        }
        platformStats[platform].posts += 1;
        
        if (post.metrics) {
          post.metrics.forEach((m: any) => {
            platformStats[platform].impressions += m.impressions || 0;
          });
        }
      });

      const platformBreakdown = Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        ...stats,
      }));

      const analytics: BrandAnalytics = {
        brandId,
        brandName: brand.name,
        totalCampaigns,
        activeCampaigns,
        totalContent,
        publishedContent,
        totalImpressions,
        totalLikes,
        totalComments,
        totalShares,
        totalClicks,
        avgEngagementRate,
        campaignBreakdown,
        platformBreakdown,
        monthlyTrend: [],
      };

      return NextResponse.json(analytics);
    }

    if (type === 'campaign' && campaignId) {
      // Get campaign-specific analytics
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const { data: contentPieces } = await supabase
        .from('content_pieces')
        .select('*, carousel_slides(*)')
        .eq('campaign_id', campaignId);

      const { data: scheduledPosts } = await supabase
        .from('scheduled_posts')
        .select('*, metrics(*)')
        .in('content_piece_id', contentPieces?.map(c => c.id) || []);

      const totalContent = contentPieces?.length || 0;
      const publishedContent = contentPieces?.filter(c => c.status === 'published').length || 0;

      let totalImpressions = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalClicks = 0;

      const contentPerformance: any[] = [];

      contentPieces?.forEach((content) => {
        const posts = scheduledPosts?.filter(p => p.content_piece_id === content.id) || [];
        let contentImpressions = 0;
        let contentLikes = 0;
        let contentComments = 0;
        let contentShares = 0;
        let contentClicks = 0;
        let publishedAt: string | null = null;

        posts.forEach((post: any) => {
          if (post.published_at) {
            publishedAt = post.published_at;
          }
          if (post.metrics) {
            post.metrics.forEach((m: any) => {
              contentImpressions += m.impressions || 0;
              contentLikes += m.likes || 0;
              contentComments += m.comments || 0;
              contentShares += m.shares || 0;
              contentClicks += m.clicks || 0;
            });
          }
        });

        totalImpressions += contentImpressions;
        totalLikes += contentLikes;
        totalComments += contentComments;
        totalShares += contentShares;
        totalClicks += contentClicks;

        const engagement = contentLikes + contentComments + contentShares;
        const engagementRate = contentImpressions > 0 ? (engagement / contentImpressions) * 100 : 0;

        contentPerformance.push({
          contentId: content.id,
          title: content.title,
          status: content.status,
          publishedAt,
          impressions: contentImpressions,
          likes: contentLikes,
          comments: contentComments,
          shares: contentShares,
          clicks: contentClicks,
          engagementRate,
        });
      });

      const totalEngagement = totalLikes + totalComments + totalShares;
      const avgEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

      // Sort by engagement rate for top performing
      const topPerformingContent = contentPerformance
        .filter(c => c.status === 'published')
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 5);

      const analytics: CampaignAnalytics = {
        campaignId,
        campaignName: campaign.name,
        objective: campaign.objective,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        totalContent,
        publishedContent,
        totalImpressions,
        totalLikes,
        totalComments,
        totalShares,
        totalClicks,
        avgEngagementRate,
        timeSeries: [],
        topPerformingContent,
      };

      return NextResponse.json(analytics);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
