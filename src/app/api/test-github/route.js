// Test GitHub API connectivity
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing GitHub API...');
    console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
    console.log('NEXT_PUBLIC_GITHUB_TOKEN exists:', !!process.env.NEXT_PUBLIC_GITHUB_TOKEN);
    
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    
    if (!token) {
      return NextResponse.json({
        error: 'No GitHub token found',
        env_vars: {
          GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
          NEXT_PUBLIC_GITHUB_TOKEN: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN
        }
      }, { status: 400 });
    }

    // Test GitHub API with a simple request
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NST-Dev-Club-Portal'
      }
    });

    console.log('GitHub API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('GitHub API Error:', errorText);
      
      return NextResponse.json({
        error: 'GitHub API request failed',
        status: response.status,
        message: errorText,
        token_preview: token ? `${token.substring(0, 10)}...` : 'No token'
      }, { status: response.status });
    }

    const userData = await response.json();
    console.log('GitHub API Success:', userData.login);

    return NextResponse.json({
      success: true,
      message: 'GitHub API is working!',
      user: {
        login: userData.login,
        name: userData.name,
        public_repos: userData.public_repos,
        followers: userData.followers
      },
      token_preview: `${token.substring(0, 10)}...`
    });

  } catch (error) {
    console.error('GitHub API Test Error:', error);
    
    return NextResponse.json({
      error: 'GitHub API test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
