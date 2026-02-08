import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  generateCarouselHTML, 
  convertToRevealBrand, 
  convertToRevealSlides,
  RevealBrand,
  RevealSlide 
} from '@/lib/carousel/reveal-generator';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content_title, brand_name, style_guide, slides } = await request.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: 'Slides required' }, { status: 400 });
    }

    // Convert to reveal format
    const revealBrand = convertToRevealBrand(brand_name || 'Brand', style_guide);
    const revealSlides = convertToRevealSlides(content_title || 'Carousel', slides);

    // Generate HTML
    const html = generateCarouselHTML(revealBrand, revealSlides, {
      title: content_title,
    });

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
