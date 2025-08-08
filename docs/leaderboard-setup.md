# Leaderboard Setup Guide

## Overview
This guide explains how to set up the leaderboard functionality with X (Twitter) OAuth integration.

## Database Setup

### Required Tables

You need to create the following tables in your Supabase database:

#### 1. leaderboard table
```sql
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twitter_id TEXT UNIQUE NOT NULL,
  twitter_username TEXT NOT NULL,
  profile_image_url TEXT,
  post_count INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 10,
  last_posted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_leaderboard_total_score ON leaderboard(total_score DESC);
CREATE INDEX idx_leaderboard_post_count ON leaderboard(post_count DESC);
CREATE INDEX idx_leaderboard_twitter_id ON leaderboard(twitter_id);
```

#### 2. user_sessions table
```sql
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twitter_id TEXT UNIQUE NOT NULL,
  twitter_username TEXT NOT NULL,
  profile_image_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for twitter_id lookups
CREATE INDEX idx_user_sessions_twitter_id ON user_sessions(twitter_id);
```

#### 3. Create increment function (if not exists)
```sql
CREATE OR REPLACE FUNCTION increment(row_name text, value int)
RETURNS int AS $$
BEGIN
  RETURN value + 1;
END;
$$ LANGUAGE plpgsql;
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# X (Twitter) OAuth Configuration
X_CLIENT_ID=your_x_client_id_here
X_CLIENT_SECRET=your_x_client_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://yougotbagged.fun
```

## X (Twitter) OAuth Setup

### 1. Create a Twitter App
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. Navigate to "App Settings" > "User authentication settings"
4. Enable OAuth 2.0
5. Set the following:
   - App permissions: Read
   - Type of App: Web App
   - Callback URL: `https://yougotbagged.fun/api/auth/x/callback`
   - Website URL: `https://yougotbagged.fun`
   - Required scopes: `users.read`

### 2. Get OAuth Credentials
1. Go to "Keys and tokens" tab
2. Copy the "OAuth 2.0 Client ID" and "OAuth 2.0 Client Secret"
3. Add these to your environment variables

## Features

### Leaderboard Functionality
- Users can connect their X account via OAuth
- Users can post to the leaderboard (increments their score)
- Leaderboard displays top users by score and post count
- Real-time updates when users post

### OAuth Flow
1. User clicks "Connect X" button
2. OAuth popup opens with Twitter authorization
3. User authorizes the app
4. User is redirected back and session is stored
5. User can now post to leaderboard

### Posting to Leaderboard
1. User clicks "Post" button
2. System verifies user authentication
3. User's post count and score are incremented
4. Leaderboard is updated in real-time

## API Endpoints

### OAuth Endpoints
- `GET /api/auth/x?action=login` - Get OAuth URL
- `POST /api/auth/x` - Exchange code for token
- `GET /api/auth/x/callback` - OAuth callback handler

### Leaderboard Endpoints
- `GET /api/leaderboard?limit=10` - Get leaderboard data
- `POST /api/leaderboard` - Add post to leaderboard

## Components

### Header Component
- Displays "Connect X" button for unauthenticated users
- Shows user profile and "Post" button for authenticated users
- Handles OAuth flow and posting functionality

### Leaderboard Component
- Displays top users with rankings
- Shows user profile images, usernames, scores, and post counts
- Highlights current user if authenticated
- Responsive design with loading states

## Security Considerations

1. **Token Storage**: Access tokens are stored in the database with expiration times
2. **Session Validation**: All leaderboard posts require valid user sessions
3. **Rate Limiting**: Consider implementing rate limiting for posting
4. **Input Validation**: All user inputs are validated before processing

## Troubleshooting

### Common Issues

1. **OAuth Error**: Check that your callback URL matches exactly
2. **Database Errors**: Ensure all tables are created with correct schemas
3. **Environment Variables**: Verify all required env vars are set
4. **CORS Issues**: Make sure your app URL is correctly configured

### Debug Mode
Enable debug logging by adding `DEBUG=true` to your environment variables.

## Future Enhancements

- Add social sharing functionality
- Implement achievements/badges
- Add weekly/monthly leaderboards
- Create user profiles with detailed stats
- Add notifications for new posts 