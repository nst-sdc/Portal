// API routes for meetings management
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/meetings - Fetch meetings
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const upcoming = searchParams.get('upcoming') === 'true';
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build query
    let query = supabase
      .from('meetings')
      .select(`
        *,
        created_by_profile:profiles!meetings_created_by_fkey(id, full_name, avatar_url),
        project:projects(id, name),
        attendance_count:attendance(count),
        user_attendance:attendance!inner(status)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1);

    // Filter upcoming meetings
    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', today);
    }

    // Filter by user attendance if userId provided
    if (userId) {
      query = query.eq('user_attendance.user_id', userId);
    }

    const { data: meetings, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: meetings,
      count: meetings.length
    });

  } catch (error) {
    console.error('Error fetching meetings:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch meetings',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create new meeting
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
    if (!body.title || !body.date || !body.start_time || !body.location) {
      return NextResponse.json(
        { error: 'Title, date, start time, and location are required' },
        { status: 400 }
      );
    }

    // Generate attendance code if attendance should be opened immediately
    let attendanceCode = null;
    if (body.openAttendanceImmediately) {
      attendanceCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Create meeting
    const meetingData = {
      title: body.title,
      description: body.description,
      meeting_type: body.meeting_type || 'general',
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      duration_minutes: body.duration_minutes || 60,
      location: body.location,
      meeting_link: body.meeting_link,
      max_attendees: body.max_attendees,
      is_mandatory: body.is_mandatory || false,
      attendance_open: body.openAttendanceImmediately || false,
      attendance_code: attendanceCode,
      agenda: body.agenda,
      created_by: user.id,
      project_id: body.project_id
    };

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select(`
        *,
        created_by_profile:profiles!meetings_created_by_fkey(id, full_name, avatar_url),
        project:projects(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Create meeting invites for selected attendees
    if (body.attendees && body.attendees.length > 0) {
      const invites = body.attendees.map(attendeeId => ({
        meeting_id: meeting.id,
        user_id: attendeeId,
        invited_by: user.id
      }));

      await supabase
        .from('meeting_invites')
        .insert(invites);
    }

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting created successfully'
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create meeting',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
