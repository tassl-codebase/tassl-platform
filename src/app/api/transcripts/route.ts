import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: transcripts, error } = await supabaseAdmin
      .from('transcripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: transcripts,
    });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transcripts',
      },
      { status: 500 }
    );
  }
}
