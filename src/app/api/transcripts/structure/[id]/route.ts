import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { structureTranscript } from '@/lib/fastapi';
import type { StructuredTranscript } from '@/types/structured-transcript';

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

    // Check if text has been extracted
    if (!transcript.extracted_text) {
      return NextResponse.json(
        { success: false, error: 'Text must be extracted first' },
        { status: 400 }
      );
    }

    // Call FastAPI to structure the transcript
    const structureResult = await structureTranscript(transcript.extracted_text);

    if (!structureResult.success || !structureResult.data) {
      // Update transcript with error
      await supabaseAdmin
        .from('transcripts')
        .update({
          structure_error: structureResult.error,
        })
        .eq('id', id);

      return NextResponse.json(
        {
          success: false,
          error: structureResult.error || 'Structure extraction failed',
        },
        { status: 500 }
      );
    }

    const data: StructuredTranscript = structureResult.data;

    // Save structured data to database
    try {
      // Log GPA values for debugging
      console.log('GPA values:', {
        weighted: data.gpa?.weighted,
        unweighted: data.gpa?.unweighted,
        scale: data.gpa?.scale
      });

      // 1. Insert structured_transcripts
      const { error: structuredError } = await supabaseAdmin
        .from('structured_transcripts')
        .upsert({
          transcript_id: id,
          user_id: transcript.user_id,
          student_name: data.student_info.name,
          student_dob: data.student_info.date_of_birth,
          student_address: data.student_info.address,
          student_id: data.student_info.student_id,
          student_email: data.student_info.email,
          student_phone: data.student_info.phone,
          graduation_date: data.student_info.graduation_date,
          gpa_weighted: data.gpa?.weighted,
          gpa_unweighted: data.gpa?.unweighted,
          gpa_scale: data.gpa?.scale,
          class_rank: data.class_rank?.rank,
          class_total_students: data.class_rank?.total_students,
          class_percentile: data.class_rank?.percentile,
          school_name: data.school_info?.high_school_name,
          school_location: data.school_info?.location,
          school_phone: data.school_info?.phone,
          additional_notes: data.additional_notes,
        }, {
          onConflict: 'transcript_id'
        });

      if (structuredError) throw structuredError;

      // 2. Delete existing courses and insert new ones
      await supabaseAdmin
        .from('structured_courses')
        .delete()
        .eq('transcript_id', id);

      if (data.courses && data.courses.length > 0) {
        const coursesData = data.courses.map((course) => ({
          transcript_id: id,
          user_id: transcript.user_id,
          course_code: course.course_code,
          course_name: course.course_name,
          grade: course.grade,
          credit: course.credit,
          year: course.year,
          semester: course.semester,
          grade_level: course.grade_level,
          course_type: course.course_type,
        }));

        const { error: coursesError } = await supabaseAdmin
          .from('structured_courses')
          .insert(coursesData);

        if (coursesError) throw coursesError;
      }

      // 3. Delete existing test scores and insert new ones
      await supabaseAdmin
        .from('structured_test_scores')
        .delete()
        .eq('transcript_id', id);

      if (data.test_scores && data.test_scores.length > 0) {
        const testScoresData = data.test_scores.map((test) => ({
          transcript_id: id,
          user_id: transcript.user_id,
          test_name: test.test_name,
          score: test.score,
          date_taken: test.date_taken,
          subject: test.subject,
        }));

        const { error: testScoresError } = await supabaseAdmin
          .from('structured_test_scores')
          .insert(testScoresData);

        if (testScoresError) throw testScoresError;
      }

      // 4. Insert credit summary
      if (data.credits) {
        const { error: creditsError } = await supabaseAdmin
          .from('credit_summary')
          .upsert({
            transcript_id: id,
            user_id: transcript.user_id,
            total_credits_earned: data.credits.total_credits_earned,
            credits_required: data.credits.credits_required,
            by_subject: data.credits.by_subject,
          }, {
            onConflict: 'transcript_id'
          });

        if (creditsError) throw creditsError;
      }

      // 5. Insert attendance summary
      if (data.attendance) {
        const { error: attendanceError } = await supabaseAdmin
          .from('attendance_summary')
          .upsert({
            transcript_id: id,
            user_id: transcript.user_id,
            days_present: data.attendance.days_present,
            days_absent: data.attendance.days_absent,
            total_days: data.attendance.total_days,
            attendance_rate: data.attendance.attendance_rate,
          }, {
            onConflict: 'transcript_id'
          });

        if (attendanceError) throw attendanceError;
      }

      // 6. Insert service hours
      if (data.service_hours) {
        const { error: serviceError } = await supabaseAdmin
          .from('service_hours')
          .upsert({
            transcript_id: id,
            user_id: transcript.user_id,
            hours_earned: data.service_hours.earned,
            hours_waived: data.service_hours.waived,
            hours_required: data.service_hours.required,
          }, {
            onConflict: 'transcript_id'
          });

        if (serviceError) throw serviceError;
      }

      // 7. Update transcripts table
      const { error: updateError } = await supabaseAdmin
        .from('transcripts')
        .update({
          structured: true,
          structured_at: new Date().toISOString(),
          structure_error: null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Transcript structured successfully',
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      console.error('Error details:', JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: `Database error occurred while saving structured data: ${dbError instanceof Error ? dbError.message : JSON.stringify(dbError)}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Structure error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
