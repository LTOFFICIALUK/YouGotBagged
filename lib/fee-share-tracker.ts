// Types for fee share wallet tracking
export interface FeeShareWallet {
  twitterUsername: string
  walletAddress: string
  tokenAddress: string
  tokenSymbol: string
  royaltyBps: number
  royaltyPercentage: number
}

export interface TokenFeeShareData {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  feeShareWallets: FeeShareWallet[]
  totalWallets: number
}

// Bags API configuration
const BAGS_API_KEY = 'bags_prod_hpcZlGVqjTEOFwgq7sRue9ob19oOEGDP2GEFg2biBE4'
const BAGS_API_BASE_URL = 'https://public-api-v2.bags.fm/api/v1'

import { getStoredWallet, storeWalletMapping } from './supabase'

// Function to get fee share wallet for a Twitter username
export const getFeeShareWallet = async (twitterUsername: string): Promise<string | null> => {
  try {
    // First check our cache
    const cachedWallet = await getStoredWallet(twitterUsername)
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
      
      // Store in our cache
      await storeWalletMapping(twitterUsername, data.response)
      
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

// Function to get creator information for a token (reusing existing function)
export const getTokenCreators = async (tokenMint: string): Promise<any[]> => {
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

// Function to get all available tokens (reusing existing function)
export const getAllAvailableTokens = async (): Promise<any[]> => {
  try {
    console.log('Fetching all available tokens from Bags API...')
    
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
          marketCap: 0
        }))
      }
    }
    
    console.log('No tokens found from leaderboard API')
    return []
  } catch (error) {
    console.error('Failed to fetch available tokens:', error)
    return []
  }
}

// Main function to track fee share wallets for all tokens
export const trackFeeShareWallets = async (): Promise<TokenFeeShareData[]> => {
  try {
    console.log('Starting fee share wallet tracking...')
    
    // Get all available tokens
    const tokens = await getAllAvailableTokens()
    
    if (tokens.length === 0) {
      console.log('No tokens found to process')
      return []
    }
    
    console.log(`Processing ${tokens.length} tokens for fee share wallet tracking...`)
    
    const results: TokenFeeShareData[] = []
    
    // Process tokens in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tokens.length / batchSize)}`)
      
      const batchResults = await Promise.all(
        batch.map(async (token) => {
          try {
            console.log(`Processing token: ${token.symbol} (${token.address})`)
            
            // Get creators for this token
            const creators = await getTokenCreators(token.address)
            
            if (creators.length === 0) {
              console.log(`No creators found for ${token.symbol}`)
              return {
                tokenAddress: token.address,
                tokenSymbol: token.symbol,
                tokenName: token.name,
                feeShareWallets: [],
                totalWallets: 0
              }
            }
            
                         // Filter out creators with 0% royalty (they can't claim fees)
             const creatorsWithRoyalty = creators.filter(creator => creator.royaltyBps > 0)
             
             console.log(`Token ${token.symbol}: ${creators.length} total creators, ${creatorsWithRoyalty.length} with royalty`)
             
             // Get fee share wallets for each creator's Twitter username (only those with royalty > 0)
             const feeShareWallets: FeeShareWallet[] = []
             
             for (const creator of creatorsWithRoyalty) {
               if (creator.twitterUsername) {
                 const walletAddress = await getFeeShareWallet(creator.twitterUsername)
                 
                 if (walletAddress) {
                   feeShareWallets.push({
                     twitterUsername: creator.twitterUsername,
                     walletAddress,
                     tokenAddress: token.address,
                     tokenSymbol: token.symbol,
                     royaltyBps: creator.royaltyBps,
                     royaltyPercentage: creator.royaltyBps / 100
                   })
                 }
                 
                 // Add small delay to avoid rate limiting
                 await new Promise(resolve => setTimeout(resolve, 100))
               }
             }
            
            console.log(`Found ${feeShareWallets.length} fee share wallets for ${token.symbol}`)
            
            return {
              tokenAddress: token.address,
              tokenSymbol: token.symbol,
              tokenName: token.name,
              feeShareWallets,
              totalWallets: feeShareWallets.length
            }
            
          } catch (error) {
            console.error(`Error processing token ${token.symbol}:`, error)
            return {
              tokenAddress: token.address,
              tokenSymbol: token.symbol,
              tokenName: token.name,
              feeShareWallets: [],
              totalWallets: 0
            }
          }
        })
      )
      
      results.push(...batchResults)
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < tokens.length) {
        console.log('Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Filter results to only include tokens with fee share wallets
    const tokensWithWallets = results.filter(result => result.totalWallets > 0)
    
    console.log(`Fee share wallet tracking completed!`)
    console.log(`Total tokens processed: ${results.length}`)
    console.log(`Tokens with fee share wallets: ${tokensWithWallets.length}`)
    console.log(`Total fee share wallets found: ${tokensWithWallets.reduce((sum, token) => sum + token.totalWallets, 0)}`)
    
    return tokensWithWallets
    
  } catch (error) {
    console.error('Error in fee share wallet tracking:', error)
    return []
  }
}

// Function to get token info from Bags API
export const getTokenInfo = async (tokenAddress: string): Promise<{ name: string; symbol: string }> => {
  try {
    console.log(`Fetching token info for ${tokenAddress}...`)
    
    const response = await fetch(`https://api2.bags.fm/api/v1/bags/token/find?tokenAddress=${tokenAddress}`)
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.success && data.response && data.response.cryptoToken) {
        const token = data.response.cryptoToken
        return {
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN'
        }
      }
    }
    
    // Fallback
    return {
      name: `Token ${tokenAddress.slice(-4)}`,
      symbol: `TKN${tokenAddress.slice(-3)}`
    }
  } catch (error) {
    console.warn(`Failed to fetch token info for ${tokenAddress}:`, error)
    return {
      name: `Token ${tokenAddress.slice(-4)}`,
      symbol: `TKN${tokenAddress.slice(-3)}`
    }
  }
}

// Function to get fee share wallets for a specific token
export const getTokenFeeShareWallets = async (tokenAddress: string, tokenSymbol: string = '', tokenName: string = ''): Promise<TokenFeeShareData> => {
  try {
    console.log(`Getting fee share wallets for token: ${tokenAddress}`)
    
    // Get token info if not provided
    let actualTokenName = tokenName
    let actualTokenSymbol = tokenSymbol
    
    if (!tokenName || !tokenSymbol || tokenSymbol === 'TOKEN') {
      const tokenInfo = await getTokenInfo(tokenAddress)
      actualTokenName = tokenInfo.name
      actualTokenSymbol = tokenInfo.symbol
      console.log(`Token info found: ${actualTokenSymbol} (${actualTokenName})`)
    }
    
    // Get creators for this token
    const creators = await getTokenCreators(tokenAddress)
    
    if (creators.length === 0) {
      console.log(`No creators found for ${actualTokenSymbol}`)
      return {
        tokenAddress,
        tokenSymbol: actualTokenSymbol,
        tokenName: actualTokenName,
        feeShareWallets: [],
        totalWallets: 0
      }
    }
    
    // Filter out creators with 0% royalty (they can't claim fees)
    const creatorsWithRoyalty = creators.filter(creator => creator.royaltyBps > 0)
    const creatorsWithoutRoyalty = creators.filter(creator => creator.royaltyBps === 0)
    
    console.log(`Found ${creators.length} creator(s) for ${actualTokenSymbol}:`)
    console.log(`- ${creatorsWithRoyalty.length} with royalty:`, creatorsWithRoyalty.map(c => `@${c.twitterUsername} (${(c.royaltyBps / 100).toFixed(1)}%)`).filter(c => c.includes('@')))
    
    if (creatorsWithoutRoyalty.length > 0) {
      console.log(`- ${creatorsWithoutRoyalty.length} with 0% royalty (skipping):`, creatorsWithoutRoyalty.map(c => c.twitterUsername).filter(Boolean))
    }
    
    if (creatorsWithRoyalty.length === 0) {
      console.log(`No creators with royalty found for ${actualTokenSymbol}`)
      return {
        tokenAddress,
        tokenSymbol: actualTokenSymbol,
        tokenName: actualTokenName,
        feeShareWallets: [],
        totalWallets: 0
      }
    }
    
    // Get fee share wallets for each creator's Twitter username (only those with royalty > 0)
    const feeShareWallets: FeeShareWallet[] = []
    
    for (const creator of creatorsWithRoyalty) {
      if (creator.twitterUsername) {
        console.log(`🔍 Checking fee share wallet for @${creator.twitterUsername} (${(creator.royaltyBps / 100).toFixed(1)}% royalty)...`)
        const walletAddress = await getFeeShareWallet(creator.twitterUsername)
        
        if (walletAddress) {
          feeShareWallets.push({
            twitterUsername: creator.twitterUsername,
            walletAddress,
            tokenAddress,
            tokenSymbol: actualTokenSymbol,
            royaltyBps: creator.royaltyBps,
            royaltyPercentage: creator.royaltyBps / 100
          })
          console.log(`✅ Found wallet for @${creator.twitterUsername}: ${walletAddress} (${(creator.royaltyBps / 100).toFixed(1)}% royalty)`)
        } else {
          console.log(`❌ No fee share wallet found for @${creator.twitterUsername}`)
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`Found ${feeShareWallets.length} fee share wallets for ${actualTokenSymbol}`)
    
    return {
      tokenAddress,
      tokenSymbol: actualTokenSymbol,
      tokenName: actualTokenName,
      feeShareWallets,
      totalWallets: feeShareWallets.length
    }
    
  } catch (error) {
    console.error(`Error getting fee share wallets for ${tokenAddress}:`, error)
    return {
      tokenAddress,
      tokenSymbol: tokenSymbol || 'UNKNOWN',
      tokenName: tokenName || 'Unknown Token',
      feeShareWallets: [],
      totalWallets: 0
    }
  }
}

// Utility function to display results in a formatted way (browser-safe)
export const displayResults = (results: TokenFeeShareData[]) => {
  console.log('\n=== FEE SHARE WALLET TRACKING RESULTS ===\n')
  
  results.forEach((token, index) => {
    console.log(`${index + 1}. ${token.tokenSymbol} (${token.tokenName})`)
    console.log(`   Token Address: ${token.tokenAddress}`)
    console.log(`   Fee Share Wallets: ${token.totalWallets}`)
    
    token.feeShareWallets.forEach((wallet, walletIndex) => {
      console.log(`   ${walletIndex + 1}. @${wallet.twitterUsername} -> ${wallet.walletAddress}`)
    })
    
    console.log('')
  })
  
  const totalWallets = results.reduce((sum, token) => sum + token.totalWallets, 0)
  console.log(`Total tokens with fee share wallets: ${results.length}`)
  console.log(`Total fee share wallets found: ${totalWallets}`)
} 