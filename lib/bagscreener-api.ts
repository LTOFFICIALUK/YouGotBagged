export interface BagscreenerToken {
  token_address: string
  token_symbol: string
  token_name: string
  name: string
  symbol: string
  image_url?: string
  creator_username: string | null
  creator_twitter: string | null
  creator_wallet: string | null
  delegate_username: string | null
  delegate_twitter: string | null
  delegate_wallet: string | null
  revenue_split: string
  lifetime_fees_sol: string
  fees_claimed_sol: string | null
  market_cap_usd: string
  price_usd: string
}

export interface BagscreenerResponse {
  tokens: BagscreenerToken[]
  cached: boolean
  cacheAge: number
}

// Cache bagscreener data for 1 minute
let cachedData: BagscreenerResponse | null = null
let lastCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to fetch and cache all token data
async function getAllTokenData(): Promise<BagscreenerResponse | null> {
  const now = Date.now();
  if (cachedData && (now - lastCacheTime) < CACHE_DURATION) {
    console.log('Using cached Bagscreener data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh Bagscreener data');
    const data = await fetch('https://api.codetabs.com/v1/proxy?quest=https://www.bagscreener.app/api/tokens/cached').then(res => res.json());
    
    // Update cache
    cachedData = data;
    lastCacheTime = now;
    return data;
  } catch (error) {
    console.error('Error fetching Bagscreener data:', error);
    return null;
  }
}

export async function getAllTokens(): Promise<BagscreenerToken[]> {
  const data = await getAllTokenData();
  if (!data) return [];
  return data.tokens;
}

export async function getTokenClaimedFees(tokenAddress: string): Promise<{
  lifetimeFees: number
  claimedFees: number
  claimedPercentage: number
} | null> {
  try {
    const data = await getAllTokenData()
    if (!data) {
      throw new Error('Failed to fetch token data')
    }

    const token = data.tokens.find(t => t.token_address.toLowerCase() === tokenAddress.toLowerCase())
    if (!token) {
      console.log(`Token ${tokenAddress} not found in Bagscreener data`)
      return null
    }

    const lifetimeFees = parseFloat(token.lifetime_fees_sol || '0')
    const claimedFees = parseFloat(token.fees_claimed_sol || '0')
    
    // Calculate claimed percentage
    const claimedPercentage = lifetimeFees > 0 
      ? Math.min(100, (claimedFees / lifetimeFees) * 100)
      : 0

    console.log(`💰 Bagscreener data for ${token.token_symbol}:`)
    console.log(`   Lifetime fees: ${lifetimeFees.toFixed(4)} SOL`)
    console.log(`   Claimed fees: ${claimedFees.toFixed(4)} SOL`)
    console.log(`   Claimed percentage: ${claimedPercentage.toFixed(1)}%`)

    return {
      lifetimeFees,
      claimedFees,
      claimedPercentage
    }
  } catch (error) {
    console.error('Error fetching Bagscreener data:', error)
    return null
  }
}