"use client";

import { useState, useEffect } from 'react';
import { SupabaseTest } from '@/lib/supabase-test';
import Navigation from '@/components/Navigation';

export default function SupabaseDebug() {
  const [connectionResult, setConnectionResult] = useState(null);
  const [tableResults, setTableResults] = useState(null);
  const [envInfo, setEnvInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEnvInfo(SupabaseTest.getEnvironmentInfo());
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await SupabaseTest.testConnection();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const testTables = async () => {
    setLoading(true);
    try {
      const results = await SupabaseTest.testAllTables();
      setTableResults(results);
    } catch (error) {
      setTableResults({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Debug</h1>
        
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Information</h2>
          {envInfo && (
            <div className="space-y-2">
              <p><strong>Supabase URL:</strong> {envInfo.supabaseUrl}</p>
              <p><strong>Has Anon Key:</strong> {envInfo.hasAnonKey ? '✓ Yes' : '✗ No'}</p>
              <p><strong>Node Environment:</strong> {envInfo.nodeEnv}</p>
              <p><strong>Client Side:</strong> {envInfo.isClient ? '✓ Yes' : '✗ No'}</p>
            </div>
          )}
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Connection Test</h2>
          <button 
            onClick={testConnection}
            disabled={loading}
            className="btn-primary mb-4"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {connectionResult && (
            <div className={`p-4 rounded ${connectionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p><strong>Status:</strong> {connectionResult.success ? 'Success' : 'Failed'}</p>
              {connectionResult.message && <p><strong>Message:</strong> {connectionResult.message}</p>}
              {connectionResult.error && <p><strong>Error:</strong> {connectionResult.error}</p>}
              {connectionResult.details && (
                <details className="mt-2">
                  <summary>Error Details</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(connectionResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Table Access Test</h2>
          <button 
            onClick={testTables}
            disabled={loading}
            className="btn-primary mb-4"
          >
            {loading ? 'Testing...' : 'Test Table Access'}
          </button>
          
          {tableResults && (
            <div className="space-y-4">
              {Object.entries(tableResults).map(([table, result]) => (
                <div key={table} className={`p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p><strong>{table}:</strong> {result.success ? 'Success' : 'Failed'}</p>
                  {result.error && <p className="text-sm">Error: {result.error}</p>}
                  {result.data && (
                    <details className="mt-2">
                      <summary>Sample Data</summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Verify that your Supabase URL and anon key are correct in .env.local</li>
            <li>Check that your Supabase project is active and not paused</li>
            <li>Ensure Row Level Security (RLS) policies allow access to tables</li>
            <li>Verify that localhost:3000 is allowed in your Supabase project settings</li>
            <li>Check browser console for additional error details</li>
            <li>Try accessing your Supabase project directly in the browser</li>
          </ol>
        </div>
      </div>
    </>
  );
}
