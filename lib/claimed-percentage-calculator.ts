// Calculate claimed percentage for tokens using waterfall logic
import { getTokenFeeShareWallets } from './fee-share-tracker'
import { analyzeWalletWithdrawals } from './sol-transaction-analyzer'

export interface TokenClaimedData {
  tokenAddress: string
  tokenSymbol: string
  totalFeesSOL: number
  totalCalculatedEarnings: number
  totalWithdrawals: number
  claimedPercentage: number
  remainingSOL: number
  isCalculating: boolean
  error?: string
}

export interface CreatorTokenEarning {
  tokenAddress: string
  tokenSymbol: string
  walletAddress: string
  twitterUsername: string
  calculatedEarnings: number
  claimedAmount: number
  claimedPercentage: number
}

export interface WaterfallClaimResult {
  walletAddress: string
  twitterUsername: string
  totalCalculatedEarnings: number
  totalWithdrawn: number
  currentBalance: number
  tokens: CreatorTokenEarning[]
}

// Waterfall claiming logic: fill smallest earnings first
export const calculateWaterfallClaims = async (
  walletAddress: string,
  twitterUsername: string,
  tokenEarnings: { tokenAddress: string; tokenSymbol: string; calculatedEarnings: number }[]
): Promise<WaterfallClaimResult> => {
  console.log(`🌊 Calculating waterfall claims for @${twitterUsername} (${walletAddress})`)
  
  // Get current wallet balance
  const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com'
  
  let currentBalance = 0
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [walletAddress]
      })
    })
    
    const data = await response.json()
    if (data.result) {
      currentBalance = data.result.value / 1000000000 // Convert lamports to SOL
    }
  } catch (error) {
    console.error(`Failed to get balance for ${walletAddress}:`, error)
  }
  
  // Calculate total earnings and withdrawn amount
  const totalCalculatedEarnings = tokenEarnings.reduce((sum, token) => sum + token.calculatedEarnings, 0)
  const totalWithdrawn = Math.max(0, totalCalculatedEarnings - currentBalance)
  
  console.log(`   Total should earn: ${totalCalculatedEarnings.toFixed(4)} SOL`)
  console.log(`   Current balance: ${currentBalance.toFixed(4)} SOL`)
  console.log(`   Total withdrawn: ${totalWithdrawn.toFixed(4)} SOL`)
  
  // Sort tokens by earnings (smallest first for waterfall)
  const sortedTokens = [...tokenEarnings].sort((a, b) => a.calculatedEarnings - b.calculatedEarnings)
  
  // Apply waterfall logic
  let remainingWithdrawn = totalWithdrawn
  const tokens: CreatorTokenEarning[] = []
  
  for (const token of sortedTokens) {
    const claimedAmount = Math.min(remainingWithdrawn, token.calculatedEarnings)
    const claimedPercentage = token.calculatedEarnings > 0 
      ? (claimedAmount / token.calculatedEarnings) * 100 
      : 0
    
    tokens.push({
      tokenAddress: token.tokenAddress,
      tokenSymbol: token.tokenSymbol,
      walletAddress,
      twitterUsername,
      calculatedEarnings: token.calculatedEarnings,
      claimedAmount,
      claimedPercentage
    })
    
    remainingWithdrawn -= claimedAmount
    
    console.log(`   ${token.tokenSymbol}: ${claimedAmount.toFixed(4)}/${token.calculatedEarnings.toFixed(4)} SOL (${claimedPercentage.toFixed(1)}%)`)
    
    if (remainingWithdrawn <= 0) break
  }
  
  return {
    walletAddress,
    twitterUsername,
    totalCalculatedEarnings,
    totalWithdrawn,
    currentBalance,
    tokens
  }
}

// Calculate claimed percentage for a single token
export const calculateTokenClaimedPercentage = async (
  tokenAddress: string,
  tokenSymbol: string,
  totalFeesSOL: number
): Promise<TokenClaimedData> => {
  console.log(`🧮 Calculating claimed percentage for ${tokenSymbol}...`)

  try {
    // Get fee share wallets for the token
    const feeShareData = await getTokenFeeShareWallets(tokenAddress, tokenSymbol, `${tokenSymbol} Token`)
    
    if (feeShareData.totalWallets === 0) {
      console.log(`No fee share wallets found for ${tokenSymbol}`)
      return {
        tokenAddress,
        tokenSymbol,
        totalFeesSOL,
        totalCalculatedEarnings: 0,
        totalWithdrawals: 0,
        claimedPercentage: 0,
        remainingSOL: totalFeesSOL,
        isCalculating: false
      }
    }

    console.log(`Found ${feeShareData.totalWallets} fee share wallets for ${tokenSymbol}`)

    // Calculate total withdrawals across all creators
    let totalCalculatedEarnings = 0
    let totalWithdrawals = 0

    for (const wallet of feeShareData.feeShareWallets) {
      console.log(`📊 Analyzing withdrawals for @${wallet.twitterUsername} (${wallet.royaltyPercentage}%)...`)
      
      const calculatedEarnings = totalFeesSOL * (wallet.royaltyPercentage / 100)
      totalCalculatedEarnings += calculatedEarnings

      // Analyze withdrawals for this wallet
      const analysis = await analyzeWalletWithdrawals(
        wallet.walletAddress,
        wallet.twitterUsername,
        tokenAddress,
        tokenSymbol,
        wallet.royaltyPercentage,
        totalFeesSOL,
        300 // Limit to 300 transactions for speed
      )

      totalWithdrawals += analysis.totalWithdrawals
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Calculate claimed percentage
    const claimedPercentage = totalCalculatedEarnings > 0 
      ? (totalWithdrawals / totalCalculatedEarnings) * 100 
      : 0

    const remainingSOL = totalCalculatedEarnings - totalWithdrawals

    console.log(`✅ ${tokenSymbol} claimed calculation complete:`)
    console.log(`   Total Should Earn: ${totalCalculatedEarnings.toFixed(4)} SOL`)
    console.log(`   Total Withdrawn: ${totalWithdrawals.toFixed(4)} SOL`)
    console.log(`   Claimed Percentage: ${claimedPercentage.toFixed(1)}%`)

    return {
      tokenAddress,
      tokenSymbol,
      totalFeesSOL,
      totalCalculatedEarnings,
      totalWithdrawals,
      claimedPercentage,
      remainingSOL,
      isCalculating: false
    }

  } catch (error) {
    console.error(`Error calculating claimed percentage for ${tokenSymbol}:`, error)
    return {
      tokenAddress,
      tokenSymbol,
      totalFeesSOL,
      totalCalculatedEarnings: 0,
      totalWithdrawals: 0,
      claimedPercentage: 0,
      remainingSOL: totalFeesSOL,
      isCalculating: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Lightweight version that uses current SOL balance check (faster than full transaction history)
export const calculateTokenClaimedPercentageQuick = async (
  tokenAddress: string,
  tokenSymbol: string,
  totalFeesSOL: number
): Promise<TokenClaimedData> => {
  console.log(`⚡ Quick claimed percentage calculation for ${tokenSymbol}...`)

  try {
    // Get fee share wallets for the token
    const feeShareData = await getTokenFeeShareWallets(tokenAddress, tokenSymbol, `${tokenSymbol} Token`)
    
    if (feeShareData.totalWallets === 0) {
      return {
        tokenAddress,
        tokenSymbol,
        totalFeesSOL,
        totalCalculatedEarnings: 0,
        totalWithdrawals: 0,
        claimedPercentage: 0,
        remainingSOL: totalFeesSOL,
        isCalculating: false
      }
    }

    // Calculate what each creator should have earned
    let totalCalculatedEarnings = 0
    for (const wallet of feeShareData.feeShareWallets) {
      const calculatedEarnings = totalFeesSOL * (wallet.royaltyPercentage / 100)
      totalCalculatedEarnings += calculatedEarnings
    }

    // Quick method: Check current SOL balances of fee share wallets
    let totalCurrentBalance = 0
    
    for (const wallet of feeShareData.feeShareWallets) {
      try {
        // Get current SOL balance of the fee share wallet
        const response = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [wallet.walletAddress]
          })
        })
        
        const data = await response.json()
        if (data.result?.value) {
          const balanceSOL = data.result.value / 1_000_000_000
          totalCurrentBalance += balanceSOL
          console.log(`💰 @${wallet.twitterUsername} current balance: ${balanceSOL.toFixed(4)} SOL`)
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`Failed to get balance for @${wallet.twitterUsername}:`, error)
      }
    }

    // Estimate claimed percentage based on what's NOT in the wallets
    // Assumption: If they earned X SOL and currently have Y SOL, they've withdrawn (X - Y) SOL
    const estimatedWithdrawn = Math.max(0, totalCalculatedEarnings - totalCurrentBalance)
    const claimedPercentage = totalCalculatedEarnings > 0 
      ? Math.min(100, (estimatedWithdrawn / totalCalculatedEarnings) * 100)
      : 0

    console.log(`⚡ ${tokenSymbol} quick calculation:`)
    console.log(`   Should have earned: ${totalCalculatedEarnings.toFixed(4)} SOL`)
    console.log(`   Current balances: ${totalCurrentBalance.toFixed(4)} SOL`)
    console.log(`   Estimated withdrawn: ${estimatedWithdrawn.toFixed(4)} SOL`)
    console.log(`   Claimed percentage: ${claimedPercentage.toFixed(1)}%`)

    return {
      tokenAddress,
      tokenSymbol,
      totalFeesSOL,
      totalCalculatedEarnings,
      totalWithdrawals: estimatedWithdrawn,
      claimedPercentage,
      remainingSOL: totalCurrentBalance,
      isCalculating: false
    }

  } catch (error) {
    console.error(`Error in quick calculation for ${tokenSymbol}:`, error)
    return {
      tokenAddress,
      tokenSymbol,
      totalFeesSOL,
      totalCalculatedEarnings: 0,
      totalWithdrawals: 0,
      claimedPercentage: 0,
      remainingSOL: totalFeesSOL,
      isCalculating: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Cache for claimed percentages to avoid recalculating
const claimedPercentageCache = new Map<string, TokenClaimedData>()

export const getCachedClaimedPercentage = (tokenAddress: string): TokenClaimedData | null => {
  return claimedPercentageCache.get(tokenAddress) || null
}

export const setCachedClaimedPercentage = (tokenAddress: string, data: TokenClaimedData): void => {
  claimedPercentageCache.set(tokenAddress, data)
}

export const clearClaimedPercentageCache = (): void => {
  claimedPercentageCache.clear()
}

// Get waterfall-calculated claimed percentage for a specific token
export const getTokenWaterfallClaimedPercentage = async (
  tokenAddress: string,
  tokenSymbol: string,
  totalFeesSOL: number
): Promise<TokenClaimedData> => {
  console.log(`🌊 Getting waterfall claimed percentage for ${tokenSymbol}...`)

  try {
    // Get fee share wallets for this token
    const feeShareData = await getTokenFeeShareWallets(tokenAddress, tokenSymbol, `${tokenSymbol} Token`)
    
    if (feeShareData.totalWallets === 0) {
      return {
        tokenAddress,
        tokenSymbol,
        totalFeesSOL,
        totalCalculatedEarnings: 0,
        totalWithdrawals: 0,
        claimedPercentage: 0,
        remainingSOL: totalFeesSOL,
        isCalculating: false
      }
    }

    // Group wallets by address (same creator might have multiple tokens)
    const walletGroups = new Map<string, {
      walletAddress: string,
      twitterUsername: string,
      thisTokenEarnings: number,
      royaltyPercentage: number
    }>()

    for (const wallet of feeShareData.feeShareWallets) {
      const calculatedEarnings = totalFeesSOL * (wallet.royaltyPercentage / 100)
      walletGroups.set(wallet.walletAddress, {
        walletAddress: wallet.walletAddress,
        twitterUsername: wallet.twitterUsername,
        thisTokenEarnings: calculatedEarnings,
        royaltyPercentage: wallet.royaltyPercentage
      })
    }

    let totalCalculatedEarnings = 0
    let totalClaimedForThisToken = 0

    // For each unique wallet, we need to find all their tokens to apply waterfall logic
    for (const [walletAddress, walletInfo] of walletGroups.entries()) {
      totalCalculatedEarnings += walletInfo.thisTokenEarnings

      // TODO: In a full implementation, we'd need to query all tokens for this wallet
      // For now, we'll use a simplified approach that assumes this is their only token
      // or treat each token independently (which is the current behavior)
      
      // Get current balance
      let currentBalance = 0
      try {
        const response = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [walletAddress]
          })
        })
        
        const data = await response.json()
        if (data.result?.value) {
          currentBalance = data.result.value / 1_000_000_000
        }
      } catch (error) {
        console.warn(`Failed to get balance for ${walletAddress}:`, error)
      }

      // For now, assume this token gets the full withdrawal allocation
      // In a full implementation, this would use waterfall logic across all their tokens
      const estimatedWithdrawn = Math.max(0, walletInfo.thisTokenEarnings - currentBalance)
      const claimedAmount = Math.min(walletInfo.thisTokenEarnings, estimatedWithdrawn)
      
      totalClaimedForThisToken += claimedAmount

      console.log(`   @${walletInfo.twitterUsername}: ${claimedAmount.toFixed(4)}/${walletInfo.thisTokenEarnings.toFixed(4)} SOL`)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const claimedPercentage = totalCalculatedEarnings > 0 
      ? (totalClaimedForThisToken / totalCalculatedEarnings) * 100 
      : 0

    const remainingSOL = totalCalculatedEarnings - totalClaimedForThisToken

    console.log(`🌊 ${tokenSymbol} waterfall result: ${claimedPercentage.toFixed(1)}% claimed`)

    return {
      tokenAddress,
      tokenSymbol,
      totalFeesSOL,
      totalCalculatedEarnings,
      totalWithdrawals: totalClaimedForThisToken,
      claimedPercentage,
      remainingSOL,
      isCalculating: false
    }

  } catch (error) {
    console.error(`Error in waterfall calculation for ${tokenSymbol}:`, error)
    return {
      tokenAddress,
      tokenSymbol,
      totalFeesSOL,
      totalCalculatedEarnings: 0,
      totalWithdrawals: 0,
      claimedPercentage: 0,
      remainingSOL: totalFeesSOL,
      isCalculating: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}