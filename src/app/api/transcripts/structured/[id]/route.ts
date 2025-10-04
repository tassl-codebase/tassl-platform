import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch all structured data for this transcript
    const [
      { data: structuredTranscript },
      { data: courses },
      { data: testScores },
      { data: credits },
      { data: attendance },
      { data: serviceHours },
    ] = await Promise.all([
      supabaseAdmin
        .from('structured_transcripts')
        .select('*')
        .eq('transcript_id', id)
        .single(),
      supabaseAdmin
        .from('structured_courses')
        .select('*')
        .eq('transcript_id', id)
        .order('year', { ascending: true }),
      supabaseAdmin
        .from('structured_test_scores')
        .select('*')
        .eq('transcript_id', id),
      supabaseAdmin
        .from('credit_summary')
        .select('*')
        .eq('transcript_id', id)
        .single(),
      supabaseAdmin
        .from('attendance_summary')
        .select('*')
        .eq('transcript_id', id)
        .single(),
      supabaseAdmin
        .from('service_hours')
        .select('*')
        .eq('transcript_id', id)
        .single(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        structured_transcript: structuredTranscript,
        courses: courses || [],
        test_scores: testScores || [],
        credits,
        attendance,
        service_hours: serviceHours,
      },
    });
  } catch (error) {
    console.error('Error fetching structured data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
