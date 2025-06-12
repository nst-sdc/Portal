// API routes for attendance management
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/attendance - Mark attendance
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.meeting_id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Check if meeting exists and attendance is open
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, attendance_open, attendance_code, date')
      .eq('id', body.meeting_id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    if (!meeting.attendance_open) {
      return NextResponse.json(
        { error: 'Attendance is not open for this meeting' },
        { status: 400 }
      );
    }

    // Verify attendance code if provided
    if (meeting.attendance_code && body.attendance_code !== meeting.attendance_code) {
      return NextResponse.json(
        { error: 'Invalid attendance code' },
        { status: 400 }
      );
    }

    // Check if user is invited to the meeting
    const { data: invite } = await supabase
      .from('meeting_invites')
      .select('id')
      .eq('meeting_id', body.meeting_id)
      .eq('user_id', user.id)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: 'You are not invited to this meeting' },
        { status: 403 }
      );
    }

    // Mark attendance (upsert to handle duplicate submissions)
    const attendanceData = {
      meeting_id: body.meeting_id,
      user_id: user.id,
      status: body.status || 'present',
      marked_by: user.id,
      arrival_time: new Date().toISOString(),
      notes: body.notes
    };

    const { data: attendance, error } = await supabase
      .from('attendance')
      .upsert(attendanceData, {
        onConflict: 'meeting_id,user_id'
      })
      .select(`
        *,
        meeting:meetings(id, title, date),
        user:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to mark attendance',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET /api/attendance - Get attendance records
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const meetingId = searchParams.get('meeting_id');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build query
    let query = supabase
      .from('attendance')
      .select(`
        *,
        meeting:meetings(id, title, date, location),
        user:profiles(id, full_name, avatar_url),
        marked_by_user:profiles!attendance_marked_by_fkey(id, full_name)
      `)
      .order('marked_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: attendance, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: attendance,
      count: attendance.length
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch attendance',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
