'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeSeriesPoint } from '@/types/analytics';

type ChartMetric = 'impressions' | 'likes' | 'comments' | 'shares' | 'clicks';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

const metricColors: Record<ChartMetric, string> = {
  impressions: '#3b82f6',
  likes: '#ef4444',
  comments: '#22c55e',
  shares: '#a855f7',
  clicks: '#f97316',
};

const metricLabels: Record<ChartMetric, string> = {
  impressions: 'Impressions',
  likes: 'Likes',
  comments: 'Comments',
  shares: 'Shares',
  clicks: 'Clicks',
};

export function TimeSeriesChart({ data, title = 'Performance Over Time' }: TimeSeriesChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<ChartMetric[]>(['impressions', 'engagement']);

  const toggleMetric = (metric: ChartMetric) => {
    setActiveMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  // Transform data for the chart - calculate engagement
  const chartData = data.map((point) => ({
    ...point,
    engagement: point.likes + point.comments + point.shares,
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {(Object.keys(metricColors) as ChartMetric[]).map((metric) => (
            <Button
              key={metric}
              variant={activeMetrics.includes(metric) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleMetric(metric)}
              className="text-xs"
            >
              {metricLabels[metric]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {activeMetrics.map((metric) => (
                  <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors[metric]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={metricColors[metric]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              {activeMetrics.map((metric) => (
                <Area
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={metricColors[metric]}
                  fill={`url(#gradient-${metric})`}
                  strokeWidth={2}
                  dot={false}
                  name={metricLabels[metric]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
