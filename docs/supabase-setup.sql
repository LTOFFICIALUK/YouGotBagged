-- Leaderboard table
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

-- User sessions table for OAuth tokens
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

-- Create indexes for better performance
CREATE INDEX idx_leaderboard_total_score ON leaderboard(total_score DESC);
CREATE INDEX idx_leaderboard_post_count ON leaderboard(post_count DESC);
CREATE INDEX idx_leaderboard_twitter_id ON leaderboard(twitter_id);
CREATE INDEX idx_user_sessions_twitter_id ON user_sessions(twitter_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to user_sessions table
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard (public read, authenticated write)
CREATE POLICY "Leaderboard public read" ON leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Leaderboard authenticated insert" ON leaderboard
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Leaderboard authenticated update" ON leaderboard
    FOR UPDATE USING (true);

-- Create policies for user_sessions (authenticated access only)
CREATE POLICY "User sessions authenticated access" ON user_sessions
    FOR ALL USING (true); 