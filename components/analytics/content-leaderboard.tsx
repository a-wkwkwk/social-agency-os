'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentPerformance } from '@/types/analytics';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';

interface ContentLeaderboardProps {
  content: ContentPerformance[];
  title?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function ContentLeaderboard({ content, title = 'Top Performing Content' }: ContentLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {content.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No published content yet</p>
          ) : (
            content.map((item, index) => (
              <div
                key={item.contentId}
                className="flex items-start justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 line-clamp-1">{item.title}</h4>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {formatNumber(item.impressions)}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {formatNumber(item.likes)}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {formatNumber(item.comments)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {item.engagementRate.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString()
                      : 'Not published'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
