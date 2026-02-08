'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { MetricsCards } from '@/components/analytics/metrics-cards';
import { CampaignBreakdown } from '@/components/analytics/campaign-breakdown';
import { PlatformBreakdown } from '@/components/analytics/platform-breakdown';
import { BrandAnalytics } from '@/types/analytics';

export default function BrandAnalyticsPage() {
  const params = useParams();
  const brandId = params.id as string;
  
  const [analytics, setAnalytics] = useState<BrandAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/analytics?type=brand&brandId=${brandId}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [brandId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/analytics">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Analytics Error</h1>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/analytics">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{analytics.brandName}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                <Building2 className="h-3 w-3 mr-1" />
                {analytics.activeCampaigns} active campaigns
              </Badge>
              <Badge variant="outline">
                {analytics.publishedContent} published
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsCards
        impressions={analytics.totalImpressions}
        likes={analytics.totalLikes}
        comments={analytics.totalComments}
        shares={analytics.totalShares}
        clicks={analytics.totalClicks}
        engagementRate={analytics.avgEngagementRate}
      />

      {/* Campaign Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignBreakdown campaigns={analytics.campaignBreakdown} />
        <PlatformBreakdown platforms={analytics.platformBreakdown} />
      </div>

      {/* Campaigns List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
        <div className="grid grid-cols-1 gap-4">
          {analytics.campaignBreakdown.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">No campaigns yet</p>
              <Button className="mt-4" asChild>
                <Link href={`/campaigns/new?brand=${brandId}`}>Create Campaign</Link>
              </Button>
            </Card>
          ) : (
            analytics.campaignBreakdown.map((campaign) => (
              <Link key={campaign.campaignId} href={`/analytics/campaign/${campaign.campaignId}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.campaignName}</h3>
                        <p className="text-slate-600 text-sm mt-1">
                          {campaign.impressions.toLocaleString()} impressions
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {campaign.engagement.toLocaleString()} engagements
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
