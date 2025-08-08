# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# X (Twitter) OAuth Configuration
X_CLIENT_ID=your_x_oauth_client_id
X_CLIENT_SECRET=your_x_oauth_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://yougotbagged.fun
```

## How to Get X OAuth Credentials

### 1. Create a Twitter Developer App
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Create a new app or use an existing one

### 2. Configure OAuth Settings
1. In your app dashboard, go to "App Settings" > "User authentication settings"
2. Enable OAuth 2.0
3. Set the following:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URL**: `https://yougotbagged.fun/api/auth/x/callback`
   - **Website URL**: `https://yougotbagged.fun`
   - **Required scopes**: `users.read`

### 3. Get Your Credentials
1. Go to "Keys and tokens" tab
2. Copy the **OAuth 2.0 Client ID** → This is your `X_CLIENT_ID`
3. Copy the **OAuth 2.0 Client Secret** → This is your `X_CLIENT_SECRET`

## How to Get Supabase Credentials

### 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Wait for the project to be ready

### 2. Get Your Credentials
1. Go to "Settings" > "API"
2. Copy the **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Setup

After setting up your Supabase project, run the SQL from `docs/supabase-setup.sql` in your Supabase SQL editor.

## Testing the Setup

1. Deploy your application to production
2. Open `https://yougotbagged.fun`
3. Click "Connect X" button
4. You should see the OAuth window open in a new tab
5. Complete the authorization
6. You should be redirected back and see your profile

## Troubleshooting

### "client_id=undefined" Error
This means your `X_CLIENT_ID` environment variable is not set correctly. Check:
- Your `.env.local` file exists in the project root
- The variable name is exactly `X_CLIENT_ID`
- You've restarted your development server after adding the variable

### "OAuth configuration error"
This means one or more environment variables are missing. Check all required variables are set.

### Database Errors
Make sure you've run the SQL setup script in your Supabase project.

## Production Deployment

The application is configured for production at `https://yougotbagged.fun`. Make sure:
- Your Twitter app callback URL is set to `https://yougotbagged.fun/api/auth/x/callback`
- Your environment variables are properly configured in your production environment
- Your Supabase project is accessible from your production domain 