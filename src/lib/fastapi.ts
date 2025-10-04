const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export interface ExtractResponse {
  success: boolean;
  text: string | null;
  error: string | null;
  page_count: number | null;
}

export async function extractTextFromSupabase(
  filePath: string,
  bucket: string = 'transcripts'
): Promise<ExtractResponse> {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/extract-supabase`, {
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

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      text: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      page_count: null,
    };
  }
}
