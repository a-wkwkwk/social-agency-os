'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PlatformBreakdownProps {
  platforms: {
    platform: string;
    impressions: number;
    posts: number;
  }[];
}

const COLORS = {
  instagram: '#E4405F',
  tiktok: '#000000',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  other: '#6B7280',
};

export function PlatformBreakdown({ platforms }: PlatformBreakdownProps) {
  const data = platforms.map((p) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    value: p.impressions,
    posts: p.posts,
  }));

  const getColor = (name: string) => {
    const key = name.toLowerCase() as keyof typeof COLORS;
    return COLORS[key] || COLORS.other;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} impressions`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {platforms.map((p) => (
            <div key={p.platform} className="flex justify-between items-center text-sm">
              <span className="capitalize">{p.platform}</span>
              <div className="flex items-center space-x-4 text-slate-600">
                <span>{p.posts} posts</span>
                <span className="font-medium">{p.impressions.toLocaleString()} impressions</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
