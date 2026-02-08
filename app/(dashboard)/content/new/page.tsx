'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Campaign, ContentIdea } from '@/types';

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [formData, setFormData] = useState({
    campaign_id: '',
    num_ideas: '5',
  });

  useEffect(() => {
    async function fetchCampaigns() {
      const supabase = createClient();
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .is('deleted_at', null)
        .order('name');
      setCampaigns(data || []);
    }
    fetchCampaigns();
  }, []);

  const handleGenerateIdeas = async () => {
    if (!formData.campaign_id) {
      setError('Please select a campaign');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: formData.campaign_id,
          num_ideas: parseInt(formData.num_ideas),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectIdea = async (idea: ContentIdea) => {
    setLoading(true);
    const supabase = createClient();

    // Find the campaign to get brand_id
    const campaign = campaigns.find(c => c.id === formData.campaign_id);
    if (!campaign) {
      setError('Campaign not found');
      setLoading(false);
      return;
    }

    const { data: contentPiece, error: insertError } = await supabase
      .from('content_pieces')
      .insert({
        campaign_id: formData.campaign_id,
        brand_id: campaign.brand_id,
        title: idea.title,
        content_type: 'carousel',
        status: 'draft',
        llm_raw_output: { description: idea.description },
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/content/${contentPiece.id}`);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/content">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Content</h1>
          <p className="text-slate-600 mt-1">Generate AI-powered content ideas</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign *</Label>
            <Select
              value={formData.campaign_id}
              onValueChange={(value) => setFormData({ ...formData, campaign_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_ideas">Number of Ideas</Label>
            <Select
              value={formData.num_ideas}
              onValueChange={(value) => setFormData({ ...formData, num_ideas: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ideas</SelectItem>
                <SelectItem value="5">5 ideas</SelectItem>
                <SelectItem value="10">10 ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateIdeas}
            disabled={generating}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? 'Generating Ideas...' : 'Generate Content Ideas'}
          </Button>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Generated Ideas
          </h2>
          <div className="grid gap-4">
            {ideas.map((idea, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectIdea(idea)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{idea.description}</p>
                  <Button className="mt-4" size="sm" disabled={loading}>
                    Use This Idea
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
