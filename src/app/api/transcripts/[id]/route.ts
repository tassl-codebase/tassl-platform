import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: transcript, error } = await supabaseAdmin
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transcript,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
