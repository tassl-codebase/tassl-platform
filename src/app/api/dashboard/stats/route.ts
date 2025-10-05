import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's transcripts with counts by status
    const { data: transcripts, error } = await supabaseAdmin
      .from('transcripts')
      .select('extraction_status, structured, created_at, needs_review, quality_score')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate statistics
    const total = transcripts?.length || 0;
    const completed = transcripts?.filter(t => t.extraction_status === 'completed').length || 0;
    const structured = transcripts?.filter(t => t.structured).length || 0;
    const pending = transcripts?.filter(t => t.extraction_status === 'pending').length || 0;
    const processing = transcripts?.filter(t => t.extraction_status === 'processing').length || 0;
    const failed = transcripts?.filter(t => t.extraction_status === 'failed').length || 0;
    const needsReview = transcripts?.filter(t => t.needs_review).length || 0;
    const lowQuality = transcripts?.filter(t => t.quality_score !== null && t.quality_score < 70).length || 0;

    // Calculate completion percentage
    const completionRate = total > 0 ? Math.round((structured / total) * 100) : 0;

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTranscripts = transcripts?.filter(
      t => new Date(t.created_at) >= sevenDaysAgo
    ).length || 0;

    // Calculate growth percentage (comparing last 7 days to previous 7 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const previousPeriodTranscripts = transcripts?.filter(
      t => new Date(t.created_at) >= fourteenDaysAgo && new Date(t.created_at) < sevenDaysAgo
    ).length || 0;

    const totalGrowth = previousPeriodTranscripts > 0
      ? Math.round(((recentTranscripts - previousPeriodTranscripts) / previousPeriodTranscripts) * 100)
      : recentTranscripts > 0 ? 100 : 0;

    const completedGrowth = previousPeriodTranscripts > 0
      ? Math.round(((completed - previousPeriodTranscripts) / previousPeriodTranscripts) * 100)
      : completed > 0 ? 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        completed,
        structured,
        pending,
        processing,
        failed,
        needsReview,
        lowQuality,
        completionRate,
        recentTranscripts,
        growth: {
          total: totalGrowth,
          completed: completedGrowth,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
