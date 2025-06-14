// Student data service - replaces mock data with real Supabase queries
import { supabase } from '@/lib/supabase';
import { getGitHubData } from '@/lib/github';

export class StudentsService {
  // Fetch all students with their GitHub stats
  async getAllStudents(filters = {}) {
    try {


      // Start with a simpler query to avoid potential foreign key issues
      // First, let's try to get all columns to see what's available
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters (simplified for now)
      if (filters.search) {
        // Only search by fields we know exist
        query = query.or(`full_name.ilike.%${filters.search}%,github_username.ilike.%${filters.search}%`);
      }

      const { data: students, error } = await query;

      if (error) {
        console.error('Supabase error fetching students:', error);
        throw error;
      }



      // Transform data to match the expected format
      return students?.map(student => this.transformStudentData(student)) || [];

    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  // Fetch single student by ID
  async getStudentById(id) {
    try {
      const { data: student, error } = await supabase
        .from('profiles')
        .select(`
          *,
          github_stats (
            *
          ),
          project_members (
            id,
            role,
            joined_at,
            contribution_hours,
            is_active,
            project:projects (
              id,
              name,
              description,
              status,
              tech_stack,
              github_repo_url,
              live_demo_url
            )
          ),
          attendance (
            id,
            status,
            marked_at,
            meeting:meetings (
              id,
              title,
              date,
              location,
              meeting_type
            )
          ),
          contributions (
            id,
            contribution_type,
            title,
            description,
            points_awarded,
            contribution_date,
            github_url,
            repository_name,
            project:projects (id, name)
          ),
          rewards (
            id,
            points,
            reason,
            reward_type,
            created_at,
            reference_type
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return this.transformStudentDetailData(student);

    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  }

  // Update student profile
  async updateStudent(id, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Sync GitHub data for a student
  async syncGitHubData(userId, githubUsername, forceRefresh = false) {
    try {
      const githubData = await getGitHubData(userId, githubUsername, forceRefresh);
      return githubData;
    } catch (error) {
      console.error('Error syncing GitHub data:', error);
      throw error;
    }
  }

  // Get student statistics
  async getStudentStats(id) {
    try {
      // Get project count
      const { count: projectCount } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('is_active', true);

      // Get attendance count
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('status', 'present');

      // Get contribution count
      const { count: contributionCount } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      // Get total reward points
      const { data: rewardSum } = await supabase
        .from('rewards')
        .select('points')
        .eq('user_id', id)
        .eq('is_active', true);

      const totalPoints = rewardSum?.reduce((sum, reward) => sum + reward.points, 0) || 0;

      return {
        projectCount: projectCount || 0,
        attendanceCount: attendanceCount || 0,
        contributionCount: contributionCount || 0,
        totalRewardPoints: totalPoints
      };

    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  }

  // Transform student data to match expected format
  transformStudentData(student) {


    // Use only the fields that actually exist in the database
    return {
      id: student.id,
      name: student.full_name || student.name || 'Unknown',
      batch: student.batch || 'Unknown',
      email: student.email || student.user_email || '', // Try different possible email fields
      githubUsername: student.github_username || '',
      discordUsername: student.discord_username || '',
      avatar: student.avatar_url || `https://i.pravatar.cc/150?u=${student.id}`,
      topLanguages: ['JavaScript', 'Python', 'React'], // Placeholder for now
      rewardPoints: student.reward_points || 0,
      projectCount: 0, // Will be populated separately
      issuesRaised: 0, // Will be populated separately
      issuesSolved: 0, // Will be populated separately
      prsMerged: 0, // Will be populated separately
      projectIdeas: 0, // Will be populated separately
      // GitHub stats - simplified for now
      publicRepos: 0,
      totalStars: 0,
      totalCommits: 0,
      contributionStreak: 0
    };
  }

  // Transform detailed student data
  transformStudentDetailData(student) {
    const githubStats = student.github_stats?.[0] || {};
    
    return {
      ...this.transformStudentData(student),
      bio: student.bio,
      skills: student.skills || [],
      linkedinUrl: student.linkedin_url,
      portfolioUrl: student.portfolio_url,
      phone: student.phone,
      yearOfStudy: student.year_of_study,
      department: student.department,
      projects: student.project_members?.map(pm => ({
        id: pm.project.id,
        name: pm.project.name,
        description: pm.project.description,
        role: pm.role,
        status: pm.project.status,
        techStack: pm.project.tech_stack || [],
        githubUrl: pm.project.github_repo_url,
        liveUrl: pm.project.live_demo_url,
        joinedAt: pm.joined_at,
        contributionHours: pm.contribution_hours || 0,
        isActive: pm.is_active
      })) || [],
      attendance: student.attendance?.map(a => ({
        id: a.id,
        status: a.status,
        markedAt: a.marked_at,
        meeting: {
          id: a.meeting.id,
          title: a.meeting.title,
          date: a.meeting.date,
          location: a.meeting.location,
          type: a.meeting.meeting_type
        }
      })) || [],
      contributions: student.contributions?.map(c => ({
        id: c.id,
        type: c.contribution_type,
        title: c.title,
        description: c.description,
        points: c.points_awarded,
        date: c.contribution_date,
        githubUrl: c.github_url,
        repository: c.repository_name,
        project: c.project ? {
          id: c.project.id,
          name: c.project.name
        } : null
      })) || [],
      rewards: student.rewards?.map(r => ({
        id: r.id,
        points: r.points,
        reason: r.reason,
        type: r.reward_type,
        createdAt: r.created_at,
        referenceType: r.reference_type
      })) || [],
      githubStats: {
        publicRepos: githubStats.public_repos || 0,
        followers: githubStats.followers || 0,
        following: githubStats.following || 0,
        totalStars: githubStats.total_stars || 0,
        totalForks: githubStats.total_forks || 0,
        totalCommits: githubStats.total_commits_last_year || 0,
        topLanguages: githubStats.top_languages || [],
        contributionStreak: githubStats.contribution_streak || 0,
        lastContribution: githubStats.last_contribution_date,
        lastUpdated: githubStats.last_fetched
      }
    };
  }

  // Get leaderboard data
  async getLeaderboard(limit = 10) {
    try {
      const { data: students, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          batch,
          reward_points,
          github_username,
          github_stats (
            total_stars,
            total_commits_last_year,
            contribution_streak
          )
        `)
        .eq('is_active', true)
        .order('reward_points', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return students.map((student, index) => ({
        rank: index + 1,
        id: student.id,
        name: student.full_name || student.username,
        avatar: student.avatar_url || `https://i.pravatar.cc/150?u=${student.id}`,
        batch: student.batch,
        rewardPoints: student.reward_points || 0,
        githubUsername: student.github_username,
        totalStars: student.github_stats?.[0]?.total_stars || 0,
        totalCommits: student.github_stats?.[0]?.total_commits_last_year || 0,
        contributionStreak: student.github_stats?.[0]?.contribution_streak || 0
      }));

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const studentsService = new StudentsService();
