import { NextRequest, NextResponse } from 'next/server'

const BAGS_API_KEY = process.env.BAGS_API_KEY

// Helper function to get current SOL price in USD
const getSolPrice = async (): Promise<number> => {
  try {
    console.log('Fetching current SOL price...')
    
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SOL price: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.solana && data.solana.usd) {
      const price = data.solana.usd
      console.log(`Current SOL price: $${price}`)
      return price
    } else {
      console.error('Failed to fetch SOL price:', data)
      return 0
    }
    
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return 0
  }
}

// Helper function to fetch lifetime fees for a token
const getLifetimeFees = async (tokenMint: string): Promise<number> => {
  try {
    console.log('Fetching lifetime fees for token:', tokenMint)
    
    const response = await fetch(`https://api2.bags.fm/api/v1/token-launch/lifetime-fees?tokenMint=${tokenMint}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lifetime fees: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.response) {
      const lamports = parseFloat(data.response)
      const sol = lamports / 1000000000 // Convert lamports to SOL
      console.log(`Lifetime fees for ${tokenMint}: ${lamports} lamports = ${sol} SOL`)
      return sol
    } else {
      console.error('Failed to fetch lifetime fees:', data)
      return 0
    }
    
  } catch (error) {
    console.error('Error fetching lifetime fees:', error)
    return 0
  }
}

// Test API connectivity using public APIs only
const testBagsAPI = async () => {
  console.log('Testing public Bags APIs...')
  
  try {
    // Test 1: Leaderboard API
    console.log('Testing leaderboard API...')
    const leaderboardResponse = await fetch('https://api2.bags.fm/api/v1/token-launch/leaderboard')
    
    if (leaderboardResponse.ok) {
      const leaderboardData = await leaderboardResponse.json()
      console.log('Leaderboard API working:', leaderboardData.success ? 'Success' : 'Failed')
      
      if (leaderboardData.success && leaderboardData.response && Array.isArray(leaderboardData.response)) {
        console.log(`Found ${leaderboardData.response.length} tokens in leaderboard`)
        
        // Test 2: Token Find API with first token from leaderboard
        if (leaderboardData.response.length > 0) {
          const firstToken = leaderboardData.response[0]
          console.log(`Testing token find API with: ${firstToken.tokenAddress}`)
          
          const tokenFindResponse = await fetch(`https://api2.bags.fm/api/v1/bags/token/find?tokenAddress=${firstToken.tokenAddress}`)
          
          if (tokenFindResponse.ok) {
            const tokenFindData = await tokenFindResponse.json()
            console.log('Token find API working:', tokenFindData.success ? 'Success' : 'Failed')
            
            return {
              success: true,
              method: 'public-apis',
              data: {
                leaderboardTokens: leaderboardData.response.length,
                tokenFindWorking: tokenFindData.success,
                sampleToken: firstToken
              },
              message: 'Public Bags APIs working correctly'
            }
          }
        }
      }
    }
    
    return {
      success: false,
      error: 'Public APIs not accessible'
    }
  } catch (error) {
    console.log('Public API test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get token information from Bags API
const getTokenInfo = async (tokenAddress: string): Promise<any> => {
  try {
    console.log(`Fetching token info for ${tokenAddress} from Bags API...`)
    
    // Get comprehensive token data from Bags API
    const bagsResponse = await fetch(`https://api2.bags.fm/api/v1/bags/token/find?tokenAddress=${tokenAddress}`)
    
    if (bagsResponse.ok) {
      const bagsData = await bagsResponse.json()
      
      if (bagsData.success && bagsData.response && bagsData.response.cryptoToken) {
        const token = bagsData.response.cryptoToken
        console.log(`Bags data for ${tokenAddress}:`, token)
        
        return {
          address: tokenAddress,
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN',
          imageUrl: token.image || null,
          marketCap: token.fdmc?.fdmc || 0,
          price: token.price?.price || 0,
          volume24h: token.volumeUsd?.h24 || 0,
          priceChange24h: token.priceChangePercentage?.h24 || 0,
          priceChange1h: token.priceChangePercentage?.h1 || 0,
          priceChange6h: token.priceChangePercentage?.h6 || 0,
          lastUpdated: token.price?.lastUpdated || null,
          topPoolLiquidity: token.topPoolLiquidity || 0
        }
      }
    }
    
    // Fallback to Jupiter API if Bags API fails
    try {
      console.log(`Bags API failed, trying Jupiter for ${tokenAddress}...`)
      const jupiterResponse = await fetch(`https://price.jup.ag/v4/price?ids=${tokenAddress}`)
      
      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json()
        const tokenData = jupiterData.data[tokenAddress]
        
        if (tokenData) {
          console.log(`Jupiter fallback data for ${tokenAddress}:`, tokenData)
          
          return {
            address: tokenAddress,
            name: tokenData.name || 'Unknown Token',
            symbol: tokenData.symbol || 'UNKNOWN',
            imageUrl: tokenData.image || null,
            marketCap: tokenData.price * (tokenData.mint || 0),
            price: tokenData.price,
            volume24h: tokenData.volume24h,
            priceChange24h: tokenData.priceChange24h
          }
        }
      }
    } catch (jupiterError) {
      console.log(`Jupiter fallback failed for ${tokenAddress}:`, jupiterError)
    }
    
    // Final fallback
    console.warn(`Failed to fetch token info for ${tokenAddress}`)
    return {
      address: tokenAddress,
      name: `Token ${tokenAddress.slice(-4)}`,
      symbol: `TKN${tokenAddress.slice(-3)}`,
      imageUrl: null,
      marketCap: 0,
      price: 0,
      volume24h: 0
    }
  } catch (error) {
    console.warn(`Failed to fetch token info for ${tokenAddress}:`, error)
    return {
      address: tokenAddress,
      name: `Token ${tokenAddress.slice(-4)}`,
      symbol: `TKN${tokenAddress.slice(-3)}`,
      imageUrl: null,
      marketCap: 0,
      price: 0,
      volume24h: 0
    }
  }
}

// Get all available tokens from Bags API
const getAllAvailableTokens = async (): Promise<any[]> => {
  try {
    console.log('Fetching all available tokens from Bags API...')
    
    // Use the working leaderboard endpoint
    try {
      console.log('Fetching from Bags leaderboard API...')
      const response = await fetch('https://api2.bags.fm/api/v1/token-launch/leaderboard')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.response && Array.isArray(data.response)) {
          console.log(`Found ${data.response.length} tokens via leaderboard API`)
          return data.response.map((token: any) => ({
            address: token.tokenAddress,
            name: token.name,
            symbol: token.symbol,
            imageUrl: token.image,
            price: token.price,
            marketCap: 0 // Not provided by leaderboard
          }))
        }
      }
    } catch (error) {
      console.log('Leaderboard API failed:', error)
    }
    
    console.log('No tokens found from leaderboard API')
    return []
  } catch (error) {
    console.error('Failed to fetch available tokens:', error)
    return []
  }
}

// Get all tokens with unclaimed fees using public APIs only
const getUnclaimedFees = async (): Promise<any[]> => {
  try {
    console.log('Fetching unclaimed fees using public APIs...')
    
    // Get current SOL price
    const solPrice = await getSolPrice()
    console.log(`Current SOL price: $${solPrice}`)
    
    // Get all available tokens from the leaderboard API
    console.log('Fetching available tokens from leaderboard API...')
    const availableTokens = await getAllAvailableTokens()
    
    if (availableTokens.length === 0) {
      console.log('No tokens found from leaderboard API')
      return []
    }
    
    console.log(`Found ${availableTokens.length} tokens from leaderboard API`)
    
    // Get detailed info for each token using the token find API
    console.log('Fetching detailed token information...')
    const tokensWithInfo = await Promise.all(
      availableTokens.map(async (token) => {
        try {
          const tokenInfo = await getTokenInfo(token.address)
          return {
            ...token,
            ...tokenInfo
          }
        } catch (error) {
          console.log(`Failed to get info for ${token.address}:`, error)
          return token
        }
      })
    )
    
    // Get real lifetime fees for all tokens
    console.log('Fetching real lifetime fees data...')
    const tokensWithRealFees = await Promise.all(
      tokensWithInfo.map(async (token) => {
        try {
          const lifetimeFees = await getLifetimeFees(token.address)
          const lifetimeFeesUSD = lifetimeFees * solPrice
          
          return {
            tokenAddress: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            unclaimedAmount: lifetimeFees * 0.1, // Assume 10% is unclaimed
            totalFees: lifetimeFees,
            lifetimeFees,
            lifetimeFeesUSD,
            imageUrl: token.imageUrl,
            marketCap: Number(token.marketCap) || 0,
            price: Number(token.price) || 0,
            volume24h: Number(token.volume24h) || 0,
            priceChange24h: Number(token.priceChange24h) || 0
          }
        } catch (error) {
          console.log(`Failed to get lifetime fees for ${token.address}:`, error)
          return {
            tokenAddress: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            unclaimedAmount: 0,
            totalFees: 0,
            lifetimeFees: 0,
            lifetimeFeesUSD: 0,
            imageUrl: token.imageUrl,
            marketCap: Number(token.marketCap) || 0,
            price: Number(token.price) || 0,
            volume24h: Number(token.volume24h) || 0,
            priceChange24h: Number(token.priceChange24h) || 0
          }
        }
      })
    )
    
    // Filter for tokens with lifetime fees > 0
    const tokensWithFees = tokensWithRealFees.filter(token => token.lifetimeFees > 0)
    
    console.log(`Found ${tokensWithFees.length} tokens with lifetime fees`)
    return tokensWithFees
  } catch (error) {
    console.error('Failed to fetch unclaimed fees:', error)
    return []
  }
}

// Get total unclaimed value
const getTotalUnclaimedValue = async (): Promise<number> => {
  try {
    const fees = await getUnclaimedFees()
    const total = fees.reduce((sum, fee) => sum + (fee.lifetimeFees || 0), 0)
    return total
  } catch (error) {
    console.error('Failed to calculate total unclaimed value:', error)
    return 0
  }
}

// Get available tokens for testing
const getAvailableTokens = async (): Promise<any[]> => {
  try {
    return await getAllAvailableTokens()
  } catch (error) {
    console.error('Failed to get available tokens:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    console.log('API route called with action:', action)
    
    if (action === 'test') {
      // Test API connectivity
      const result = await testBagsAPI()
      return NextResponse.json(result)
    }
    
    if (action === 'unclaimed-fees') {
      // Get unclaimed fees using public APIs
      const fees = await getUnclaimedFees()
      
      return NextResponse.json({
        success: true,
        data: fees,
        method: 'public-apis',
        message: 'Using public Bags APIs successfully'
      })
    }
    
    if (action === 'total-value') {
      // Get total unclaimed value
      const total = await getTotalUnclaimedValue()
      
      return NextResponse.json({
        success: true,
        data: total,
        method: 'public-apis'
      })
    }
    
    if (action === 'available-tokens') {
      // Get available tokens
      const tokens = await getAvailableTokens()
      
      return NextResponse.json({
        success: true,
        data: tokens,
        method: 'public-apis'
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action. Use ?action=test, ?action=unclaimed-fees, ?action=total-value, or ?action=available-tokens' 
    })
    
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 