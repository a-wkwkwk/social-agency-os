import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContentIdeas } from '@/lib/ai/kimi-cli';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaign_id, num_ideas = 5 } = await request.json();

    if (!campaign_id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Fetch campaign with brand
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*, brands(*)')
      .eq('id', campaign_id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch brand style guide
    const { data: styleGuide } = await supabase
      .from('brand_style_guides')
      .select('*')
      .eq('brand_id', campaign.brand_id)
      .single();

    // Fetch campaign products
    const { data: campaignProducts } = await supabase
      .from('campaign_products')
      .select('product_id')
      .eq('campaign_id', campaign_id);

    let products: any[] = [];
    if (campaignProducts && campaignProducts.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .in('id', campaignProducts.map(cp => cp.product_id));
      products = productData || [];
    }

    // Generate ideas using Kimi CLI
    const result = await generateContentIdeas({
      brand: campaign.brands,
      styleGuide,
      products,
      campaign,
      numIdeas,
    });

    // Create content pieces for each idea
    const contentPieces = result.ideas.map(idea => ({
      campaign_id,
      brand_id: campaign.brand_id,
      title: idea.title,
      content_type: 'carousel',
      status: 'draft',
      llm_prompt: { campaign_id, num_ideas },
      llm_raw_output: idea,
    }));

    const { data: createdContent, error: insertError } = await supabase
      .from('content_pieces')
      .insert(contentPieces)
      .select();

    if (insertError) {
      console.error('Error creating content pieces:', insertError);
      return NextResponse.json({ error: 'Failed to save ideas' }, { status: 500 });
    }

    return NextResponse.json({ 
      ideas: result.ideas,
      content_pieces: createdContent,
    });
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
