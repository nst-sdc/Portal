// API routes for projects management
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/projects - Fetch all projects
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles!projects_created_by_fkey(id, full_name, avatar_url),
        project_lead_profile:profiles!projects_project_lead_fkey(id, full_name, avatar_url),
        project_members(
          id,
          role,
          is_active,
          user:profiles(id, full_name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (isPublic !== null) {
      query = query.eq('is_public', isPublic === 'true');
    }

    // Filter by user projects if userId provided
    if (userId) {
      query = query.or(`created_by.eq.${userId},project_lead.eq.${userId}`);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
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
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Create project
    const projectData = {
      name: body.name,
      description: body.description,
      long_description: body.long_description,
      github_repo_url: body.github_repo_url,
      live_demo_url: body.live_demo_url,
      tech_stack: body.tech_stack || [],
      status: body.status || 'planning',
      priority: body.priority || 'medium',
      start_date: body.start_date,
      end_date: body.end_date,
      estimated_hours: body.estimated_hours,
      created_by: user.id,
      project_lead: body.project_lead || user.id,
      is_public: body.is_public !== false, // Default to true
      tags: body.tags || [],
      difficulty_level: body.difficulty_level || 'beginner',
      max_members: body.max_members || 10
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(`
        *,
        created_by_profile:profiles!projects_created_by_fkey(id, full_name, avatar_url),
        project_lead_profile:profiles!projects_project_lead_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Add creator as project member
    await supabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: 'lead'
      });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('Error creating project:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
