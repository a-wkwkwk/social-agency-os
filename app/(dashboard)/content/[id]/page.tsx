'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Save, Send, Eye } from 'lucide-react';
import Link from 'next/link';
import { CarouselEditor } from '@/components/carousel/editor';
import { ContentPiece, CarouselSlide, BrandStyleGuide } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [content, setContent] = useState<ContentPiece | null>(null);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [styleGuide, setStyleGuide] = useState<BrandStyleGuide | null>(null);
  const [brandName, setBrandName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    const supabase = createClient();
    
    const { data: contentData } = await supabase
      .from('content_pieces')
      .select('*, brands(*)')
      .eq('id', id)
      .single();

    if (contentData) {
      setContent(contentData);
      setCaption(contentData.caption || '');
      setHashtags(contentData.hashtags || '');
      setBrandName(contentData.brands?.name || '');

      const { data: slidesData } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('content_piece_id', id)
        .order('position');
      
      setSlides(slidesData || []);

      const { data: styleData } = await supabase
        .from('brand_style_guides')
        .select('*')
        .eq('brand_id', contentData.brand_id)
        .single();
      
      setStyleGuide(styleData);
    }
    
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    // Update content piece
    await supabase
      .from('content_pieces')
      .update({ caption, hashtags })
      .eq('id', id);

    // Update slides - delete and recreate for simplicity
    await supabase.from('carousel_slides').delete().eq('content_piece_id', id);
    
    if (slides.length > 0) {
      const slidesToInsert = slides.map((slide, index) => ({
        content_piece_id: id,
        position: index,
        slide_type: slide.slide_type,
        headline: slide.headline,
        body: slide.body,
        cta_text: slide.cta_text,
        image_description: slide.image_description,
        image_url: slide.image_url,
      }));
      
      await supabase.from('carousel_slides').insert(slidesToInsert);
    }

    setSaving(false);
  };

  const handleGenerateCarousel = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_piece_id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate carousel');
      }

      const data = await response.json();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const supabase = createClient();
    await supabase
      .from('content_pieces')
      .update({ status: newStatus })
      .eq('id', id);
    
    setContent(content ? { ...content, status: newStatus as any } : null);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!content) {
    return <div className="p-8">Content not found</div>;
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800',
    published: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/content">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{content.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={statusColors[content.status]}>
                {content.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{content.content_type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={content.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="slides">
        <TabsList>
          <TabsTrigger value="slides">Carousel Slides</TabsTrigger>
          <TabsTrigger value="caption">Caption & Hashtags</TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Slides ({slides.length})</h2>
            <Button
              onClick={handleGenerateCarousel}
              disabled={generating}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? 'Generating...' : 'AI Generate Slides'}
            </Button>
          </div>

          <CarouselEditor
            contentId={id}
            contentTitle={content.title}
            slides={slides}
            styleGuide={styleGuide}
            brandName={brandName}
            onChange={setSlides}
          />
        </TabsContent>

        <TabsContent value="caption" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your post caption..."
                rows={6}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#hashtag1 #hashtag2 #hashtag3"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
