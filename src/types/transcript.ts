export interface Transcript {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  storage_path: string;
  extracted_text: string | null;
  page_count: number | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extraction_method: 'text_pdf' | 'ocr_scanned_pdf' | 'ocr_image' | 'text_pdf_ocr_fallback' | null;
  extraction_error: string | null;
  extracted_at: string | null;
  quality_score: number | null;
  needs_review: boolean | null;
  warnings: string[] | null;
  structured: boolean;
  structured_at: string | null;
  structure_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadTranscriptResponse {
  success: boolean;
  data?: {
    id: string;
    file_name: string;
    file_path: string;
  };
  error?: string;
}

export interface ExtractTextResponse {
  success: boolean;
  data?: {
    text: string;
    page_count: number;
  };
  error?: string;
}

export interface TranscriptListItem {
  id: string;
  file_name: string;
  extraction_status: string;
  created_at: string;
}
