// GitHub API integration for NST Dev Club Portal
import { supabase } from './supabase';

const GITHUB_API_BASE = 'https://api.github.com';

// GitHub API helper functions
export class GitHubService {
  constructor() {
    this.apiKey = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  }

  // Get headers for GitHub API requests
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'NST-Dev-Club-Portal'
    };

    if (this.apiKey) {
      headers['Authorization'] = `token ${this.apiKey}`;
    }

    return headers;
  }

  // Fetch user's GitHub profile
  async fetchUserProfile(username) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub profile:', error);
      throw error;
    }
  }

  // Fetch user's repositories
  async fetchUserRepositories(username, page = 1, perPage = 100) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  }

  // Fetch user's contribution activity
  async fetchUserContributions(username) {
    try {
      // Note: GitHub doesn't provide a direct API for contribution graph data
      // We'll use events API as an alternative
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/events?per_page=100`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub contributions:', error);
      throw error;
    }
  }

  // Calculate language statistics from repositories
  calculateLanguageStats(repositories) {
    const languageBytes = {};
    let totalBytes = 0;

    repositories.forEach(repo => {
      if (repo.language) {
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + (repo.size || 0);
        totalBytes += repo.size || 0;
      }
    });

    // Convert to percentages and sort
    const languageStats = Object.entries(languageBytes)
      .map(([language, bytes]) => ({
        name: language,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
        bytes
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // Top 5 languages

    return languageStats;
  }

  // Calculate contribution statistics from events
  calculateContributionStats(events) {
    const stats = {
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      totalReviews: 0,
      contributionStreak: 0,
      lastContributionDate: null
    };

    const contributionDates = new Set();

    events.forEach(event => {
      const eventDate = new Date(event.created_at).toDateString();
      contributionDates.add(eventDate);

      switch (event.type) {
        case 'PushEvent':
          stats.totalCommits += event.payload.commits?.length || 0;
          break;
        case 'PullRequestEvent':
          stats.totalPRs++;
          break;
        case 'IssuesEvent':
          stats.totalIssues++;
          break;
        case 'PullRequestReviewEvent':
          stats.totalReviews++;
          break;
      }
    });

    // Calculate streak (simplified - last 30 days)
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (contributionDates.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    stats.contributionStreak = streak;
    stats.lastContributionDate = events.length > 0 ? events[0].created_at : null;

    return stats;
  }

  // Fetch and process complete GitHub data for a user
  async fetchCompleteUserData(username) {
    try {


      // Fetch profile and repositories in parallel
      const [profile, repositories] = await Promise.all([
        this.fetchUserProfile(username),
        this.fetchUserRepositories(username)
      ]);

      // Fetch recent contributions
      const events = await this.fetchUserContributions(username);

      // Calculate statistics
      const languageStats = this.calculateLanguageStats(repositories);
      const contributionStats = this.calculateContributionStats(events);

      // Calculate total stars and forks
      const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

      return {
        profile,
        repositories,
        events,
        stats: {
          publicRepos: profile.public_repos || 0,
          followers: profile.followers || 0,
          following: profile.following || 0,
          totalStars,
          totalForks,
          totalCommitsLastYear: contributionStats.totalCommits,
          topLanguages: languageStats,
          contributionStreak: contributionStats.contributionStreak,
          lastContributionDate: contributionStats.lastContributionDate
        }
      };
    } catch (error) {
      console.error('Error fetching complete GitHub data:', error);
      throw error;
    }
  }

  // Save GitHub data to Supabase
  async saveGitHubDataToSupabase(userId, username, githubData) {
    try {
      const { profile, repositories, stats } = githubData;

      // Upsert GitHub stats
      const { data, error } = await supabase
        .from('github_stats')
        .upsert({
          user_id: userId,
          github_username: username,
          public_repos: stats.publicRepos,
          followers: stats.followers,
          following: stats.following,
          total_stars: stats.totalStars,
          total_forks: stats.totalForks,
          total_commits_last_year: stats.totalCommitsLastYear,
          top_languages: stats.topLanguages,
          contribution_streak: stats.contributionStreak,
          last_contribution_date: stats.lastContributionDate ? new Date(stats.lastContributionDate).toISOString().split('T')[0] : null,
          profile_data: profile,
          repositories: repositories,
          last_fetched: new Date().toISOString()
        }, {
          onConflict: 'user_id,github_username'
        });

      if (error) {
        console.error('Error saving GitHub data to Supabase:', error);
        throw error;
      }

      // Update user profile with GitHub username if not set
      await supabase
        .from('profiles')
        .update({
          github_username: username,
          github_last_updated: new Date().toISOString()
        })
        .eq('id', userId);

      return data;
    } catch (error) {
      console.error('Error saving GitHub data:', error);
      throw error;
    }
  }

  // Get cached GitHub data from Supabase
  async getCachedGitHubData(userId) {
    try {
      const { data, error } = await supabase
        .from('github_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching cached GitHub data:', error);
      return null;
    }
  }

  // Check if GitHub data needs refresh (older than 1 hour)
  needsRefresh(lastFetched) {
    if (!lastFetched) return true;
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(lastFetched) < oneHourAgo;
  }

  // Get GitHub data with caching
  async getGitHubDataWithCache(userId, username, forceRefresh = false) {
    try {
      // Check cache first
      const cachedData = await this.getCachedGitHubData(userId);
      
      if (!forceRefresh && cachedData && !this.needsRefresh(cachedData.last_fetched)) {

        return cachedData;
      }

      // Fetch fresh data

      const githubData = await this.fetchCompleteUserData(username);
      
      // Save to cache
      await this.saveGitHubDataToSupabase(userId, username, githubData);
      
      // Return the saved data
      return await this.getCachedGitHubData(userId);
    } catch (error) {
      console.error('Error getting GitHub data with cache:', error);
      
      // Return cached data if available, even if stale
      const cachedData = await this.getCachedGitHubData(userId);
      if (cachedData) {

        return cachedData;
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();

// Helper function to get GitHub data for a user
export async function getGitHubData(userId, username, forceRefresh = false) {
  return await githubService.getGitHubDataWithCache(userId, username, forceRefresh);
}

// Helper function to refresh GitHub data for all users
export async function refreshAllGitHubData() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, github_username')
      .not('github_username', 'is', null);

    if (error) throw error;

    const results = [];
    for (const profile of profiles) {
      try {
        const result = await getGitHubData(profile.id, profile.github_username, true);
        results.push({ userId: profile.id, success: true, data: result });
      } catch (error) {
        results.push({ userId: profile.id, success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error refreshing all GitHub data:', error);
    throw error;
  }
}
