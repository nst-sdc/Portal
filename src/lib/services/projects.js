import { supabase } from '@/lib/supabase';

export class ProjectsService {
  // Fetch all projects
  async getAllProjects(filters = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.userId) {
        params.append('userId', filters.userId);
      }

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.techStack && filters.techStack.length > 0) {
        params.append('techStack', filters.techStack[0]); // For simplicity, use first tech stack
      }

      // Make API call
      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects');
      }

      // Transform the data to match expected format
      return result.data.map(project => this.transformProjectData(project));

    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Fetch single project by ID
  async getProjectById(id) {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            id,
            role,
            joined_at,
            left_at,
            is_active,
            contribution_hours,
            contribution_description,
            user:profiles(id, full_name, avatar_url, github_username, batch)
          ),
          contributions (
            id,
            contribution_type,
            title,
            description,
            points_awarded,
            contribution_date,
            github_url,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return this.transformProjectDetailData(project);

    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData, userId) {
    try {


      // Use the proper API route with service role key
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          created_by: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }


      return this.transformProjectData(result.data);

    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(id, updates, userId) {
    try {
      // Check if user has permission to update
      const { data: project } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', id)
        .single();

      if (!project || project.created_by !== userId) {
        throw new Error('Unauthorized to update this project');
      }

      const { data: updatedProject, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return this.transformProjectData(updatedProject);

    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Join project
  async joinProject(projectId, userId, role = 'member') {
    try {
      // Check if project exists and has space
      const { data: project } = await supabase
        .from('projects')
        .select('max_members, project_members(count)')
        .eq('id', projectId)
        .single();

      if (!project) {
        throw new Error('Project not found');
      }

      const currentMembers = project.project_members?.[0]?.count || 0;
      if (currentMembers >= project.max_members) {
        throw new Error('Project is full');
      }

      // Add user to project
      const { data: membership, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: role
        })
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          project:projects(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return membership;

    } catch (error) {
      console.error('Error joining project:', error);
      throw error;
    }
  }

  // Leave project
  async leaveProject(projectId, userId) {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error('Error leaving project:', error);
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats() {
    try {
      // Get total projects by status
      const { data: statusStats } = await supabase
        .from('projects')
        .select('status');

      // Get total members across all projects
      const { count: totalMembers } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total contributions
      const { count: totalContributions } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true });

      const stats = {
        totalProjects: statusStats?.length || 0,
        activeProjects: statusStats?.filter(p => p.status === 'active').length || 0,
        completedProjects: statusStats?.filter(p => p.status === 'completed').length || 0,
        totalMembers: totalMembers || 0,
        totalContributions: totalContributions || 0
      };

      return stats;

    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }

  // Transform project data to match expected format
  transformProjectData(project, currentUserId = null) {
    const activeMembers = project.project_members?.filter(pm => pm.is_active) || [];
    const contributions = project.contributions || [];
    
    // Check if current user is part of this project
    const isUserProject = currentUserId && (
      project.created_by === currentUserId ||
      project.project_lead === currentUserId ||
      activeMembers.some(member => member.user.id === currentUserId)
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      longDescription: project.long_description,
      tags: project.tech_stack || [],
      techStack: project.tech_stack || [],
      status: project.status,
      priority: project.priority,
      difficultyLevel: project.difficulty_level,
      stars: project.github_stars || 0,
      forks: project.github_forks || 0,
      contributors: activeMembers.length,
      owner: project.created_by || 'Unknown',
      projectLead: null, // Will be populated separately if needed
      repoUrl: project.github_repo_url,
      liveUrl: project.live_demo_url,
      isUserProject: isUserProject,
      isPublic: project.is_public,
      startDate: project.start_date,
      endDate: project.end_date,
      estimatedHours: project.estimated_hours,
      actualHours: project.actual_hours,
      maxMembers: project.max_members,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      // Additional stats
      totalContributions: contributions.length,
      totalPoints: contributions.reduce((sum, c) => sum + (c.points_awarded || 0), 0)
    };
  }

  // Transform detailed project data
  transformProjectDetailData(project) {
    const baseData = this.transformProjectData(project);
    
    return {
      ...baseData,
      members: project.project_members?.map(pm => ({
        id: pm.id,
        role: pm.role,
        joinedAt: pm.joined_at,
        leftAt: pm.left_at,
        isActive: pm.is_active,
        contributionHours: pm.contribution_hours || 0,
        contributionDescription: pm.contribution_description,
        user: {
          id: pm.user.id,
          name: pm.user.full_name,
          avatar: pm.user.avatar_url || `https://i.pravatar.cc/150?u=${pm.user.id}`,
          githubUsername: pm.user.github_username,
          batch: pm.user.batch
        }
      })) || [],
      contributions: project.contributions?.map(c => ({
        id: c.id,
        type: c.contribution_type,
        title: c.title,
        description: c.description,
        points: c.points_awarded,
        date: c.contribution_date,
        githubUrl: c.github_url,
        user: {
          id: c.user.id,
          name: c.user.full_name,
          avatar: c.user.avatar_url || `https://i.pravatar.cc/150?u=${c.user.id}`
        }
      })) || [],
      meetings: project.meetings?.map(m => ({
        id: m.id,
        title: m.title,
        date: m.date,
        startTime: m.start_time,
        location: m.location,
        type: m.meeting_type,
        attendanceOpen: m.attendance_open
      })) || []
    };
  }

  // Get user's projects
  async getUserProjects(userId) {
    try {
      const projects = await this.getAllProjects({ userId });
      return projects;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  }

  // Get trending projects (most active)
  async getTrendingProjects(limit = 5) {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members(count),
          contributions(count)
        `)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return projects.map(project => this.transformProjectData(project));

    } catch (error) {
      console.error('Error fetching trending projects:', error);
      throw error;
    }
  }

  // Get project by ID with full details
  async getProjectById(id) {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members(
            id,
            role,
            is_active,
            user_id,
            user:profiles(id, full_name, avatar_url, github_username)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!project) {
        throw new Error('Project not found');
      }

      return this.transformProjectData(project);

    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Get project members
  async getProjectMembers(projectId) {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch project members');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }
  }

  // Assign student to project
  async assignStudentToProject(projectId, userId, role = 'member') {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          role: role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to assign student to project');
      }

      return result.data;

    } catch (error) {
      console.error('Error assigning student to project:', error);
      throw error;
    }
  }

  // Remove member from project
  async removeMemberFromProject(projectId, memberId) {
    try {
      const response = await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove member from project');
      }

      return true;

    } catch (error) {
      console.error('Error removing member from project:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
