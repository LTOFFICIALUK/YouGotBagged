import { NextRequest, NextResponse } from 'next/server'
import { getAllAvailableTokens, getTokenCreators } from '@/lib/bags-api'
import { getFeeShareWallet } from '@/lib/fee-share-tracker'
import { calculateWaterfallClaims, WaterfallClaimResult, CreatorTokenEarning } from '@/lib/claimed-percentage-calculator'

interface TokenEarningsMap {
  [walletAddress: string]: {
    twitterUsername: string
    walletAddress: string
    tokens: {
      tokenAddress: string
      tokenSymbol: string
      calculatedEarnings: number
    }[]
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const walletAddress = searchParams.get('walletAddress')
  const tokenAddress = searchParams.get('tokenAddress')

  try {
    if (action === 'creator-waterfall' && walletAddress) {
      // Get waterfall analysis for a specific creator across all their tokens
      return await getCreatorWaterfallAnalysis(walletAddress)
    }
    
    if (action === 'token-waterfall' && tokenAddress) {
      // Get waterfall analysis for a specific token
      const tokenSymbol = searchParams.get('tokenSymbol') || 'Unknown'
      const totalFeesSOL = parseFloat(searchParams.get('totalFeesSOL') || '0')
      return await getTokenWaterfallAnalysis(tokenAddress, tokenSymbol, totalFeesSOL)
    }

    if (action === 'all-creators-waterfall') {
      // Get waterfall analysis for all creators
      return await getAllCreatorsWaterfallAnalysis()
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: creator-waterfall, token-waterfall, or all-creators-waterfall' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Waterfall claims API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate waterfall claims' },
      { status: 500 }
    )
  }
}

async function getCreatorWaterfallAnalysis(walletAddress: string) {
  console.log(`🌊 Getting waterfall analysis for wallet: ${walletAddress}`)
  
  // Find all tokens that this wallet is associated with
  const allTokens = await getAllAvailableTokens()
  const creatorTokens: { tokenAddress: string; tokenSymbol: string; calculatedEarnings: number }[] = []
  let twitterUsername = 'Unknown'

  // Check each token to see if this wallet is a creator
  for (const token of allTokens) {
    try {
      const creators = await getTokenCreators(token.contractAddress)
      
      for (const creator of creators) {
        if (creator.royaltyBps > 0) { // Only check creators with royalty
          const creatorWallet = await getFeeShareWallet(creator.twitterUsername)
          
          if (creatorWallet === walletAddress) {
            const calculatedEarnings = (token.lifetimeFees || 0) * (creator.royaltyBps / 10000)
            creatorTokens.push({
              tokenAddress: token.contractAddress,
              tokenSymbol: token.symbol,
              calculatedEarnings
            })
            twitterUsername = creator.twitterUsername
            console.log(`   Found token ${token.symbol}: ${calculatedEarnings.toFixed(4)} SOL`)
            break
          }
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.warn(`Failed to check token ${token.symbol}:`, error)
    }
  }

  if (creatorTokens.length === 0) {
    return NextResponse.json({
      walletAddress,
      twitterUsername: 'Unknown',
      totalCalculatedEarnings: 0,
      totalWithdrawn: 0,
      currentBalance: 0,
      tokens: []
    })
  }

  // Calculate waterfall claims
  const waterfallResult = await calculateWaterfallClaims(walletAddress, twitterUsername, creatorTokens)
  
  return NextResponse.json(waterfallResult)
}

async function getTokenWaterfallAnalysis(tokenAddress: string, tokenSymbol: string, totalFeesSOL: number) {
  console.log(`🌊 Getting waterfall analysis for token: ${tokenSymbol}`)
  
  // Get creators for this token
  const creators = await getTokenCreators(tokenAddress)
  const tokenResults: CreatorTokenEarning[] = []

  for (const creator of creators) {
    if (creator.royaltyBps > 0) {
      const walletAddress = await getFeeShareWallet(creator.twitterUsername)
      
      if (walletAddress) {
        const calculatedEarnings = totalFeesSOL * (creator.royaltyBps / 10000)
        
        // For this creator, find all their tokens to apply waterfall logic
        const allTokens = await getAllAvailableTokens()
        const creatorAllTokens: { tokenAddress: string; tokenSymbol: string; calculatedEarnings: number }[] = []
        
        // Add current token
        creatorAllTokens.push({
          tokenAddress,
          tokenSymbol,
          calculatedEarnings
        })
        
        // Find other tokens for this creator
        for (const otherToken of allTokens) {
          if (otherToken.contractAddress !== tokenAddress) {
            try {
              const otherCreators = await getTokenCreators(otherToken.contractAddress)
              const matchingCreator = otherCreators.find(c => c.twitterUsername === creator.twitterUsername && c.royaltyBps > 0)
              
              if (matchingCreator) {
                const otherWallet = await getFeeShareWallet(creator.twitterUsername)
                if (otherWallet === walletAddress) {
                  const otherEarnings = (otherToken.lifetimeFees || 0) * (matchingCreator.royaltyBps / 10000)
                  creatorAllTokens.push({
                    tokenAddress: otherToken.contractAddress,
                    tokenSymbol: otherToken.symbol,
                    calculatedEarnings: otherEarnings
                  })
                }
              }
            } catch (error) {
              console.warn(`Failed to check other token ${otherToken.symbol} for creator ${creator.twitterUsername}:`, error)
            }
          }
        }
        
        // Calculate waterfall for this creator
        const waterfallResult = await calculateWaterfallClaims(walletAddress, creator.twitterUsername, creatorAllTokens)
        
        // Find the result for our specific token
        const thisTokenResult = waterfallResult.tokens.find(t => t.tokenAddress === tokenAddress)
        if (thisTokenResult) {
          tokenResults.push(thisTokenResult)
        }
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return NextResponse.json({
    tokenAddress,
    tokenSymbol,
    totalFeesSOL,
    creators: tokenResults,
    totalCalculatedEarnings: tokenResults.reduce((sum, r) => sum + r.calculatedEarnings, 0),
    totalClaimedAmount: tokenResults.reduce((sum, r) => sum + r.claimedAmount, 0),
    overallClaimedPercentage: tokenResults.length > 0 
      ? (tokenResults.reduce((sum, r) => sum + r.claimedAmount, 0) / tokenResults.reduce((sum, r) => sum + r.calculatedEarnings, 0)) * 100
      : 0
  })
}

async function getAllCreatorsWaterfallAnalysis() {
  console.log(`🌊 Getting waterfall analysis for all creators`)
  
  const allTokens = await getAllAvailableTokens()
  const creatorMap: TokenEarningsMap = {}
  
  // Build map of all creators and their tokens
  for (const token of allTokens) {
    try {
      const creators = await getTokenCreators(token.contractAddress)
      
      for (const creator of creators) {
        if (creator.royaltyBps > 0) {
          const walletAddress = await getFeeShareWallet(creator.twitterUsername)
          
          if (walletAddress) {
            const calculatedEarnings = (token.lifetimeFees || 0) * (creator.royaltyBps / 10000)
            
            if (!creatorMap[walletAddress]) {
              creatorMap[walletAddress] = {
                twitterUsername: creator.twitterUsername,
                walletAddress,
                tokens: []
              }
            }
            
            creatorMap[walletAddress].tokens.push({
              tokenAddress: token.contractAddress,
              tokenSymbol: token.symbol,
              calculatedEarnings
            })
          }
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.warn(`Failed to process token ${token.symbol}:`, error)
    }
  }

  // Calculate waterfall for each creator
  const results: WaterfallClaimResult[] = []
  
  for (const [walletAddress, creatorData] of Object.entries(creatorMap)) {
    try {
      const waterfallResult = await calculateWaterfallClaims(
        walletAddress,
        creatorData.twitterUsername,
        creatorData.tokens
      )
      results.push(waterfallResult)
      
      // Delay between creators to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.warn(`Failed to calculate waterfall for ${creatorData.twitterUsername}:`, error)
    }
  }

  return NextResponse.json({
    totalCreators: results.length,
    creators: results,
    summary: {
      totalCalculatedEarnings: results.reduce((sum, r) => sum + r.totalCalculatedEarnings, 0),
      totalWithdrawn: results.reduce((sum, r) => sum + r.totalWithdrawn, 0),
      totalCurrentBalance: results.reduce((sum, r) => sum + r.currentBalance, 0)
    }
  })
}