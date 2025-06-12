import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test database connection and check data
    const results = {};

    // Check profiles table
    const { data: profiles, error: profilesError, count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(3);

    results.profiles = {
      count: profileCount || 0,
      data: profiles || [],
      error: profilesError?.message || null
    };

    // Check github_stats table
    const { data: githubStats, error: githubError, count: githubCount } = await supabase
      .from('github_stats')
      .select('*', { count: 'exact' })
      .limit(3);

    results.githubStats = {
      count: githubCount || 0,
      data: githubStats || [],
      error: githubError?.message || null
    };

    // Check projects table
    const { data: projects, error: projectsError, count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(3);

    results.projects = {
      count: projectCount || 0,
      data: projects || [],
      error: projectsError?.message || null
    };

    // Test if we can create a sample profile
    const testProfile = {
      username: `test_${Date.now()}`,
      full_name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      github_username: 'Oashe02',
      batch: '2024',
      role: 'student',
      reward_points: 50
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select()
      .single();

    results.testInsert = {
      success: !insertError,
      data: newProfile || null,
      error: insertError?.message || null
    };

    // If insert was successful, clean it up
    if (newProfile) {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', newProfile.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      results
    });

  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
