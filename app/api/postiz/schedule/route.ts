import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { postizClient } from '@/lib/postiz/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content_piece_id, platform, scheduled_at, caption, hashtags } = await request.json();

    if (!content_piece_id || !platform || !scheduled_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Check if content is approved
    if (contentPiece.status !== 'approved') {
      return NextResponse.json(
        { error: 'Content must be approved before scheduling' },
        { status: 400 }
      );
    }

    // Get social account for the brand
    const { data: socialAccount } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('brand_id', contentPiece.brand_id)
      .eq('platform', platform)
      .single();

    if (!socialAccount) {
      return NextResponse.json(
        { error: 'No social account found for this platform' },
        { status: 400 }
      );
    }

    // TODO: Generate slide images using Puppeteer and upload to Supabase Storage
    // For now, we'll skip image generation
    const imageUrls: string[] = [];

    // Create scheduled post in Postiz
    const postizResult = await postizClient.createScheduledPost(
      socialAccount.postiz_account_id || '',
      {
        platform,
        caption,
        hashtags,
        imageUrls,
        scheduledAt: new Date(scheduled_at),
      }
    );

    // Save scheduled post record
    const { data: scheduledPost, error: insertError } = await supabase
      .from('scheduled_posts')
      .insert({
        content_piece_id,
        platform,
        postiz_job_id: postizResult.id,
        scheduled_at,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving scheduled post:', insertError);
      return NextResponse.json(
        { error: 'Failed to save scheduled post' },
        { status: 500 }
      );
    }

    // Update content piece status
    await supabase
      .from('content_pieces')
      .update({ status: 'scheduled' })
      .eq('id', content_piece_id);

    return NextResponse.json({
      scheduled_post: scheduledPost,
      postiz_job: postizResult,
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
