// API route to sync GitHub data - simplified version for testing
import { NextResponse } from 'next/server';
import { githubService } from '@/lib/github';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { githubUsername, forceRefresh = false } = body;

    if (!githubUsername) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    console.log(`Syncing GitHub data for: ${githubUsername}`);

    // Fetch GitHub data directly
    const githubData = await githubService.fetchCompleteUserData(githubUsername);

    return NextResponse.json({
      success: true,
      data: githubData,
      message: 'GitHub data synced successfully'
    });

  } catch (error) {
    console.error('Error syncing GitHub data:', error);

    return NextResponse.json(
      {
        error: 'Failed to sync GitHub data',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to sync GitHub data',
    example: {
      method: 'POST',
      body: {
        githubUsername: 'your-github-username'
      }
    }
  });
}
