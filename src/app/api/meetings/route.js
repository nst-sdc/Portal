
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { meetingsService } from '@/lib/services/meetings';

// Create a server-side Supabase client that can bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET /api/meetings -> get all meetings
export async function GET() {
  try {
    const meetings = await meetingsService.getAllMeetings();

    return NextResponse.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/meetings -> create meeting
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Meeting creation request body:', body);

    const {
      title,
      description,
      date,
      time,
      location,
      meeting_type = 'general',
      max_attendees,
      is_mandatory = false,
      created_by
    } = body;

    console.log('Extracted fields:', { title, description, date, time, location, created_by });

    // Validate required fields
    if (!title || !date || !time || !location || !created_by) {
      return NextResponse.json({
        error: "Missing required fields: title, date, time, location, created_by"
      }, { status: 400 });
    }

    // Validate date and time format
    const meetingDate = new Date(date);
    if (isNaN(meetingDate.getTime())) {
      return NextResponse.json({
        error: "Invalid date format"
      }, { status: 400 });
    }

    // Validate time format (should be HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json({
        error: "Invalid time format. Please use HH:MM format"
      }, { status: 400 });
    }

    // Create meeting in database using admin client
    const { data: meeting, error } = await supabaseAdmin
      .from('meetings')
      .insert([{
        title,
        description,
        date: date, // Keep date as date string (YYYY-MM-DD)
        start_time: time, // Keep time as time string (HH:MM)
        end_time: null, // Can be set later if needed
        duration_minutes: 60, // Default duration
        location,
        meeting_type,
        max_attendees,
        is_mandatory,
        created_by
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate attendance code
    const attendanceCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Update meeting with attendance code
    const { error: updateError } = await supabaseAdmin
      .from('meetings')
      .update({ attendance_code: attendanceCode })
      .eq('id', meeting.id);

    if (updateError) {
      console.error('Error updating attendance code:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: { ...meeting, attendance_code: attendanceCode },
      message: "Meeting created successfully"
    });

  } catch (error) {
    console.error("Meeting creation error:", error);

    return NextResponse.json({
      success: false,
      error: error.message || "Failed to create meeting"
    }, { status: 500 });
  }
}

// PUT /api/meetings -> update meeting
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        error: "Meeting ID is required"
      }, { status: 400 });
    }

    // Update meeting in database
    const { data: meeting, error } = await supabaseAdmin
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: meeting,
      message: "Meeting updated successfully"
    });

  } catch (error) {
    console.error("Meeting update error:", error);

    return NextResponse.json({
      success: false,
      error: error.message || "Failed to update meeting"
    }, { status: 500 });
  }
}

// DELETE /api/meetings -> delete meeting
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: "Meeting ID is required"
      }, { status: 400 });
    }

    // Delete meeting from database
    const { error } = await supabaseAdmin
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Meeting deleted successfully"
    });

  } catch (error) {
    console.error("Meeting deletion error:", error);

    return NextResponse.json({
      success: false,
      error: error.message || "Failed to delete meeting"
    }, { status: 500 });
  }
}
