


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_or_create_user"("p_auth_id" "uuid", "p_email" "text", "p_full_name" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to find existing user
  SELECT id INTO v_user_id
  FROM users
  WHERE auth_id = p_auth_id;

  -- If not found, create new user
  IF v_user_id IS NULL THEN
    INSERT INTO users (auth_id, email, full_name)
    VALUES (p_auth_id, p_email, p_full_name)
    RETURNING id INTO v_user_id;
  END IF;

  RETURN v_user_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_user"("p_auth_id" "uuid", "p_email" "text", "p_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."attendance_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "days_present" integer,
    "days_absent" integer,
    "total_days" integer,
    "attendance_rate" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."attendance_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."credit_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "total_credits_earned" numeric(6,3),
    "credits_required" numeric(6,3),
    "by_subject" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."credit_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "hours_earned" numeric(6,2),
    "hours_waived" numeric(6,2),
    "hours_required" numeric(6,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."service_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."structured_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "course_code" "text",
    "course_name" "text" NOT NULL,
    "grade" "text",
    "credit" numeric(5,3),
    "year" "text",
    "semester" "text",
    "grade_level" "text",
    "course_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."structured_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."structured_test_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "test_name" "text" NOT NULL,
    "score" "text",
    "date_taken" "text",
    "subject" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."structured_test_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."structured_transcripts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_id" "uuid" NOT NULL,
    "student_name" "text",
    "student_dob" "text",
    "student_address" "text",
    "student_id" "text",
    "student_email" "text",
    "student_phone" "text",
    "graduation_date" "text",
    "gpa_weighted" numeric(5,3),
    "gpa_unweighted" numeric(5,3),
    "gpa_scale" numeric(3,1),
    "class_rank" integer,
    "class_total_students" integer,
    "class_percentile" numeric(5,2),
    "school_name" "text",
    "school_location" "text",
    "school_phone" "text",
    "additional_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."structured_transcripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcripts" (
    "id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "extracted_text" "text",
    "page_count" integer,
    "extraction_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "extraction_error" "text",
    "extracted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "structured" boolean DEFAULT false,
    "structured_at" timestamp with time zone,
    "structure_error" "text",
    "user_id" "uuid",
    "extraction_method" "text",
    "quality_score" numeric(5,2),
    "needs_review" boolean DEFAULT false,
    "warnings" "jsonb",
    CONSTRAINT "transcripts_extraction_status_check" CHECK (("extraction_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."transcripts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transcripts"."extraction_method" IS 'Method used to extract text: text_pdf, ocr_image, ocr_scanned_pdf, etc.';



COMMENT ON COLUMN "public"."transcripts"."quality_score" IS 'Quality score from 0-100 based on text extraction quality assessment';



COMMENT ON COLUMN "public"."transcripts"."needs_review" IS 'Flag indicating if the transcript needs manual review due to low quality or OCR extraction';



COMMENT ON COLUMN "public"."transcripts"."warnings" IS 'Array of warning messages from quality validation (stored as JSONB)';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."attendance_summary"
    ADD CONSTRAINT "attendance_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_summary"
    ADD CONSTRAINT "attendance_summary_transcript_id_key" UNIQUE ("transcript_id");



ALTER TABLE ONLY "public"."credit_summary"
    ADD CONSTRAINT "credit_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."credit_summary"
    ADD CONSTRAINT "credit_summary_transcript_id_key" UNIQUE ("transcript_id");



ALTER TABLE ONLY "public"."service_hours"
    ADD CONSTRAINT "service_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_hours"
    ADD CONSTRAINT "service_hours_transcript_id_key" UNIQUE ("transcript_id");



ALTER TABLE ONLY "public"."structured_courses"
    ADD CONSTRAINT "structured_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."structured_test_scores"
    ADD CONSTRAINT "structured_test_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."structured_transcripts"
    ADD CONSTRAINT "structured_transcripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."structured_transcripts"
    ADD CONSTRAINT "structured_transcripts_transcript_id_key" UNIQUE ("transcript_id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_attendance_summary_user_id" ON "public"."attendance_summary" USING "btree" ("user_id");



CREATE INDEX "idx_credit_summary_user_id" ON "public"."credit_summary" USING "btree" ("user_id");



CREATE INDEX "idx_service_hours_user_id" ON "public"."service_hours" USING "btree" ("user_id");



CREATE INDEX "idx_structured_courses_transcript" ON "public"."structured_courses" USING "btree" ("transcript_id");



CREATE INDEX "idx_structured_courses_user_id" ON "public"."structured_courses" USING "btree" ("user_id");



CREATE INDEX "idx_structured_test_scores_transcript" ON "public"."structured_test_scores" USING "btree" ("transcript_id");



CREATE INDEX "idx_structured_test_scores_user_id" ON "public"."structured_test_scores" USING "btree" ("user_id");



CREATE INDEX "idx_structured_transcripts_transcript" ON "public"."structured_transcripts" USING "btree" ("transcript_id");



CREATE INDEX "idx_structured_transcripts_user_id" ON "public"."structured_transcripts" USING "btree" ("user_id");



CREATE INDEX "idx_transcripts_needs_review" ON "public"."transcripts" USING "btree" ("needs_review") WHERE ("needs_review" = true);



CREATE INDEX "idx_transcripts_quality_score" ON "public"."transcripts" USING "btree" ("quality_score") WHERE ("quality_score" IS NOT NULL);



CREATE INDEX "idx_transcripts_status" ON "public"."transcripts" USING "btree" ("extraction_status");



CREATE INDEX "idx_transcripts_user_id" ON "public"."transcripts" USING "btree" ("user_id");



CREATE INDEX "idx_users_auth_id" ON "public"."users" USING "btree" ("auth_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "update_structured_transcripts_updated_at" BEFORE UPDATE ON "public"."structured_transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transcripts_updated_at" BEFORE UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."attendance_summary"
    ADD CONSTRAINT "attendance_summary_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance_summary"
    ADD CONSTRAINT "attendance_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."credit_summary"
    ADD CONSTRAINT "credit_summary_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."credit_summary"
    ADD CONSTRAINT "credit_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_hours"
    ADD CONSTRAINT "service_hours_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_hours"
    ADD CONSTRAINT "service_hours_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."structured_courses"
    ADD CONSTRAINT "structured_courses_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."structured_courses"
    ADD CONSTRAINT "structured_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."structured_test_scores"
    ADD CONSTRAINT "structured_test_scores_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."structured_test_scores"
    ADD CONSTRAINT "structured_test_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."structured_transcripts"
    ADD CONSTRAINT "structured_transcripts_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."structured_transcripts"
    ADD CONSTRAINT "structured_transcripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all on attendance_summary" ON "public"."attendance_summary" USING (true);



CREATE POLICY "Allow all on credit_summary" ON "public"."credit_summary" USING (true);



CREATE POLICY "Allow all on service_hours" ON "public"."service_hours" USING (true);



CREATE POLICY "Allow all on structured_courses" ON "public"."structured_courses" USING (true);



CREATE POLICY "Allow all on structured_test_scores" ON "public"."structured_test_scores" USING (true);



CREATE POLICY "Allow all on structured_transcripts" ON "public"."structured_transcripts" USING (true);



CREATE POLICY "Authenticated users can delete all attendance_summary" ON "public"."attendance_summary" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete all credit_summary" ON "public"."credit_summary" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete all service_hours" ON "public"."service_hours" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete all structured_courses" ON "public"."structured_courses" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete all structured_test_scores" ON "public"."structured_test_scores" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete all structured_transcripts" ON "public"."structured_transcripts" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete all transcripts" ON "public"."transcripts" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert all attendance_summary" ON "public"."attendance_summary" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert all credit_summary" ON "public"."credit_summary" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert all service_hours" ON "public"."service_hours" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert all structured_courses" ON "public"."structured_courses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert all structured_test_scores" ON "public"."structured_test_scores" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert all structured_transcripts" ON "public"."structured_transcripts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert all transcripts" ON "public"."transcripts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read all users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all attendance_summary" ON "public"."attendance_summary" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all credit_summary" ON "public"."credit_summary" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all service_hours" ON "public"."service_hours" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all structured_courses" ON "public"."structured_courses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all structured_test_scores" ON "public"."structured_test_scores" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all structured_transcripts" ON "public"."structured_transcripts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all transcripts" ON "public"."transcripts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update all attendance_summary" ON "public"."attendance_summary" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update all credit_summary" ON "public"."credit_summary" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update all service_hours" ON "public"."service_hours" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update all structured_courses" ON "public"."structured_courses" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update all structured_test_scores" ON "public"."structured_test_scores" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update all structured_transcripts" ON "public"."structured_transcripts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update all transcripts" ON "public"."transcripts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Users can insert own profile" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth_id" = "auth"."uid"())) WITH CHECK (("auth_id" = "auth"."uid"()));



ALTER TABLE "public"."attendance_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credit_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."structured_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."structured_test_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."structured_transcripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_or_create_user"("p_auth_id" "uuid", "p_email" "text", "p_full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_user"("p_auth_id" "uuid", "p_email" "text", "p_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_user"("p_auth_id" "uuid", "p_email" "text", "p_full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."attendance_summary" TO "anon";
GRANT ALL ON TABLE "public"."attendance_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_summary" TO "service_role";



GRANT ALL ON TABLE "public"."credit_summary" TO "anon";
GRANT ALL ON TABLE "public"."credit_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."credit_summary" TO "service_role";



GRANT ALL ON TABLE "public"."service_hours" TO "anon";
GRANT ALL ON TABLE "public"."service_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."service_hours" TO "service_role";



GRANT ALL ON TABLE "public"."structured_courses" TO "anon";
GRANT ALL ON TABLE "public"."structured_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."structured_courses" TO "service_role";



GRANT ALL ON TABLE "public"."structured_test_scores" TO "anon";
GRANT ALL ON TABLE "public"."structured_test_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."structured_test_scores" TO "service_role";



GRANT ALL ON TABLE "public"."structured_transcripts" TO "anon";
GRANT ALL ON TABLE "public"."structured_transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."structured_transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."transcripts" TO "anon";
GRANT ALL ON TABLE "public"."transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
