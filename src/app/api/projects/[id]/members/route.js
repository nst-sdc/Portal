// API routes for project member management
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

// GET /api/projects/[id]/members - Get project members
export async function GET(request, { params }) {
  try {
    const { id: projectId } = await params;

    const { data: members, error } = await supabaseAdmin
      .from('project_members')
      .select(`
        id,
        role,
        is_active,
        user_id,
        joined_at,
        user:profiles(id, full_name, avatar_url, github_username)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Transform the data
    const transformedMembers = members.map(member => ({
      id: member.id,
      userId: member.user_id,
      role: member.role,
      name: member.user.full_name,
      avatar: member.user.avatar_url || `https://i.pravatar.cc/150?u=${member.user.id}`,
      githubUsername: member.user.github_username,
      joinedAt: member.joined_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedMembers,
      count: transformedMembers.length
    });

  } catch (error) {
    console.error('Error fetching project members:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch project members',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add member to project
export async function POST(request, { params }) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    const { userId, role = 'member' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is already an active member
    const { data: activeMember } = await supabaseAdmin
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (activeMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Check if user was previously a member (inactive)
    const { data: inactiveMember } = await supabaseAdmin
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('is_active', false)
      .single();

    let member;

    if (inactiveMember) {
      // Reactivate the existing member record
      const { data: reactivatedMember, error: reactivateError } = await supabaseAdmin
        .from('project_members')
        .update({
          role: role,
          is_active: true,
          left_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', inactiveMember.id)
        .select(`
          id,
          role,
          is_active,
          user_id,
          joined_at,
          user:profiles(id, full_name, avatar_url, github_username)
        `)
        .single();

      if (reactivateError) {
        throw reactivateError;
      }

      member = reactivatedMember;
    } else {
      // Create new member record
      const { data: newMember, error: createError } = await supabaseAdmin
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: role,
          is_active: true
        })
        .select(`
          id,
          role,
          is_active,
          user_id,
          joined_at,
          user:profiles(id, full_name, avatar_url, github_username)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      member = newMember;
    }

    // Member variable is already set above

    // Transform the response
    const transformedMember = {
      id: member.id,
      userId: member.user_id,
      role: member.role,
      name: member.user.full_name,
      avatar: member.user.avatar_url || `https://i.pravatar.cc/150?u=${member.user.id}`,
      githubUsername: member.user.github_username,
      joinedAt: member.joined_at
    };

    return NextResponse.json({
      success: true,
      data: transformedMember,
      message: 'Member added to project successfully'
    });

  } catch (error) {
    console.error('Error adding project member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to add member to project',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/members - Remove member from project
export async function DELETE(request, { params }) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Remove member (set is_active to false)
    const { error } = await supabaseAdmin
      .from('project_members')
      .update({ 
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from project successfully'
    });

  } catch (error) {
    console.error('Error removing project member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to remove member from project',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
