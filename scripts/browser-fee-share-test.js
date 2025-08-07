// Browser-compatible fee share wallet tracking test with Supabase caching
// Run this in the browser console on your app

// Bags API configuration
const BAGS_API_KEY = 'bags_prod_hpcZlGVqjTEOFwgq7sRue9ob19oOEGDP2GEFg2biBE4'
const BAGS_API_BASE_URL = 'https://public-api-v2.bags.fm/api/v1'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Function to get cached wallet from database
const getCachedWallet = async (twitterUsername) => {
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

// Function to cache wallet mapping
const cacheWalletMapping = async (twitterUsername, walletAddress) => {
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
    console.error('Error caching wallet mapping:', error)
  }
}

// Function to get fee share wallet for a Twitter username
const getFeeShareWallet = async (twitterUsername) => {
  try {
    // First check our cache
    const cachedWallet = await getCachedWallet(twitterUsername)
    if (cachedWallet) {
      console.log(`Using cached wallet for @${twitterUsername}: ${cachedWallet}`)
      return cachedWallet
    }

    console.log(`Fetching fee share wallet for @${twitterUsername}...`)
    
    const response = await fetch(
      `${BAGS_API_BASE_URL}/token-launch/fee-share/wallet/twitter?twitterUsername=${twitterUsername}`,
      {
        headers: {
          'x-api-key': BAGS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      console.error(`Failed to fetch fee share wallet for @${twitterUsername}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.success && data.response) {
      console.log(`Found fee share wallet for @${twitterUsername}: ${data.response}`)
      
      // Cache the result
      await cacheWalletMapping(twitterUsername, data.response)
      
      return data.response
    } else {
      console.error(`No fee share wallet found for @${twitterUsername}:`, data)
      return null
    }
    
  } catch (error) {
    console.error(`Error fetching fee share wallet for @${twitterUsername}:`, error)
    return null
  }
}

// Function to get creator information for a token
const getTokenCreators = async (tokenMint) => {
  try {
    console.log('Fetching creator information for token:', tokenMint)
    
    const response = await fetch(`https://api2.bags.fm/api/v1/token-launch/creator/v2?tokenMint=${tokenMint}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch creator data: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.response) {
      console.log('Creator data fetched successfully:', data.response)
      return data.response
    } else {
      console.error('Failed to fetch creator data:', data)
      return []
    }
    
  } catch (error) {
    console.error('Error fetching creator data:', error)
    return []
  }
}

// Function to get fee share wallets for a specific token
const getTokenFeeShareWallets = async (tokenAddress, tokenSymbol = '', tokenName = '') => {
  try {
    console.log(`Getting fee share wallets for token: ${tokenSymbol} (${tokenAddress})`)
    
    // Get creators for this token
    const creators = await getTokenCreators(tokenAddress)
    
    if (creators.length === 0) {
      console.log(`No creators found for ${tokenSymbol}`)
      return {
        tokenAddress,
        tokenSymbol,
        tokenName,
        feeShareWallets: [],
        totalWallets: 0
      }
    }
    
    // Separate creators with and without royalty
    const creatorsWithRoyalty = creators.filter(creator => creator.royaltyBps > 0)
    const creatorsWithoutRoyalty = creators.filter(creator => creator.royaltyBps === 0)
    
    console.log(`Found ${creators.length} creator(s) for ${tokenSymbol}:`)
    console.log(`- ${creatorsWithRoyalty.length} with royalty:`, creatorsWithRoyalty.map(c => `@${c.twitterUsername} (${(c.royaltyBps / 100).toFixed(1)}%)`))
    
    if (creatorsWithoutRoyalty.length > 0) {
      console.log(`- ${creatorsWithoutRoyalty.length} with 0% royalty (skipping):`, creatorsWithoutRoyalty.map(c => c.twitterUsername))
    }
    
    // Get fee share wallets for each creator's Twitter username (only those with royalty > 0)
    const feeShareWallets = []
    
    for (const creator of creatorsWithRoyalty) {
      if (creator.twitterUsername) {
        const walletAddress = await getFeeShareWallet(creator.twitterUsername)
        
        if (walletAddress) {
          feeShareWallets.push({
            twitterUsername: creator.twitterUsername,
            walletAddress,
            tokenAddress,
            tokenSymbol,
            royaltyBps: creator.royaltyBps,
            royaltyPercentage: creator.royaltyBps / 100
          })
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return {
      tokenAddress,
      tokenSymbol,
      tokenName,
      feeShareWallets,
      totalWallets: feeShareWallets.length
    }
    
  } catch (error) {
    console.error(`Error getting fee share wallets for ${tokenAddress}:`, error)
    return {
      tokenAddress,
      tokenSymbol,
      tokenName,
      feeShareWallets: [],
      totalWallets: 0
    }
  }
}

// Test function
const testFeeShareTracking = async (tokenAddress, tokenSymbol = '', tokenName = '') => {
  console.log('🔍 Testing fee share wallet tracking...')
  
  const result = await getTokenFeeShareWallets(tokenAddress, tokenSymbol, tokenName)
  
  console.log('\n=== RESULTS ===\n')
  console.log(`Token: ${result.tokenSymbol} (${result.tokenAddress})`)
  console.log(`Total fee share wallets found: ${result.totalWallets}`)
  
  if (result.totalWallets > 0) {
    console.log('\nFee Share Wallets:')
    result.feeShareWallets.forEach((wallet, index) => {
      console.log(`${index + 1}. @${wallet.twitterUsername}`)
      console.log(`   Wallet: ${wallet.walletAddress}`)
      console.log(`   Royalty: ${wallet.royaltyPercentage}%`)
    })
  }
  
  return result
}

// Export for use in browser console
window.testFeeShareTracking = testFeeShareTracking