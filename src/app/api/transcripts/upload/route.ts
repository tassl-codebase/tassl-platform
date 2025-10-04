import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TRANSCRIPTS_BUCKET } from '@/lib/supabase';
import { getCurrentUser, getOrCreateAppUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create app user
    const userId = await getOrCreateAppUser(authUser);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - accept PDFs and images
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only PDF and image files (JPG, PNG, GIF, BMP, TIFF, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Generate unique file path with correct extension
    const fileId = uuidv4();
    const fileName = file.name;

    // Get file extension from the file name or type
    let fileExtension = 'pdf';
    if (file.type.startsWith('image/')) {
      const typeExtension = file.type.split('/')[1];
      fileExtension = typeExtension === 'jpeg' ? 'jpg' : typeExtension;
    } else if (fileName.includes('.')) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext) fileExtension = ext;
    }

    const storagePath = `${userId}/${fileId}.${fileExtension}`;

    // Convert file to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage with correct content type
    const { error: uploadError } = await supabaseAdmin.storage
      .from(TRANSCRIPTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
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
        user_id: userId,
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
