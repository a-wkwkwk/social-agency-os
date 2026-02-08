import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, Edit, Palette, Package, Target } from 'lucide-react';
import { Brand, BrandStyleGuide, Product, Campaign } from '@/types';

async function getBrand(id: string): Promise<{ brand: Brand; styleGuide: BrandStyleGuide | null } | null> {
  const supabase = await createClient();
  
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!brand) return null;

  const { data: styleGuide } = await supabase
    .from('brand_style_guides')
    .select('*')
    .eq('brand_id', id)
    .single();

  return { brand, styleGuide };
}

async function getBrandProducts(brandId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .order('name');
  return data || [];
}

async function getBrandCampaigns(brandId: string): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', brandId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  return data || [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getBrand(id);
  
  if (!result) {
    notFound();
  }

  const { brand, styleGuide } = result;
  const products = await getBrandProducts(id);
  const campaigns = await getBrandCampaigns(id);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/brands">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{brand.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {brand.industry && <Badge variant="secondary">{brand.industry}</Badge>}
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/brands/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="style">Style Guide</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {brand.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Products
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/products?brand=${id}`}>View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-slate-600 text-sm">Total products</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Campaigns
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/campaigns?brand=${id}`}>View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-slate-600 text-sm">Total campaigns</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Visual Identity
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/brands/${id}/style-guide`}>
                  {styleGuide ? 'Edit Style Guide' : 'Create Style Guide'}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {styleGuide ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Primary</p>
                      <div 
                        className="w-full h-12 rounded-md border"
                        style={{ backgroundColor: styleGuide.primary_color || '#ccc' }}
                      />
                      <p className="text-xs text-slate-500 mt-1">{styleGuide.primary_color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Secondary</p>
                      <div 
                        className="w-full h-12 rounded-md border"
                        style={{ backgroundColor: styleGuide.secondary_color || '#ccc' }}
                      />
                      <p className="text-xs text-slate-500 mt-1">{styleGuide.secondary_color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Accent</p>
                      <div 
                        className="w-full h-12 rounded-md border"
                        style={{ backgroundColor: styleGuide.accent_color || '#ccc' }}
                      />
                      <p className="text-xs text-slate-500 mt-1">{styleGuide.accent_color}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Heading Font</p>
                      <p className="font-medium">{styleGuide.heading_font || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Body Font</p>
                      <p className="font-medium">{styleGuide.body_font || 'Not set'}</p>
                    </div>
                  </div>

                  {styleGuide.voice_guidelines && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Voice Guidelines</p>
                      <p className="text-slate-900">{styleGuide.voice_guidelines}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">No style guide defined yet.</p>
                  <Button asChild>
                    <Link href={`/brands/${id}/style-guide`}>Create Style Guide</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/products/new?brand=${id}`}>Add Product</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No products yet.</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.price && (
                          <p className="text-sm text-slate-600">${product.price}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaigns</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/campaigns/new?brand=${id}`}>New Campaign</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No campaigns yet.</p>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{campaign.objective}</Badge>
                          {campaign.start_date && (
                            <span className="text-sm text-slate-600">
                              {campaign.start_date} - {campaign.end_date}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
