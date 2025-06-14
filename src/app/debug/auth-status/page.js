"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

export default function AuthStatus() {
  const { user, session, loading } = useAuth();
  const [clientSession, setClientSession] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setClientSession(session);
    };
    checkSession();
  }, []);

  const testProjectCreation = async () => {
    try {
      setTestResult({ loading: true });
      
      const testProject = {
        name: 'Auth Test Project',
        description: 'Testing project creation with authentication',
        tech_stack: ['React', 'JavaScript'],
        status: 'planning',
        is_public: true,
        difficulty_level: 'beginner',
        max_members: 5
      };



      const { data: project, error } = await supabase
        .from('projects')
        .insert(testProject)
        .select('*')
        .single();

      if (error) {
        setTestResult({ 
          success: false, 
          error: error.message,
          details: error 
        });
      } else {
        setTestResult({ 
          success: true, 
          project: project 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.message 
      });
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Authentication Status Debug</h1>
        
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Auth Context Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? '✓ Authenticated' : '✗ Not authenticated'}</p>
            <p><strong>Session:</strong> {session ? '✓ Active' : '✗ No session'}</p>
            {user && (
              <div className="mt-4 p-4 bg-green-100 rounded">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.user_metadata?.full_name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Client Session Status</h2>
          <div className="space-y-2">
            <p><strong>Client Session:</strong> {clientSession ? '✓ Active' : '✗ No session'}</p>
            {clientSession && (
              <div className="mt-4 p-4 bg-blue-100 rounded">
                <p><strong>Access Token:</strong> {clientSession.access_token ? 'Present' : 'Missing'}</p>
                <p><strong>Expires At:</strong> {new Date(clientSession.expires_at * 1000).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Project Creation</h2>
          <button 
            onClick={testProjectCreation}
            disabled={!user || (testResult && testResult.loading)}
            className="btn-primary mb-4"
          >
            {testResult && testResult.loading ? 'Testing...' : 'Test Create Project'}
          </button>
          
          {testResult && !testResult.loading && (
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p><strong>Result:</strong> {testResult.success ? 'Success!' : 'Failed'}</p>
              {testResult.error && <p><strong>Error:</strong> {testResult.error}</p>}
              {testResult.project && (
                <div className="mt-2">
                  <p><strong>Project Created:</strong> {testResult.project.name}</p>
                  <p><strong>Project ID:</strong> {testResult.project.id}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're signed in with the test user</li>
            <li>Check that both Auth Context and Client Session show as active</li>
            <li>Click "Test Create Project" to test authenticated project creation</li>
            <li>If successful, try creating a project through the normal form</li>
          </ol>
        </div>
      </div>
    </>
  );
}
