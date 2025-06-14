import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Check if data already exists
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Sample data already exists',
        profileCount: existingProfiles.length
      });
    }

    // Create sample profiles
    const sampleProfiles = [
      {
        username: 'oashe02',
        full_name: 'Oashe Mehta',
        email: 'oashe@example.com',
        github_username: 'Oashe02',
        batch: '2024',
        role: 'student',
        reward_points: 250,
        is_admin: true,
        bio: 'Full-stack developer passionate about web technologies',
        skills: ['JavaScript', 'React', 'Node.js', 'Python']
      },
      {
        username: 'john_doe',
        full_name: 'John Doe',
        email: 'john@example.com',
        github_username: 'johndoe',
        batch: '2024',
        role: 'student',
        reward_points: 180,
        is_admin: false,
        bio: 'Frontend developer with a love for UI/UX design',
        skills: ['JavaScript', 'React', 'CSS', 'Figma']
      },
      {
        username: 'jane_smith',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        github_username: 'janesmith',
        batch: '2023',
        role: 'student',
        reward_points: 320,
        is_admin: false,
        bio: 'Backend developer specializing in Python and databases',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker']
      }
    ];

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .insert(sampleProfiles)
      .select();

    if (profileError) {
      throw profileError;
    }

    // Create sample GitHub stats for each profile
    const githubStatsData = [
      {
        user_id: profiles[1].id,
        github_username: 'johndoe',
        public_repos: 15,
        followers: 12,
        following: 20,
        total_stars: 60,
        total_forks: 25,
        total_commits_last_year: 250,
        top_languages: [
          { name: 'JavaScript', percentage: 50 },
          { name: 'CSS', percentage: 30 },
          { name: 'HTML', percentage: 20 }
        ],
        contribution_streak: 15,
        last_contribution_date: new Date().toISOString()
      },
      {
        user_id: profiles[2].id,
        github_username: 'janesmith',
        public_repos: 30,
        followers: 35,
        following: 25,
        total_stars: 150,
        total_forks: 60,
        total_commits_last_year: 500,
        top_languages: [
          { name: 'Python', percentage: 60 },
          { name: 'JavaScript', percentage: 25 },
          { name: 'SQL', percentage: 15 }
        ],
        contribution_streak: 30,
        last_contribution_date: new Date().toISOString()
      }
    ];

    const { error: githubError } = await supabase
      .from('github_stats')
      .insert(githubStatsData);

    if (githubError) {
      console.error('GitHub stats error:', githubError);
      // Don't throw here, profiles are already created
    }

    // Create sample projects
    const sampleProjects = [
      {
        name: 'NST Dev Club Portal',
        description: 'A comprehensive portal for managing the NST Dev Club',
        status: 'active',
        tech_stack: ['Next.js', 'React', 'Supabase', 'Tailwind CSS'],
        github_repo_url: 'https://github.com/nst-sdc/Portal',
        created_by: profiles[0].id
      },
      {
        name: 'Student Management System',
        description: 'A system for managing student records and grades',
        status: 'active',
        tech_stack: ['React', 'Node.js', 'MongoDB'],
        github_repo_url: 'https://github.com/example/student-system',
        created_by: profiles[1].id
      }
    ];

    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .insert(sampleProjects)
      .select();

    if (projectError) {
      console.error('Project error:', projectError);
    }

    // Create project memberships
    if (projects && projects.length > 0) {
      const projectMemberships = [
        {
          user_id: profiles[0].id,
          project_id: projects[0].id,
          role: 'lead',
          is_active: true
        },
        {
          user_id: profiles[1].id,
          project_id: projects[0].id,
          role: 'developer',
          is_active: true
        },
        {
          user_id: profiles[2].id,
          project_id: projects[1].id,
          role: 'lead',
          is_active: true
        }
      ];

      const { error: membershipError } = await supabase
        .from('project_members')
        .insert(projectMemberships);

      if (membershipError) {
        console.error('Membership error:', membershipError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        profiles: profiles.length,
        githubStats: githubStatsData.length,
        projects: projects?.length || 0
      }
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
