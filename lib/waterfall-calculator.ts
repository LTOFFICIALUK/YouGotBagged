interface TokenEarning {
  tokenSymbol: string
  calculatedEarnings: number
}

interface WaterfallResult {
  tokenSymbol: string
  calculatedEarnings: number
  claimedAmount: number
  claimedPercentage: number
}

export function calculateWaterfallClaims(
  totalWithdrawn: number,
  tokens: TokenEarning[]
): WaterfallResult[] {
  // Sort tokens by earnings (smallest first)
  const sortedTokens = [...tokens].sort((a, b) => a.calculatedEarnings - b.calculatedEarnings)
  
  // Track how much is left to allocate
  let remainingWithdrawn = totalWithdrawn
  
  // Calculate claims for each token
  const results: WaterfallResult[] = []
  
  for (const token of sortedTokens) {
    // How much can this token claim?
    const claimedAmount = Math.min(remainingWithdrawn, token.calculatedEarnings)
    const claimedPercentage = token.calculatedEarnings > 0 
      ? (claimedAmount / token.calculatedEarnings) * 100 
      : 0
    
    results.push({
      tokenSymbol: token.tokenSymbol,
      calculatedEarnings: token.calculatedEarnings,
      claimedAmount,
      claimedPercentage
    })
    
    // Subtract what was claimed from what's left
    remainingWithdrawn -= claimedAmount
    
    // If nothing left to allocate, fill rest with 0%
    if (remainingWithdrawn <= 0) break
  }
  
  // Any remaining tokens get 0%
  for (let i = results.length; i < sortedTokens.length; i++) {
    const token = sortedTokens[i]
    results.push({
      tokenSymbol: token.tokenSymbol,
      calculatedEarnings: token.calculatedEarnings,
      claimedAmount: 0,
      claimedPercentage: 0
    })
  }
  
  return results
}

// Example usage:
/*
const totalWithdrawn = 32 // SOL
const tokens = [
  { tokenSymbol: 'TOKEN_D', calculatedEarnings: 40 }, // Biggest
  { tokenSymbol: 'TOKEN_A', calculatedEarnings: 10 }, // Smallest
  { tokenSymbol: 'TOKEN_B', calculatedEarnings: 15 },
  { tokenSymbol: 'TOKEN_C', calculatedEarnings: 15 }
]

const results = calculateWaterfallClaims(totalWithdrawn, tokens)
Results:
[
  { tokenSymbol: 'TOKEN_A', calculatedEarnings: 10, claimedAmount: 10, claimedPercentage: 100 },
  { tokenSymbol: 'TOKEN_B', calculatedEarnings: 15, claimedAmount: 15, claimedPercentage: 100 },
  { tokenSymbol: 'TOKEN_C', calculatedEarnings: 15, claimedAmount: 7, claimedPercentage: 46.7 },
  { tokenSymbol: 'TOKEN_D', calculatedEarnings: 40, claimedAmount: 0, claimedPercentage: 0 }
]
*/