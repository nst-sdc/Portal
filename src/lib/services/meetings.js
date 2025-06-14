// Meetings data service - replaces mock data with real Supabase queries
import { supabase } from '@/lib/supabase';

export class MeetingsService {
  // Fetch all meetings
  async getAllMeetings(filters = {}) {
    try {
      let query = supabase
        .from('meetings')
        .select(`
          *,
          created_by_profile:profiles!meetings_created_by_fkey(id, full_name, avatar_url)
        `)
        .order('date', { ascending: false });

      // Apply filters
      if (filters.upcoming) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('date', today);
      }

      if (filters.past) {
        const today = new Date().toISOString().split('T')[0];
        query = query.lt('date', today);
      }

      if (filters.meetingType) {
        query = query.eq('meeting_type', filters.meetingType);
      }

      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }

      if (filters.userId) {
        // Filter meetings created by user
        query = query.eq('created_by', filters.userId);
      }

      if (filters.attendanceOpen !== undefined) {
        query = query.eq('attendance_open', filters.attendanceOpen);
      }

      const { data: meetings, error } = await query;

      if (error) {
        throw error;
      }

      return meetings.map(meeting => this.transformMeetingData(meeting));

    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  // Fetch single meeting by ID
  async getMeetingById(id) {
    try {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_invites(
            id,
            status,
            responded_at,
            user:profiles(id, full_name, avatar_url, batch, github_username)
          ),
          attendance(
            id,
            status,
            marked_at,
            arrival_time,
            departure_time,
            notes,
            user:profiles(id, full_name, avatar_url, batch)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return this.transformMeetingDetailData(meeting);

    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  }

  // Create new meeting
  async createMeeting(meetingData, userId) {
    try {
      // Generate attendance code if needed
      let attendanceCode = null;
      if (meetingData.openAttendanceImmediately) {
        attendanceCode = this.generateAttendanceCode();
      }

      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert({
          ...meetingData,
          created_by: userId,
          attendance_open: meetingData.openAttendanceImmediately || false,
          attendance_code: attendanceCode
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Create meeting invites for attendees
      if (meetingData.attendees && meetingData.attendees.length > 0) {
        const invites = meetingData.attendees.map(attendeeId => ({
          meeting_id: meeting.id,
          user_id: attendeeId,
          invited_by: userId
        }));

        await supabase
          .from('meeting_invites')
          .insert(invites);
      }

      return this.transformMeetingData(meeting);

    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  // Update meeting
  async updateMeeting(id, updates, userId) {
    try {
      // Check if user has permission to update
      const { data: meeting } = await supabase
        .from('meetings')
        .select('created_by')
        .eq('id', id)
        .single();

      if (!meeting || meeting.created_by !== userId) {
        throw new Error('Unauthorized to update this meeting');
      }

      const { data: updatedMeeting, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          created_by_profile:profiles!meetings_created_by_fkey(id, full_name, avatar_url),
          project:projects(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.transformMeetingData(updatedMeeting);

    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Mark attendance
  async markAttendance(meetingId, userId, attendanceData = {}) {
    try {
      // Check if meeting exists and attendance is open
      const { data: meeting } = await supabase
        .from('meetings')
        .select('id, title, attendance_open, attendance_code')
        .eq('id', meetingId)
        .single();

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      if (!meeting.attendance_open) {
        throw new Error('Attendance is not open for this meeting');
      }

      // Verify attendance code if provided
      if (meeting.attendance_code && attendanceData.attendanceCode !== meeting.attendance_code) {
        throw new Error('Invalid attendance code');
      }

      // Check if user is invited
      const { data: invite } = await supabase
        .from('meeting_invites')
        .select('id')
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .single();

      if (!invite) {
        throw new Error('You are not invited to this meeting');
      }

      // Mark attendance
      const { data: attendance, error } = await supabase
        .from('attendance')
        .upsert({
          meeting_id: meetingId,
          user_id: userId,
          status: attendanceData.status || 'present',
          marked_by: userId,
          arrival_time: new Date().toISOString(),
          notes: attendanceData.notes
        }, {
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

      return attendance;

    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  // Open/close attendance for a meeting
  async toggleAttendance(meetingId, userId, open = true) {
    try {
      let attendanceCode = null;
      if (open) {
        attendanceCode = this.generateAttendanceCode();
      }

      const { data: meeting, error } = await supabase
        .from('meetings')
        .update({
          attendance_open: open,
          attendance_code: attendanceCode
        })
        .eq('id', meetingId)
        .eq('created_by', userId) // Only creator can toggle attendance
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        attendanceOpen: open,
        attendanceCode: attendanceCode
      };

    } catch (error) {
      console.error('Error toggling attendance:', error);
      throw error;
    }
  }

  // Get meeting statistics
  async getMeetingStats() {
    try {
      // Get total meetings
      const { count: totalMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true });

      // Get upcoming meetings
      const today = new Date().toISOString().split('T')[0];
      const { count: upcomingMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .gte('date', today);

      // Get total attendance records
      const { count: totalAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'present');

      return {
        totalMeetings: totalMeetings || 0,
        upcomingMeetings: upcomingMeetings || 0,
        totalAttendance: totalAttendance || 0
      };

    } catch (error) {
      console.error('Error fetching meeting stats:', error);
      throw error;
    }
  }

  // Get user's meetings
  async getUserMeetings(userId, upcoming = true) {
    try {
      const meetings = await this.getAllMeetings({ 
        userId, 
        upcoming: upcoming,
        past: !upcoming 
      });
      return meetings;
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      throw error;
    }
  }

  // Generate attendance code
  generateAttendanceCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Transform meeting data to match expected format
  transformMeetingData(meeting) {

    return {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      type: meeting.meeting_type,
      date: meeting.date,
      time: meeting.start_time,
      startTime: meeting.start_time,
      endTime: meeting.end_time,
      duration: meeting.duration_minutes,
      location: meeting.location,
      meetingLink: meeting.meeting_link,
      maxAttendees: meeting.max_attendees,
      isMandatory: meeting.is_mandatory,
      attendanceOpen: meeting.attendance_open,
      attendanceCode: meeting.attendance_code,
      agenda: meeting.agenda,
      notes: meeting.notes,
      recordingUrl: meeting.recording_url,
      createdBy: meeting.created_by_profile,
      createdAt: meeting.created_at,
      updatedAt: meeting.updated_at
    };
  }

  // Transform detailed meeting data
  transformMeetingDetailData(meeting) {
    const baseData = this.transformMeetingData(meeting);
    
    return {
      ...baseData,
      invites: meeting.meeting_invites?.map(invite => ({
        id: invite.id,
        status: invite.status,
        respondedAt: invite.responded_at,
        user: {
          id: invite.user.id,
          name: invite.user.full_name,
          avatar: invite.user.avatar_url || `https://i.pravatar.cc/150?u=${invite.user.id}`,
          batch: invite.user.batch,
          githubUsername: invite.user.github_username
        }
      })) || [],
      attendance: meeting.attendance?.map(att => ({
        id: att.id,
        status: att.status,
        markedAt: att.marked_at,
        arrivalTime: att.arrival_time,
        departureTime: att.departure_time,
        notes: att.notes,
        user: {
          id: att.user.id,
          name: att.user.full_name,
          avatar: att.user.avatar_url || `https://i.pravatar.cc/150?u=${att.user.id}`,
          batch: att.user.batch
        }
      })) || []
    };
  }
}

// Export singleton instance
export const meetingsService = new MeetingsService();
