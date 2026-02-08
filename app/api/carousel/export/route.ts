import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  exportCarouselToImages,
  convertToRevealBrand, 
  convertToRevealSlides,
} from '@/lib/carousel/reveal-generator';
import JSZip from 'jszip';

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

    // Fetch content piece with slides and brand
    const { data: contentPiece } = await supabase
      .from('content_pieces')
      .select('*, brands(*), carousel_slides(*)')
      .eq('id', content_piece_id)
      .single();

    if (!contentPiece) {
      return NextResponse.json({ error: 'Content piece not found' }, { status: 404 });
    }

    // Fetch brand style guide
    const { data: styleGuide } = await supabase
      .from('brand_style_guides')
      .select('*')
      .eq('brand_id', contentPiece.brand_id)
      .single();

    // Convert to reveal format
    const revealBrand = convertToRevealBrand(
      contentPiece.brands?.name || 'Brand',
      styleGuide
    );
    
    const slides = contentPiece.carousel_slides?.sort((a: any, b: any) => a.position - b.position) || [];
    const revealSlides = convertToRevealSlides(contentPiece.title, slides);

    // Export to images
    const images = await exportCarouselToImages(revealBrand, revealSlides, {
      width: 1080,
      height: 1350,
    });

    // Create ZIP archive
    const zip = new JSZip();
    for (const image of images) {
      zip.file(image.filename, image.buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Update content piece with export metadata
    await supabase
      .from('content_pieces')
      .update({
        llm_raw_output: {
          ...contentPiece.llm_raw_output,
          exported_at: new Date().toISOString(),
          exported_slides_count: images.length,
        },
      })
      .eq('id', content_piece_id);

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="carousel-${content_piece_id}.zip"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
