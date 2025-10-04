import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractTextFromSupabase } from '@/lib/fastapi';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get transcript from database
    const { data: transcript, error: fetchError } = await supabaseAdmin
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from('transcripts')
      .update({ extraction_status: 'processing' })
      .eq('id', id);

    // Call FastAPI service to extract text
    const extractionResult = await extractTextFromSupabase(
      transcript.storage_path,
      'transcripts'
    );

    if (!extractionResult.success) {
      // Update status to failed
      await supabaseAdmin
        .from('transcripts')
        .update({
          extraction_status: 'failed',
          extraction_error: extractionResult.error,
        })
        .eq('id', id);

      return NextResponse.json(
        {
          success: false,
          error: extractionResult.error || 'Text extraction failed',
        },
        { status: 500 }
      );
    }

    // Validate extracted text is not empty
    if (!extractionResult.text || extractionResult.text.trim().length === 0) {
      await supabaseAdmin
        .from('transcripts')
        .update({
          extraction_status: 'failed',
          extraction_error: 'Extracted text is empty',
        })
        .eq('id', id);

      return NextResponse.json(
        { success: false, error: 'Extracted text is empty' },
        { status: 500 }
      );
    }

    // Save extracted text to database
    const { error: updateError } = await supabaseAdmin
      .from('transcripts')
      .update({
        extracted_text: extractionResult.text,
        page_count: extractionResult.page_count,
        extraction_method: extractionResult.extraction_method || 'text_pdf',
        extraction_status: 'completed',
        extraction_error: null,
        extracted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save extracted text' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        text: extractionResult.text,
        page_count: extractionResult.page_count,
        extraction_method: extractionResult.extraction_method,
      },
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
