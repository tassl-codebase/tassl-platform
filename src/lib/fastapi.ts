import type { StructureResponse } from '@/types/structured-transcript';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export interface ExtractResponse {
  success: boolean;
  text: string | null;
  error: string | null;
  page_count: number | null;
  extraction_method?: 'text_pdf' | 'ocr_scanned_pdf' | 'ocr_image' | 'text_pdf_ocr_fallback' | null;
  quality_score?: number | null;
  needs_review?: boolean | null;
  warnings?: string[] | null;
}

export async function extractTextFromSupabase(
  filePath: string,
  bucket: string = 'transcripts'
): Promise<ExtractResponse> {
  try {
    const response = await fetch(`${FASTAPI_URL}/extract/supabase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_path: filePath,
        bucket,
      }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI service error: ${response.statusText}`);
    }

    const result = await response.json();

    // Transform new API response format to old format for compatibility
    return {
      success: result.success,
      text: result.data?.extracted_text || null,
      error: result.error,
      page_count: result.data?.page_count || null,
      extraction_method: result.data?.extraction_method || null,
      quality_score: result.data?.quality_score || null,
      needs_review: result.data?.needs_review || null,
      warnings: result.data?.warnings || null,
    };
  } catch (error) {
    return {
      success: false,
      text: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      page_count: null,
    };
  }
}

export async function structureTranscript(
  transcriptText: string
): Promise<StructureResponse> {
  try {
    const response = await fetch(`${FASTAPI_URL}/structure/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript_text: transcriptText,
      }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI service error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      raw_llm_response: null,
    };
  }
}
