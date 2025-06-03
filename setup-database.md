# Database Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard/project/agbejzwnzpvntpdmmwor
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

## Step 2: Run the Database Schema

Copy and paste the following SQL commands into the SQL editor and click "Run":

```sql
-- User profiles table (extends the default auth.users table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  batch TEXT,
  reward_points INTEGER DEFAULT 0,
  github_username TEXT,
  discord_username TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own profile and all users can read basic profile info
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for profiles table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
```

## Step 3: Configure OAuth Providers

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Enable the providers you want to use:

### GitHub
- Enable GitHub provider
- Add your GitHub OAuth app credentials
- Redirect URL: `https://agbejzwnzpvntpdmmwor.supabase.co/auth/v1/callback`

### Google  
- Enable Google provider
- Add your Google OAuth credentials
- Redirect URL: `https://agbejzwnzpvntpdmmwor.supabase.co/auth/v1/callback`

### LinkedIn
- Enable LinkedIn provider  
- Add your LinkedIn OAuth credentials
- Redirect URL: `https://agbejzwnzpvntpdmmwor.supabase.co/auth/v1/callback`

## Step 4: Test the Application

Your application is now ready! You can:

1. Visit http://localhost:3000
2. Click "Sign In" 
3. Try OAuth authentication with any enabled provider
4. Or create an account with email/password

The database will automatically create user profiles when users sign up!
