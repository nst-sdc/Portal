'use client';

import { useState } from 'react';

export default function TestGitHub() {
  const [githubUsername, setGithubUsername] = useState('Oashe02'); // Your GitHub username
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGitHubAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: githubUsername
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to fetch GitHub data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GitHub API Test</h1>
        
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test GitHub Data Fetching</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={testGitHubAPI}
              disabled={loading || !githubUsername}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fetching...' : 'Fetch GitHub Data'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <strong>Success!</strong> GitHub data fetched successfully.
            </div>
          )}
        </div>

        {result && result.data && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">GitHub Data Results</h2>
            
            {/* Profile Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Profile Information</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Username:</strong> {result.data.profile?.login}</p>
                <p><strong>Name:</strong> {result.data.profile?.name || 'N/A'}</p>
                <p><strong>Public Repos:</strong> {result.data.profile?.public_repos}</p>
                <p><strong>Followers:</strong> {result.data.profile?.followers}</p>
                <p><strong>Following:</strong> {result.data.profile?.following}</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Calculated Statistics</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Total Stars:</strong> {result.data.stats?.totalStars}</p>
                <p><strong>Total Forks:</strong> {result.data.stats?.totalForks}</p>
                <p><strong>Commits (Last Year):</strong> {result.data.stats?.totalCommitsLastYear}</p>
                <p><strong>Contribution Streak:</strong> {result.data.stats?.contributionStreak} days</p>
              </div>
            </div>

            {/* Top Languages */}
            {result.data.stats?.topLanguages && result.data.stats.topLanguages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Top Languages</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {result.data.stats.topLanguages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <span>{lang.name}</span>
                      <span>{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Repositories */}
            {result.data.repositories && result.data.repositories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Recent Repositories (Top 5)</h3>
                <div className="space-y-3">
                  {result.data.repositories.slice(0, 5).map((repo, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            <a 
                              href={repo.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {repo.name}
                            </a>
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {repo.description || 'No description'}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <div>⭐ {repo.stargazers_count}</div>
                          <div>🍴 {repo.forks_count}</div>
                          {repo.language && <div className="text-primary">{repo.language}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data (for debugging) */}
            <details className="mt-6">
              <summary className="cursor-pointer text-lg font-medium mb-2">Raw API Response (Debug)</summary>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
