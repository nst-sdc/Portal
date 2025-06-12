'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addSampleData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/add-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to add sample data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGitHubSync = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: 'Oashe02'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('GitHub sync successful! Check the console for details.');
        console.log('GitHub sync result:', data);
      } else {
        setError('GitHub sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('GitHub sync error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Setup & Test Portal</h1>
        
        <div className="space-y-6">
          {/* Add Sample Data */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">1. Add Sample Data</h2>
            <p className="text-gray-600 mb-4">
              This will create sample profiles, GitHub stats, and projects in the database.
            </p>
            <button
              onClick={addSampleData}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Data...' : 'Add Sample Data'}
            </button>
          </div>

          {/* Test GitHub Sync */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">2. Test GitHub Sync</h2>
            <p className="text-gray-600 mb-4">
              This will test the GitHub API integration by syncing data for Oashe02.
            </p>
            <button
              onClick={testGitHubSync}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Syncing...' : 'Test GitHub Sync'}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">3. Test Pages</h2>
            <p className="text-gray-600 mb-4">
              After adding sample data, test these pages to see if GitHub data is visible:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/students" className="btn-secondary text-center">
                Students Page
              </Link>
              <Link href="/dashboard" className="btn-secondary text-center">
                Dashboard
              </Link>
              <Link href="/projects" className="btn-secondary text-center">
                Projects
              </Link>
              <Link href="/debug" className="btn-secondary text-center">
                Debug Info
              </Link>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="card p-6 bg-red-50 border-red-200">
              <h2 className="text-xl font-semibold mb-4 text-red-800">Error</h2>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="card p-6 bg-green-50 border-green-200">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Success!</h2>
              <p className="text-green-700 mb-4">{result.message}</p>
              {result.data && (
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-semibold mb-2">Data Created:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Profiles: {result.data.profiles}</li>
                    <li>GitHub Stats: {result.data.githubStats}</li>
                    <li>Projects: {result.data.projects}</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="card p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>First, click "Add Sample Data" to populate the database</li>
              <li>Then, click "Test GitHub Sync" to verify API integration</li>
              <li>Visit the Students page to see if GitHub data is displayed</li>
              <li>Check the Dashboard for real-time stats</li>
              <li>Use the Debug page to see detailed information</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
