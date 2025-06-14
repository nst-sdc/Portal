// API routes for projects management
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client that can bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;



const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET /api/projects - Fetch all projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public');
    const search = searchParams.get('search');
    const techStack = searchParams.get('techStack');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build query - simplified without foreign key references
    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        project_members(
          id,
          role,
          is_active,
          user:profiles(id, full_name, avatar_url, github_username)
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
      query = query.eq('created_by', userId);
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Tech stack filter
    if (techStack) {
      query = query.contains('tech_stack', [techStack]);
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
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Get user ID from the request body (passed from frontend)
    const userId = body.created_by;
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Create project - start with minimal data to avoid RLS issues
    const projectData = {
      name: body.name,
      description: body.description,
      status: 'planning',
      is_public: true,
      difficulty_level: 'beginner',
      max_members: 10
    };

    // Add optional fields only if they exist
    if (body.long_description) projectData.long_description = body.long_description;
    if (body.github_repo_url) projectData.github_repo_url = body.github_repo_url;
    if (body.live_demo_url) projectData.live_demo_url = body.live_demo_url;
    if (body.tech_stack && body.tech_stack.length > 0) projectData.tech_stack = body.tech_stack;



    // Use the admin client to bypass RLS
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert(projectData)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error creating project:', error);
      throw error;
    }



    // Add creator as project member using admin client
    const { error: memberError } = await supabaseAdmin
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: userId,
        role: 'lead',
        is_active: true
      });

    if (memberError) {
      console.error('Error adding project member:', memberError);
      // Don't fail the whole request if member addition fails
    }

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
