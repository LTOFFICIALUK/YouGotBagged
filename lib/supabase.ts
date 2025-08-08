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

