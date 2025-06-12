'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestData() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);

        // Check github_stats table
        const { data: githubStats, error: githubError } = await supabase
          .from('github_stats')
          .select('*')
          .limit(5);

        // Check projects table
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .limit(5);

        // Check meetings table
        const { data: meetings, error: meetingsError } = await supabase
          .from('meetings')
          .select('*')
          .limit(5);

        // Get table counts
        const { count: profileCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: githubCount } = await supabase
          .from('github_stats')
          .select('*', { count: 'exact', head: true });

        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        const { count: meetingCount } = await supabase
          .from('meetings')
          .select('*', { count: 'exact', head: true });

        setData({
          profiles: {
            data: profiles || [],
            count: profileCount || 0,
            error: profilesError
          },
          githubStats: {
            data: githubStats || [],
            count: githubCount || 0,
            error: githubError
          },
          projects: {
            data: projects || [],
            count: projectCount || 0,
            error: projectsError
          },
          meetings: {
            data: meetings || [],
            count: meetingCount || 0,
            error: meetingsError
          }
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkData();
  }, []);

  const addSampleData = async () => {
    try {
      setLoading(true);
      
      // Add a sample profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            username: 'testuser',
            full_name: 'Test User',
            email: 'test@example.com',
            github_username: 'Oashe02',
            batch: '2024',
            role: 'student',
            reward_points: 100,
            is_admin: false
          }
        ])
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      // Add sample GitHub stats
      const { error: githubError } = await supabase
        .from('github_stats')
        .insert([
          {
            user_id: newProfile.id,
            github_username: 'Oashe02',
            public_repos: 15,
            followers: 10,
            following: 20,
            total_stars: 50,
            total_forks: 25,
            total_commits_last_year: 200,
            top_languages: [
              { name: 'JavaScript', percentage: 45 },
              { name: 'Python', percentage: 30 },
              { name: 'TypeScript', percentage: 25 }
            ],
            contribution_streak: 15
          }
        ]);

      if (githubError) {
        throw githubError;
      }

      alert('Sample data added successfully!');
      window.location.reload();

    } catch (err) {
      alert('Error adding sample data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Checking database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Data Check</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={addSampleData}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Add Sample Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profiles */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Profiles ({data.profiles?.count || 0} records)
            </h2>
            {data.profiles?.error && (
              <div className="text-red-600 mb-2">Error: {data.profiles.error.message}</div>
            )}
            <div className="space-y-2">
              {data.profiles?.data?.length > 0 ? (
                data.profiles.data.map((profile, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p><strong>Name:</strong> {profile.full_name || profile.username}</p>
                    <p><strong>GitHub:</strong> {profile.github_username || 'N/A'}</p>
                    <p><strong>Points:</strong> {profile.reward_points || 0}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No profiles found</p>
              )}
            </div>
          </div>

          {/* GitHub Stats */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              GitHub Stats ({data.githubStats?.count || 0} records)
            </h2>
            {data.githubStats?.error && (
              <div className="text-red-600 mb-2">Error: {data.githubStats.error.message}</div>
            )}
            <div className="space-y-2">
              {data.githubStats?.data?.length > 0 ? (
                data.githubStats.data.map((stats, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p><strong>Username:</strong> {stats.github_username}</p>
                    <p><strong>Repos:</strong> {stats.public_repos || 0}</p>
                    <p><strong>Stars:</strong> {stats.total_stars || 0}</p>
                    <p><strong>Commits:</strong> {stats.total_commits_last_year || 0}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No GitHub stats found</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Projects ({data.projects?.count || 0} records)
            </h2>
            {data.projects?.error && (
              <div className="text-red-600 mb-2">Error: {data.projects.error.message}</div>
            )}
            <div className="space-y-2">
              {data.projects?.data?.length > 0 ? (
                data.projects.data.map((project, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p><strong>Name:</strong> {project.name}</p>
                    <p><strong>Status:</strong> {project.status}</p>
                    <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No projects found</p>
              )}
            </div>
          </div>

          {/* Meetings */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Meetings ({data.meetings?.count || 0} records)
            </h2>
            {data.meetings?.error && (
              <div className="text-red-600 mb-2">Error: {data.meetings.error.message}</div>
            )}
            <div className="space-y-2">
              {data.meetings?.data?.length > 0 ? (
                data.meetings.data.map((meeting, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <p><strong>Title:</strong> {meeting.title}</p>
                    <p><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
                    <p><strong>Type:</strong> {meeting.meeting_type}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No meetings found</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 card p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.profiles?.count || 0}</div>
              <div className="text-sm text-gray-600">Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.githubStats?.count || 0}</div>
              <div className="text-sm text-gray-600">GitHub Stats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.projects?.count || 0}</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.meetings?.count || 0}</div>
              <div className="text-sm text-gray-600">Meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
