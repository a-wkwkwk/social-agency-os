'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, Share2, MousePointer, TrendingUp } from 'lucide-react';

interface MetricsCardsProps {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function MetricsCards({
  impressions,
  likes,
  comments,
  shares,
  clicks,
  engagementRate,
}: MetricsCardsProps) {
  const metrics = [
    { label: 'Impressions', value: impressions, icon: Eye, color: 'text-blue-500' },
    { label: 'Likes', value: likes, icon: Heart, color: 'text-red-500' },
    { label: 'Comments', value: comments, icon: MessageCircle, color: 'text-green-500' },
    { label: 'Shares', value: shares, icon: Share2, color: 'text-purple-500' },
    { label: 'Clicks', value: clicks, icon: MousePointer, color: 'text-orange-500' },
    { label: 'Engagement Rate', value: `${engagementRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-teal-500', isText: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {metric.label}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {metric.isText ? metric.value : formatNumber(metric.value as number)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
