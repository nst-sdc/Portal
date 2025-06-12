// Dashboard data service - aggregates data from multiple sources
import { supabase } from '@/lib/supabase';
import { studentsService } from './students';
import { projectsService } from './projects';
import { meetingsService } from './meetings';

export class DashboardService {
  // Get comprehensive dashboard stats
  async getDashboardStats(userId) {
    try {
      const [
        clubStats,
        userStats,
        userProjects,
        upcomingMeetings,
        recentActivity
      ] = await Promise.all([
        this.getClubStats(),
        this.getUserStats(userId),
        this.getUserProjects(userId),
        this.getUpcomingMeetings(userId),
        this.getRecentActivity(userId)
      ]);

      return {
        // Club-wide stats
        totalStudents: clubStats.totalStudents,
        totalProjects: clubStats.totalProjects,
        activeProjects: clubStats.activeProjects,
        
        // User-specific stats
        myProjects: userStats.projectCount,
        myRewardPoints: userStats.rewardPoints,
        recentAttendance: userStats.attendanceRate,
        
        // Upcoming meetings count
        upcomingMeetings: upcomingMeetings.length,
        
        // Data for sections
        projects: userProjects,
        meetings: upcomingMeetings,
        activity: recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get club-wide statistics
  async getClubStats() {
    try {
      // Get total active students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      // Get active projects
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('is_public', true);

      return {
        totalStudents: totalStudents || 0,
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0
      };
    } catch (error) {
      console.error('Error fetching club stats:', error);
      return {
        totalStudents: 0,
        totalProjects: 0,
        activeProjects: 0
      };
    }
  }

  // Get user-specific statistics
  async getUserStats(userId) {
    try {
      // Get user profile with reward points
      const { data: profile } = await supabase
        .from('profiles')
        .select('reward_points')
        .eq('id', userId)
        .single();

      // Get user's project count
      const { count: projectCount } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Get user's attendance rate (last 10 meetings)
      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('status, meeting:meetings(date)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      let attendanceRate = '0%';
      if (recentAttendance && recentAttendance.length > 0) {
        const presentCount = recentAttendance.filter(a => a.status === 'present').length;
        attendanceRate = `${Math.round((presentCount / recentAttendance.length) * 100)}%`;
      }

      return {
        rewardPoints: profile?.reward_points || 0,
        projectCount: projectCount || 0,
        attendanceRate
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        rewardPoints: 0,
        projectCount: 0,
        attendanceRate: '0%'
      };
    }
  }

  // Get user's projects for dashboard
  async getUserProjects(userId, limit = 3) {
    try {
      const { data: projects, error } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          project:projects (
            id,
            name,
            status,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return projects?.map(pm => ({
        id: pm.project.id,
        name: pm.project.name,
        role: this.formatRole(pm.role),
        status: this.formatStatus(pm.project.status),
        progress: this.calculateProjectProgress(pm.project)
      })) || [];
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }

  // Get upcoming meetings for user
  async getUpcomingMeetings(userId, limit = 2) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: meetings, error } = await supabase
        .from('meeting_invites')
        .select(`
          meeting:meetings (
            id,
            title,
            date,
            start_time,
            location,
            attendance_open
          )
        `)
        .eq('user_id', userId)
        .gte('meeting.date', today)
        .order('meeting.date', { ascending: true })
        .order('meeting.start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return meetings?.map(mi => ({
        id: mi.meeting.id,
        title: mi.meeting.title,
        date: mi.meeting.date,
        time: mi.meeting.start_time,
        location: mi.meeting.location,
        attendanceOpen: mi.meeting.attendance_open
      })) || [];
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      return [];
    }
  }

  // Get recent activity for user
  async getRecentActivity(userId, limit = 5) {
    try {
      // Get recent contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select(`
          id,
          contribution_type,
          title,
          description,
          points_awarded,
          contribution_date,
          project:projects(name)
        `)
        .eq('user_id', userId)
        .order('contribution_date', { ascending: false })
        .limit(limit);

      // Get recent attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select(`
          id,
          status,
          marked_at,
          meeting:meetings(title, date)
        `)
        .eq('user_id', userId)
        .eq('status', 'present')
        .order('marked_at', { ascending: false })
        .limit(limit);

      // Get recent rewards
      const { data: rewards } = await supabase
        .from('rewards')
        .select(`
          id,
          points,
          reason,
          reward_type,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and sort all activities
      const activities = [];

      // Add contributions
      contributions?.forEach(contrib => {
        activities.push({
          id: `contrib-${contrib.id}`,
          type: 'project_contribution',
          action: contrib.title || `${contrib.contribution_type} contribution`,
          project: contrib.project?.name,
          points: contrib.points_awarded || 0,
          date: contrib.contribution_date
        });
      });

      // Add attendance
      attendance?.forEach(att => {
        activities.push({
          id: `attendance-${att.id}`,
          type: 'meeting_attendance',
          action: 'Attended meeting',
          meeting: att.meeting?.title,
          points: 10, // Standard attendance points
          date: att.meeting?.date
        });
      });

      // Add other rewards
      rewards?.forEach(reward => {
        if (reward.reward_type !== 'attendance' && reward.reward_type !== 'contribution') {
          activities.push({
            id: `reward-${reward.id}`,
            type: 'reward',
            action: reward.reason,
            points: reward.points,
            date: reward.created_at.split('T')[0]
          });
        }
      });

      // Sort by date and return top activities
      return activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Helper function to format role
  formatRole(role) {
    const roleMap = {
      'lead': 'Lead Developer',
      'co-lead': 'Co-Lead',
      'member': 'Developer',
      'contributor': 'Contributor',
      'mentor': 'Mentor'
    };
    return roleMap[role] || role;
  }

  // Helper function to format status
  formatStatus(status) {
    const statusMap = {
      'planning': 'Planning',
      'active': 'Active',
      'completed': 'Completed',
      'on_hold': 'On Hold',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  // Helper function to calculate project progress (simplified)
  calculateProjectProgress(project) {
    // This is a simplified calculation
    // In a real app, you might calculate based on completed tasks, milestones, etc.
    const statusProgress = {
      'planning': 10,
      'active': 60,
      'completed': 100,
      'on_hold': 30,
      'cancelled': 0
    };
    
    return statusProgress[project.status] || 0;
  }

  // Refresh GitHub data for current user
  async refreshUserGitHubData(userId) {
    try {
      // Get user's GitHub username
      const { data: profile } = await supabase
        .from('profiles')
        .select('github_username')
        .eq('id', userId)
        .single();

      if (!profile?.github_username) {
        throw new Error('No GitHub username found');
      }

      // Call GitHub sync API
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceRefresh: true })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh GitHub data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing GitHub data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
