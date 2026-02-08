'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Loader2 } from 'lucide-react';
import { MetricsCards } from '@/components/analytics/metrics-cards';
import { TimeSeriesChart } from '@/components/analytics/time-series-chart';
import { ContentLeaderboard } from '@/components/analytics/content-leaderboard';
import { CampaignAnalytics } from '@/types/analytics';

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/analytics?type=campaign&campaignId=${campaignId}`);
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
  }, [campaignId]);

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
            <h1 className="text-3xl font-bold text-slate-900">{analytics.campaignName}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                <Target className="h-3 w-3 mr-1" />
                {analytics.objective}
              </Badge>
              {analytics.startDate && (
                <Badge variant="outline">
                  {new Date(analytics.startDate).toLocaleDateString()} - {analytics.endDate ? new Date(analytics.endDate).toLocaleDateString() : 'Ongoing'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/campaigns/${campaignId}`}>View Campaign</Link>
        </Button>
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

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Content Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.publishedContent} / {analytics.totalContent}
            </div>
            <p className="text-slate-600 text-sm">Content pieces published</p>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ 
                  width: `${analytics.totalContent > 0 ? (analytics.publishedContent / analytics.totalContent) * 100 : 0}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg per Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.publishedContent > 0 
                ? Math.round(analytics.totalImpressions / analytics.publishedContent).toLocaleString()
                : 0}
            </div>
            <p className="text-slate-600 text-sm">Impressions per published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgEngagementRate.toFixed(2)}%
            </div>
            <p className="text-slate-600 text-sm">Average across all content</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      {analytics.timeSeries.length > 0 && (
        <TimeSeriesChart data={analytics.timeSeries} title="Campaign Performance Over Time" />
      )}

      {/* Top Performing Content */}
      <ContentLeaderboard 
        content={analytics.topPerformingContent} 
        title="Top Performing Content"
      />
    </div>
  );
}
