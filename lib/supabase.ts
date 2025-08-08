import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Types for our tables
export interface WalletMapping {
  twitter_username: string
  wallet_address: string
  created_at: string
  last_checked: string
}

export interface LeaderboardEntry {
  id: string
  twitter_username: string
  twitter_id: string
  profile_image_url: string
  post_count: number
  total_score: number
  last_posted: string
  created_at: string
}

export interface UserSession {
  twitter_id: string
  twitter_username: string
  profile_image_url: string
  access_token: string
  refresh_token: string
  expires_at: number
}

// Helper functions for wallet mappings
export async function getStoredWallet(twitterUsername: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('wallet_mappings')
    .select('wallet_address')
    .eq('twitter_username', twitterUsername.toLowerCase())
    .single()

  if (error || !data) {
    return null
  }

  return data.wallet_address
}

export async function storeWalletMapping(twitterUsername: string, walletAddress: string) {
  const { error } = await supabase
    .from('wallet_mappings')
    .upsert({
      twitter_username: twitterUsername.toLowerCase(),
      wallet_address: walletAddress,
      last_checked: new Date().toISOString()
    }, {
      onConflict: 'twitter_username'
    })

  if (error) {
    console.error('Error storing wallet mapping:', error)
  }
}

// Helper functions for leaderboard
export async function addLeaderboardPost(twitterId: string, twitterUsername: string, profileImageUrl: string) {
  // First check if user exists
  const { data: existingUser } = await supabase
    .from('leaderboard')
    .select('post_count, total_score')
    .eq('twitter_id', twitterId)
    .single()

  if (existingUser) {
    // User exists, increment their stats
    const { error: updateError } = await supabase
      .from('leaderboard')
      .update({
        post_count: existingUser.post_count + 1,
        total_score: existingUser.total_score + 10,
        last_posted: new Date().toISOString()
      })
      .eq('twitter_id', twitterId)

    if (updateError) {
      console.error('Error updating leaderboard post:', updateError)
      throw updateError
    }
  } else {
    // New user, create entry
    const { error } = await supabase
      .from('leaderboard')
      .insert({
        twitter_id: twitterId,
        twitter_username: twitterUsername,
        profile_image_url: profileImageUrl,
        post_count: 1,
        total_score: 10, // Base score for each post
        last_posted: new Date().toISOString()
      })

    if (error) {
      console.error('Error adding leaderboard post:', error)
      throw error
    }
  }
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .order('post_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }

  return data || []
}

export async function getUserLeaderboardPosition(twitterId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('total_score')
    .eq('twitter_id', twitterId)
    .single()

  if (error || !data) {
    return null
  }

  const { count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .gt('total_score', data.total_score)

  return (count || 0) + 1
}

// Helper functions for user sessions
export async function storeUserSession(session: UserSession) {
  const { error } = await supabase
    .from('user_sessions')
    .upsert({
      twitter_id: session.twitter_id,
      twitter_username: session.twitter_username,
      profile_image_url: session.profile_image_url,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    }, {
      onConflict: 'twitter_id'
    })

  if (error) {
    console.error('Error storing user session:', error)
    throw error
  }
}

export async function getUserSession(twitterId: string): Promise<UserSession | null> {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('twitter_id', twitterId)
    .single()

  if (error || !data) {
    return null
  }

  return data as UserSession
}