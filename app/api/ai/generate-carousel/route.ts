import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCarouselSlides } from '@/lib/ai/kimi-cli';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content_piece_id } = await request.json();

    if (!content_piece_id) {
      return NextResponse.json({ error: 'Content piece ID required' }, { status: 400 });
    }

    // Fetch content piece with campaign and brand
    const { data: contentPiece } = await supabase
      .from('content_pieces')
      .select('*, campaigns(*, brands(*))')
      .eq('id', content_piece_id)
      .single();

    if (!contentPiece) {
      return NextResponse.json({ error: 'Content piece not found' }, { status: 404 });
    }

    const campaign = contentPiece.campaigns;
    const brand = campaign.brands;

    // Fetch brand style guide
    const { data: styleGuide } = await supabase
      .from('brand_style_guides')
      .select('*')
      .eq('brand_id', brand.id)
      .single();

    // Fetch campaign products
    const { data: campaignProducts } = await supabase
      .from('campaign_products')
      .select('product_id')
      .eq('campaign_id', campaign.id);

    let products: any[] = [];
    if (campaignProducts && campaignProducts.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .in('id', campaignProducts.map(cp => cp.product_id));
      products = productData || [];
    }

    // Generate carousel slides using Kimi CLI
    const result = await generateCarouselSlides({
      brand,
      styleGuide,
      products,
      campaign,
      contentTitle: contentPiece.title,
      contentDescription: contentPiece.llm_raw_output?.description || '',
    });

    // Delete existing slides
    await supabase
      .from('carousel_slides')
      .delete()
      .eq('content_piece_id', content_piece_id);

    // Create new slides
    const slides = result.slides.map((slide, index) => ({
      content_piece_id,
      position: index,
      slide_type: slide.slide_type,
      headline: slide.headline,
      body: slide.body,
      cta_text: slide.cta_text,
      image_description: slide.image_description,
    }));

    const { data: createdSlides, error: insertError } = await supabase
      .from('carousel_slides')
      .insert(slides)
      .select();

    if (insertError) {
      console.error('Error creating slides:', insertError);
      return NextResponse.json({ error: 'Failed to save slides' }, { status: 500 });
    }

    // Update content piece
    await supabase
      .from('content_pieces')
      .update({
        llm_raw_output: {
          ...contentPiece.llm_raw_output,
          generated_slides: result.slides,
        },
      })
      .eq('id', content_piece_id);

    return NextResponse.json({ 
      slides: result.slides,
      carousel_slides: createdSlides,
    });
  } catch (error) {
    console.error('Error generating carousel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
