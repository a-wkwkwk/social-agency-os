import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Target, BarChart3, TrendingUp } from 'lucide-react';
import { Brand } from '@/types';

async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('brands')
    .select('*')
    .is('deleted_at', null)
    .order('name');
  return data || [];
}

async function getCampaignsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  return count || 0;
}

async function getContentStats() {
  const supabase = await createClient();
  const { count: total } = await supabase
    .from('content_pieces')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  
  const { count: published } = await supabase
    .from('content_pieces')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('deleted_at', null);

  return { total: total || 0, published: published || 0 };
}

export default async function AnalyticsPage() {
  const brands = await getBrands();
  const campaignsCount = await getCampaignsCount();
  const contentStats = await getContentStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">Performance insights across your agency</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Brands</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Content Pieces</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.total}</div>
            <p className="text-xs text-slate-500">{contentStats.published} published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-slate-500">Connect metrics to see data</p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Analytics Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Brand Analytics</h2>
        {brands.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No brands yet. Add a brand to see analytics.</p>
            <Button className="mt-4" asChild>
              <Link href="/brands/new">Add Brand</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/analytics/brand/${brand.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{brand.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm">
                      View performance metrics, campaign breakdowns, and content analytics
                    </p>
                    <div className="mt-4 flex items-center text-sm text-blue-600">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Analytics Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Campaign Analytics</h2>
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">
            Select a campaign from a brand&apos;s page to view detailed campaign analytics
          </p>
        </Card>
      </div>
    </div>
  );
}
