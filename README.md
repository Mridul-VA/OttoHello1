# OttoHello - Visitor Management System

A modern, secure visitor management system built with React, TypeScript, Supabase, and Slack integration.

## Features

- 🎯 **Digital Check-in/Check-out**: Streamlined visitor registration process
- 📸 **Photo Capture**: Secure biometric data collection with camera integration
- 💬 **Slack Integration**: Automatic notifications to employees when visitors arrive
- ⏰ **Late Check-in**: Special handling for employee late arrivals
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 🔒 **Secure**: Built with Supabase for reliable data storage and security
- 📱 **Mobile-friendly**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **Integrations**: Slack API for notifications
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Tours**: React Joyride

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ottohello-visitor-management
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Slack Integration (Optional - for production)
VITE_SLACK_BOT_TOKEN=your_slack_bot_token
VITE_SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 3. Database Setup

The application includes migration files in `supabase/migrations/`. These will create:

- `visitors` table for check-in/check-out records
- `late_checkins` table for employee late arrivals
- Proper indexes and RLS policies

If using Supabase CLI:
```bash
supabase db reset
```

Or manually run the SQL files in your Supabase dashboard.

### 4. Run Development Server

```bash
npm run dev
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

### 2. Run Migrations

Execute the SQL files in `supabase/migrations/` in your Supabase SQL editor:

1. `001_create_visitors_table.sql`
2. `002_create_late_checkins_table.sql`

### 3. Configure RLS (Row Level Security)

The migrations automatically set up RLS policies for public access, which is appropriate for a visitor management system.

## Slack Integration Setup

### Option 1: Slack Bot (Recommended)

1. Create a Slack app at [api.slack.com](https://api.slack.com/apps)
2. Add the following OAuth scopes:
   - `users:read` - to fetch user list
   - `chat:write` - to send messages
3. Install the app to your workspace
4. Copy the Bot User OAuth Token to `VITE_SLACK_BOT_TOKEN`

### Option 2: Webhook (Simple notifications)

1. Create an Incoming Webhook in your Slack workspace
2. Copy the webhook URL to `VITE_SLACK_WEBHOOK_URL`

### Development Mode

Without Slack configuration, the app will use mock data and log notifications to the console.

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

## Usage

### Visitor Check-in Flow

1. **Welcome Screen**: Choose "Check-In"
2. **Photo Capture**: Take visitor's photo (required)
3. **Form Completion**: 
   - Full name
   - Phone number (optional)
   - Purpose of visit
   - Person to meet (with Slack autocomplete)
4. **Confirmation**: Success screen with timestamp

### Visitor Check-out Flow

1. **Welcome Screen**: Choose "Check-Out"
2. **Search**: Find visitor by name or phone
3. **Confirm**: Complete check-out process
4. **Confirmation**: Success screen

### Late Check-in (Employees)

1. **Welcome Screen**: Choose "Late Check-In"
2. **Form**: Name and reason for lateness
3. **Record**: Logged for HR purposes

## Security Features

- **Photo Verification**: Required photo capture for all visitors
- **Data Encryption**: All data stored securely in Supabase
- **RLS Policies**: Row-level security for data access
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error handling and user feedback

## Customization

### Branding

Update the following files to customize branding:
- `index.html` - Page title and meta
- `src/components/WelcomeScreen.tsx` - Company name and logo
- `tailwind.config.js` - Color scheme

### Slack Users

For development, update the mock users in `src/utils/slackUtils.ts`

### Visit Reasons

Modify `src/types/visitor.ts` to add/remove visit purposes

## Troubleshooting

### Camera Issues

- Ensure HTTPS in production (required for camera access)
- Check browser permissions
- Test on different devices/browsers

### Slack Integration

- Verify bot token has correct scopes
- Check network connectivity
- Review Slack app permissions

### Database Issues

- Verify Supabase connection
- Check RLS policies
- Review migration execution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase and Slack documentation
3. Open an issue on GitHub

---

Built with ❤️ for modern visitor management