// API route to check database schema
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    
    // Try to get one record from profiles to see the actual structure
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    
    // Try to get one record from projects
    const { data: projectSample, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    // Try to get one record from project_members
    const { data: memberSample, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .limit(1);

    
    return NextResponse.json({
      success: true,
      schema: {
        profiles: {
          sample: profileSample?.[0] || null,
          error: profileError?.message || null,
          columns: profileSample?.[0] ? Object.keys(profileSample[0]) : []
        },
        projects: {
          sample: projectSample?.[0] || null,
          error: projectError?.message || null,
          columns: projectSample?.[0] ? Object.keys(projectSample[0]) : []
        },
        project_members: {
          sample: memberSample?.[0] || null,
          error: memberError?.message || null,
          columns: memberSample?.[0] ? Object.keys(memberSample[0]) : []
        }
      }
    });
    
  } catch (error) {
    console.error('Error checking schema:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
}
