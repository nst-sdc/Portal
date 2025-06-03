# NST Dev Club Portal

A modern web application for managing NST Dev Club members, projects, meetings, and activities. Built with Next.js 15 and Supabase.

## Features

- 🔐 **Authentication**: OAuth integration with GitHub, Google, and LinkedIn via Supabase Auth
- 📊 **Dashboard**: Comprehensive overview of club activities and personal progress
- 👥 **Member Management**: View and manage club member profiles
- 🚀 **Project Tracking**: Create, manage, and track development projects
- 📅 **Meeting Management**: Schedule and track meeting attendance
- 🏆 **Reward System**: Point-based system for tracking contributions
- 🌙 **Dark Mode**: Full dark/light theme support
- 📱 **Responsive Design**: Mobile-first responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: React Icons (Feather Icons)
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: Zustand
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nst-dev-club-portal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
   - This will create the necessary tables for user profiles and management

5. Configure OAuth providers in Supabase:
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable GitHub, Google, and LinkedIn providers
   - Configure each provider with your OAuth app credentials

6. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Setup

### Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `supabase-schema.sql` in the SQL editor

### OAuth Provider Setup in Supabase

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable the providers you want to use:

#### GitHub
1. Create a GitHub OAuth App in GitHub Settings > Developer settings > OAuth Apps
2. Set Authorization callback URL to: `https://your-project.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret to Supabase GitHub provider settings

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set Authorized redirect URI to: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase Google provider settings

#### LinkedIn
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app and add "Sign In with LinkedIn" product
3. Set Authorized redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase LinkedIn provider settings

## Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── auth/              # Authentication pages and callback
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Project management pages
│   ├── students/          # Member management pages
│   ├── meetings/          # Meeting management pages
│   └── layout.js          # Root layout with AuthProvider
├── components/            # Reusable React components
│   └── Navigation.js      # Main navigation component
├── contexts/              # React contexts
│   └── AuthContext.js     # Supabase auth context
└── lib/                   # Utility libraries
    └── supabase.js        # Supabase client configuration
```

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `auth.users` - Built-in Supabase auth users table
- `public.profiles` - Extended user profiles and metadata

See `supabase-schema.sql` for the complete schema.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
