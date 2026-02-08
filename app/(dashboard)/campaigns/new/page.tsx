'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Brand, Product } from '@/types';

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBrand = searchParams.get('brand');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    objective: 'awareness',
    start_date: '',
    end_date: '',
    frequency_target_per_week: '3',
    brand_id: preselectedBrand || '',
    channels: {
      instagram: true,
      tiktok: false,
    },
  });

  useEffect(() => {
    async function fetchBrands() {
      const supabase = createClient();
      const { data } = await supabase
        .from('brands')
        .select('*')
        .is('deleted_at', null)
        .order('name');
      setBrands(data || []);
    }
    fetchBrands();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (!formData.brand_id) {
        setProducts([]);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', formData.brand_id)
        .is('deleted_at', null)
        .order('name');
      setProducts(data || []);
    }
    fetchProducts();
  }, [formData.brand_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const channels = Object.entries(formData.channels)
      .filter(([_, selected]) => selected)
      .map(([channel]) => channel);

    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        brand_id: formData.brand_id,
        name: formData.name,
        objective: formData.objective,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        frequency_target_per_week: parseInt(formData.frequency_target_per_week),
        channels,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Link selected products
    if (selectedProducts.length > 0 && campaign) {
      const campaignProducts = selectedProducts.map(productId => ({
        campaign_id: campaign.id,
        product_id: productId,
      }));
      
      await supabase.from('campaign_products').insert(campaignProducts);
    }

    router.push('/campaigns');
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Campaign</h1>
          <p className="text-slate-600 mt-1">Create a marketing campaign</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Select
                value={formData.brand_id}
                onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objective *</Label>
              <Select
                value={formData.objective}
                onValueChange={(value) => setFormData({ ...formData, objective: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Target Posts Per Week</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                max="50"
                value={formData.frequency_target_per_week}
                onChange={(e) => setFormData({ ...formData, frequency_target_per_week: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instagram"
                    checked={formData.channels.instagram}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        channels: { ...formData.channels, instagram: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="instagram" className="font-normal">Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tiktok"
                    checked={formData.channels.tiktok}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        channels: { ...formData.channels, tiktok: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="tiktok" className="font-normal">TikTok</Label>
                </div>
              </div>
            </div>

            {products.length > 0 && (
              <div className="space-y-2">
                <Label>Products</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={product.id}
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                      />
                      <Label htmlFor={product.id} className="font-normal">{product.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/campaigns">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
