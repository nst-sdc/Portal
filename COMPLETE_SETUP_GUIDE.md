# 🚀 Complete Setup Guide for NST Dev Club Portal

This comprehensive guide will help you set up the complete NST Dev Club Portal with Supabase database, GitHub integration, and all features.

## 📋 Prerequisites

1. ✅ A Supabase account (sign up at https://supabase.com)
2. ✅ A new Supabase project created
3. ✅ A GitHub account for OAuth and API integration
4. ✅ Node.js and npm/yarn installed

## 🗄️ Step 1: Database Setup

### 1.1 Create the Complete Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `quick-setup.sql` into the editor
4. Click **"Run"** to execute the SQL

This will create:
- ✅ **10 tables**: profiles, github_stats, projects, project_members, meetings, attendance, contributions, rewards, notifications, meeting_invites
- ✅ **Indexes** for optimal performance
- ✅ **Row Level Security (RLS)** policies
- ✅ **Triggers** for automatic updates
- ✅ **Functions** for business logic
- ✅ **Realtime subscriptions** enabled

### 1.2 Verify Database Creation

Check that all tables were created successfully:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 10 tables listed.

## 🔐 Step 2: Authentication Setup

### 2.1 Configure GitHub OAuth

1. **In GitHub:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: `NST Dev Club Portal`
     - Homepage URL: `http://localhost:3000` (for development)
     - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Click "Register application"
   - Copy the **Client ID** and **Client Secret**

2. **In Supabase:**
   - Go to Authentication > Providers
   - Enable GitHub provider
   - Paste the Client ID and Client Secret
   - Save the configuration

### 2.2 Configure Email Authentication (Optional)

1. In Supabase, go to Authentication > Settings
2. Configure email templates if needed
3. Set up SMTP settings for production

## 🐙 Step 3: GitHub API Integration

### 3.1 Create GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `public_repo` (for public repository access)
   - `read:user` (for user profile information)
   - `read:org` (if you want organization data)
4. Copy the generated token

### 3.2 Configure Environment Variables

Create/update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# GitHub API Configuration
GITHUB_TOKEN=your-github-personal-access-token
NEXT_PUBLIC_GITHUB_TOKEN=your-github-personal-access-token

# Optional: Google Calendar Integration (for future)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## ⚙️ Step 4: Application Configuration

### 4.1 Install Dependencies

```bash
npm install
# or
yarn install
```

### 4.2 Start the Development Server

```bash
npm run dev
# or
yarn dev
```

### 4.3 Test Basic Functionality

1. **Authentication Test:**
   - Go to `http://localhost:3000`
   - Click "Sign In"
   - Try GitHub OAuth login
   - Verify profile creation in Supabase

2. **Database Test:**
   - Check if user profile was created in `profiles` table
   - Verify GitHub username is populated

## 🎯 Step 5: Initial Data Setup

### 5.1 Create Admin User

1. Sign up/sign in with your account
2. In Supabase, go to Table Editor > profiles
3. Find your user record and update:
   - `is_admin` = `true`
   - `role` = `'admin'`

### 5.2 Test GitHub Data Sync

1. Make sure your profile has a GitHub username
2. Go to the dashboard
3. Click "Refresh Data" to sync GitHub stats
4. Check the `github_stats` table for populated data

## ✅ Step 6: Feature Testing

### 6.1 Students Management
- ✅ View students list with real data
- ✅ Search and filter functionality
- ✅ GitHub stats integration
- ✅ Reward points calculation

### 6.2 Projects Management
- ✅ Create new projects
- ✅ Join/leave projects
- ✅ View project details
- ✅ Track contributions

### 6.3 Meetings Management
- ✅ Schedule meetings
- ✅ Send invitations
- ✅ Mark attendance
- ✅ Generate attendance codes

### 6.4 Dashboard
- ✅ Real-time statistics
- ✅ User activity tracking
- ✅ GitHub integration
- ✅ Upcoming meetings

## 🚀 Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, update:
- GitHub OAuth callback URL
- Supabase URL (if using production instance)
- Remove development-only settings

### 7.2 Database Migrations

If you make schema changes:
1. Test in development first
2. Create migration scripts
3. Apply to production database

## 🔧 Troubleshooting

### Common Issues

1. **Authentication not working:**
   - Check GitHub OAuth callback URL
   - Verify Supabase auth settings
   - Check browser console for errors

2. **GitHub data not syncing:**
   - Verify GitHub token has correct permissions
   - Check API rate limits
   - Review server logs

3. **Database permission errors:**
   - Check RLS policies
   - Verify user authentication
   - Review table permissions

4. **Real-time features not working:**
   - Check if realtime is enabled for tables
   - Verify subscription setup
   - Check network connectivity

### Debug Commands

```sql
-- Check user profiles
SELECT * FROM profiles WHERE email = 'your-email@example.com';

-- Check GitHub stats
SELECT * FROM github_stats WHERE user_id = 'your-user-id';

-- Check recent activity
SELECT * FROM rewards WHERE user_id = 'your-user-id' ORDER BY created_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## 🎉 Congratulations!

The NST Dev Club Portal is now ready for use! 🚀

### What You've Built:

1. **Complete Database Schema** - 10 tables with relationships
2. **GitHub Integration** - Real-time stats and contribution tracking
3. **Authentication System** - GitHub OAuth + email
4. **Student Management** - Profiles, stats, leaderboards
5. **Project Management** - Create, join, track progress
6. **Meeting System** - Schedule, invite, attendance tracking
7. **Reward System** - Points for contributions and attendance
8. **Real-time Dashboard** - Live stats and activity feeds

### Next Steps:

1. Customize branding and colors
2. Add Google Calendar integration
3. Set up email notifications
4. Add more GitHub integrations
5. Implement advanced analytics

Enjoy your new Dev Club Portal! 🎊
