'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { studentsService } from '@/lib/services/students';
import { dashboardService } from '@/lib/services/dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function Debug() {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      try {
        setLoading(true);
        const testResults = {};

        // Test 1: Direct Supabase connection
        console.log('Testing Supabase connection...');
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);

        testResults.supabaseConnection = {
          success: !profilesError,
          profileCount: profiles?.length || 0,
          profiles: profiles || [],
          error: profilesError?.message
        };

        // Test 2: Students service
        console.log('Testing students service...');
        try {
          const students = await studentsService.getAllStudents();
          testResults.studentsService = {
            success: true,
            studentCount: students?.length || 0,
            students: students || [],
            error: null
          };
        } catch (err) {
          testResults.studentsService = {
            success: false,
            studentCount: 0,
            students: [],
            error: err.message
          };
        }

        // Test 3: Dashboard service (if user is authenticated)
        if (user) {
          console.log('Testing dashboard service...');
          try {
            const dashboardData = await dashboardService.getDashboardStats(user.id);
            testResults.dashboardService = {
              success: true,
              data: dashboardData,
              error: null
            };
          } catch (err) {
            testResults.dashboardService = {
              success: false,
              data: null,
              error: err.message
            };
          }
        }

        // Test 4: GitHub stats
        console.log('Testing GitHub stats...');
        const { data: githubStats, error: githubError } = await supabase
          .from('github_stats')
          .select('*')
          .limit(5);

        testResults.githubStats = {
          success: !githubError,
          count: githubStats?.length || 0,
          data: githubStats || [],
          error: githubError?.message
        };

        // Test 5: Create sample data if none exists
        if (profiles?.length === 0) {
          console.log('No profiles found, creating sample data...');
          try {
            const sampleProfile = {
              username: 'sample_user',
              full_name: 'Sample User',
              email: 'sample@example.com',
              github_username: 'Oashe02',
              batch: '2024',
              role: 'student',
              reward_points: 150,
              is_admin: false
            };

            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([sampleProfile])
              .select()
              .single();

            if (!insertError && newProfile) {
              // Add GitHub stats for the sample user
              const sampleGithubStats = {
                user_id: newProfile.id,
                github_username: 'Oashe02',
                public_repos: 20,
                followers: 15,
                following: 25,
                total_stars: 75,
                total_forks: 30,
                total_commits_last_year: 300,
                top_languages: [
                  { name: 'JavaScript', percentage: 40 },
                  { name: 'Python', percentage: 35 },
                  { name: 'TypeScript', percentage: 25 }
                ],
                contribution_streak: 20
              };

              await supabase
                .from('github_stats')
                .insert([sampleGithubStats]);

              testResults.sampleDataCreated = {
                success: true,
                profile: newProfile,
                message: 'Sample data created successfully'
              };
            }
          } catch (err) {
            testResults.sampleDataCreated = {
              success: false,
              error: err.message
            };
          }
        }

        setResults(testResults);
      } catch (error) {
        console.error('Debug test error:', error);
        setResults({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Running debug tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          <div className="card p-4">
            <p><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="card p-6">
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              
              <div className={`p-3 rounded mb-4 ${
                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <strong>Status:</strong> {result.success ? 'Success' : 'Failed'}
                {result.error && <div><strong>Error:</strong> {result.error}</div>}
              </div>

              {result.profileCount !== undefined && (
                <p><strong>Profile Count:</strong> {result.profileCount}</p>
              )}
              
              {result.studentCount !== undefined && (
                <p><strong>Student Count:</strong> {result.studentCount}</p>
              )}
              
              {result.count !== undefined && (
                <p><strong>Record Count:</strong> {result.count}</p>
              )}

              {result.profiles && result.profiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Sample Profiles:</h3>
                  <div className="space-y-2">
                    {result.profiles.slice(0, 3).map((profile, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded">
                        <p><strong>Name:</strong> {profile.full_name || profile.username}</p>
                        <p><strong>GitHub:</strong> {profile.github_username || 'N/A'}</p>
                        <p><strong>Points:</strong> {profile.reward_points || 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.students && result.students.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Sample Students:</h3>
                  <div className="space-y-2">
                    {result.students.slice(0, 3).map((student, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded">
                        <p><strong>Name:</strong> {student.name}</p>
                        <p><strong>GitHub:</strong> {student.githubUsername || 'N/A'}</p>
                        <p><strong>Points:</strong> {student.rewardPoints || 0}</p>
                        <p><strong>Languages:</strong> {student.topLanguages?.join(', ') || 'None'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.data && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Dashboard Data:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {result.message && (
                <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
                  {result.message}
                </div>
              )}
            </div>
          ))}
        </div>

        {results.error && (
          <div className="card p-6 bg-red-50">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Global Error</h2>
            <p className="text-red-700">{results.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
