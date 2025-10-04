import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TRANSCRIPTS_BUCKET } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique file path
    const fileId = uuidv4();
    const fileExtension = 'pdf';
    const fileName = file.name;
    const storagePath = `${userId || 'anonymous'}/${fileId}.${fileExtension}`;

    // Convert file to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(TRANSCRIPTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL (for reference, though we'll use path for extraction)
    const { data: urlData } = supabaseAdmin.storage
      .from(TRANSCRIPTS_BUCKET)
      .getPublicUrl(storagePath);

    // Save metadata to database
    const { error: dbError } = await supabaseAdmin
      .from('transcripts')
      .insert({
        id: fileId,
        user_id: userId || 'anonymous',
        file_name: fileName,
        file_path: urlData.publicUrl,
        storage_path: storagePath,
        extraction_status: 'pending',
        extracted_text: null,
        page_count: null,
        extraction_error: null,
        extracted_at: null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file
      await supabaseAdmin.storage.from(TRANSCRIPTS_BUCKET).remove([storagePath]);
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fileId,
        file_name: fileName,
        file_path: urlData.publicUrl,
        storage_path: storagePath,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
