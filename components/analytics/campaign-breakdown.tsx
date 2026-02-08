'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CampaignBreakdownProps {
  campaigns: {
    campaignId: string;
    campaignName: string;
    impressions: number;
    engagement: number;
  }[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#14b8a6'];

export function CampaignBreakdown({ campaigns }: CampaignBreakdownProps) {
  const data = campaigns.map((c) => ({
    name: c.campaignName.length > 15 ? c.campaignName.slice(0, 15) + '...' : c.campaignName,
    impressions: c.impressions,
    engagement: c.engagement,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()
                }
              />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="impressions" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
