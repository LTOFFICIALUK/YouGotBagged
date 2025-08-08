// SOL Transaction Analyzer for Fee Share Wallets
// Analyzes all SOL deposits (earnings) and withdrawals for creator wallets

export interface SolTransaction {
  signature: string
  blockTime: number
  date: string
  type: 'deposit' | 'withdrawal'
  amount: number
  amountLamports: number
  fromAddress?: string
  toAddress?: string
  programId?: string
  isProgramInteraction: boolean
  isMeteoraInteraction: boolean
}

export interface WalletAnalysis {
  walletAddress: string
  twitterUsername: string
  tokenAddress: string
  tokenSymbol: string
  royaltyPercentage: number
  calculatedEarnings: number
  totalWithdrawals: number
  remainingBalance: number
  withdrawalCount: number
  withdrawalTransactions: SolTransaction[]
  lastWithdrawal: string | null
}

export interface TokenFeeAnalysis {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  totalFeesEarned: number
  totalCreators: number
  totalCalculatedEarnings: number
  totalWithdrawalsAcrossCreators: number
  totalRemainingAcrossCreators: number
  creatorAnalyses: WalletAnalysis[]
}

// Known Meteora Program IDs
const METEORA_PROGRAMS = [
  'METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m',  // Meteora main
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',  // Meteora Liquidity
  'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB',  // Meteora Pools
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',  // Whirlpool (often used with Meteora)
]

// Solana RPC configuration
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com'

// Helper function to convert lamports to SOL
const lamportsToSol = (lamports: number): number => {
  return lamports / 1_000_000_000
}

// Helper function to check if transaction involves Meteora
const isMeteoraTransaction = (transaction: any): boolean => {
  if (!transaction.meta?.logMessages) return false
  
  const logs = transaction.meta.logMessages.join(' ')
  return METEORA_PROGRAMS.some(programId => logs.includes(programId)) ||
         logs.toLowerCase().includes('meteora') ||
         logs.toLowerCase().includes('claim') ||
         logs.toLowerCase().includes('fee')
}

// Get account transaction signatures with pagination
const getAccountTransactionSignatures = async (
  walletAddress: string,
  limit: number = 1000,
  before?: string
): Promise<any[]> => {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          walletAddress,
          {
            limit,
            before,
            commitment: 'confirmed'
          }
        ]
      })
    })

    const data = await response.json()
    
    if (data.error) {
      console.error('RPC Error:', data.error)
      return []
    }

    return data.result || []
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return []
  }
}

// Get detailed transaction information
const getTransactionDetails = async (signature: string): Promise<any> => {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          signature,
          {
            encoding: 'json',
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          }
        ]
      })
    })

    const data = await response.json()
    
    if (data.error) {
      console.error('Transaction fetch error:', data.error)
      return null
    }

    return data.result
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return null
  }
}

// Analyze SOL balance changes in a transaction - only track withdrawals
const analyzeSolWithdrawals = (
  transaction: any,
  walletAddress: string
): { amount: number; isWithdrawal: boolean } => {
  if (!transaction.meta?.preBalances || !transaction.meta?.postBalances) {
    return { amount: 0, isWithdrawal: false }
  }

  const accountKeys = transaction.transaction.message.accountKeys
  const walletIndex = accountKeys.findIndex((key: any) => 
    (typeof key === 'string' ? key : key.pubkey) === walletAddress
  )

  if (walletIndex === -1) {
    return { amount: 0, isWithdrawal: false }
  }

  const preBalance = transaction.meta.preBalances[walletIndex]
  const postBalance = transaction.meta.postBalances[walletIndex]
  const difference = postBalance - preBalance

  // Only track withdrawals (negative balance changes)
  if (difference < 0) {
    return { amount: lamportsToSol(Math.abs(difference)), isWithdrawal: true }
  }

  return { amount: 0, isWithdrawal: false }
}

// Analyze withdrawals only for a wallet (calculate earnings from token data)
export const analyzeWalletWithdrawals = async (
  walletAddress: string,
  twitterUsername: string,
  tokenAddress: string,
  tokenSymbol: string,
  royaltyPercentage: number,
  totalTokenFees: number,
  maxTransactions: number = 500
): Promise<WalletAnalysis> => {
  console.log(`🔍 Analyzing withdrawals for @${twitterUsername} (${royaltyPercentage}% share)...`)
  
  const withdrawalTransactions: SolTransaction[] = []
  let totalWithdrawals = 0
  let lastWithdrawal: string | null = null

  // Calculate how much this creator should have earned
  const calculatedEarnings = totalTokenFees * (royaltyPercentage / 100)
  console.log(`💰 @${twitterUsername} should have earned: ${calculatedEarnings.toFixed(4)} SOL`)

  try {
    // Get transaction signatures in smaller batches (more efficient)
    let allSignatures: any[] = []
    let before: string | undefined

    while (allSignatures.length < maxTransactions) {
      const batchSize = Math.min(500, maxTransactions - allSignatures.length)
      const signatures = await getAccountTransactionSignatures(walletAddress, batchSize, before)
      
      if (signatures.length === 0) break
      
      allSignatures.push(...signatures)
      before = signatures[signatures.length - 1].signature
      
      console.log(`📥 Fetched ${allSignatures.length} signatures for @${twitterUsername}`)
      
      // Longer delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`📊 Processing ${allSignatures.length} transactions for withdrawals only...`)

    // Process transactions in smaller batches with longer delays
    const batchSize = 5
    for (let i = 0; i < allSignatures.length; i += batchSize) {
      const batch = allSignatures.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (sigInfo) => {
        const txDetails = await getTransactionDetails(sigInfo.signature)
        if (!txDetails) return null

        const withdrawal = analyzeSolWithdrawals(txDetails, walletAddress)
        if (!withdrawal.isWithdrawal) return null

        const transaction: SolTransaction = {
          signature: sigInfo.signature,
          blockTime: sigInfo.blockTime,
          date: new Date(sigInfo.blockTime * 1000).toISOString(),
          type: 'withdrawal',
          amount: withdrawal.amount,
          amountLamports: withdrawal.amount * 1_000_000_000,
          isProgramInteraction: false,
          isMeteoraInteraction: false
        }

        totalWithdrawals += withdrawal.amount

        if (!lastWithdrawal || sigInfo.blockTime > new Date(lastWithdrawal).getTime() / 1000) {
          lastWithdrawal = new Date(sigInfo.blockTime * 1000).toISOString()
        }

        return transaction
      })

      const batchResults = await Promise.all(batchPromises)
      withdrawalTransactions.push(...batchResults.filter(tx => tx !== null) as SolTransaction[])

      console.log(`⚡ Processed withdrawal batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allSignatures.length / batchSize)} for @${twitterUsername}`)
      
      // Longer delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const remainingBalance = calculatedEarnings - totalWithdrawals

    console.log(`✅ Withdrawal analysis complete for @${twitterUsername}:`)
    console.log(`   Calculated Earnings: ${calculatedEarnings.toFixed(4)} SOL`)
    console.log(`   Total Withdrawals: ${totalWithdrawals.toFixed(4)} SOL`)
    console.log(`   Remaining Balance: ${remainingBalance.toFixed(4)} SOL`)

  } catch (error) {
    console.error(`Error analyzing withdrawals for @${twitterUsername}:`, error)
  }

  return {
    walletAddress,
    twitterUsername,
    tokenAddress,
    tokenSymbol,
    royaltyPercentage,
    calculatedEarnings,
    totalWithdrawals,
    remainingBalance: calculatedEarnings - totalWithdrawals,
    withdrawalCount: withdrawalTransactions.length,
    withdrawalTransactions: withdrawalTransactions.sort((a, b) => b.blockTime - a.blockTime),
    lastWithdrawal
  }
}

// Analyze fee claims for an entire token using calculated earnings + withdrawal tracking
export const analyzeTokenFeeClaims = async (
  tokenFeeShareData: any, // From our fee share tracker
  totalTokenFeesSOL: number, // Total fees earned by the token in SOL
  maxTransactionsPerWallet: number = 500
): Promise<TokenFeeAnalysis> => {
  console.log(`🚀 Starting withdrawal analysis for ${tokenFeeShareData.tokenSymbol}...`)
  console.log(`📊 Total token fees: ${totalTokenFeesSOL.toFixed(4)} SOL`)
  
  const creatorAnalyses: WalletAnalysis[] = []
  let totalCalculatedEarnings = 0
  let totalWithdrawalsAcrossCreators = 0

  for (const wallet of tokenFeeShareData.feeShareWallets) {
    console.log(`\n📋 Analyzing withdrawals for @${wallet.twitterUsername}...`)
    
    const analysis = await analyzeWalletWithdrawals(
      wallet.walletAddress,
      wallet.twitterUsername,
      tokenFeeShareData.tokenAddress,
      tokenFeeShareData.tokenSymbol,
      wallet.royaltyPercentage,
      totalTokenFeesSOL,
      maxTransactionsPerWallet
    )

    creatorAnalyses.push(analysis)
    totalCalculatedEarnings += analysis.calculatedEarnings
    totalWithdrawalsAcrossCreators += analysis.totalWithdrawals

    // Add longer delay between wallet analyses to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  const result: TokenFeeAnalysis = {
    tokenAddress: tokenFeeShareData.tokenAddress,
    tokenSymbol: tokenFeeShareData.tokenSymbol,
    tokenName: tokenFeeShareData.tokenName,
    totalFeesEarned: totalTokenFeesSOL,
    totalCreators: creatorAnalyses.length,
    totalCalculatedEarnings,
    totalWithdrawalsAcrossCreators,
    totalRemainingAcrossCreators: totalCalculatedEarnings - totalWithdrawalsAcrossCreators,
    creatorAnalyses
  }

  console.log(`\n🎯 Token Analysis Summary for ${tokenFeeShareData.tokenSymbol}:`)
  console.log(`   Total Token Fees: ${result.totalFeesEarned.toFixed(4)} SOL`)
  console.log(`   Total Creators: ${result.totalCreators}`)
  console.log(`   Total Should Have Earned: ${result.totalCalculatedEarnings.toFixed(4)} SOL`)
  console.log(`   Total Withdrawals: ${result.totalWithdrawalsAcrossCreators.toFixed(4)} SOL`)
  console.log(`   Total Remaining: ${result.totalRemainingAcrossCreators.toFixed(4)} SOL`)

  return result
}

// Utility function to display results
export const displayTokenAnalysis = (analysis: TokenFeeAnalysis) => {
  console.log(`\n=== FEE CLAIM ANALYSIS: ${analysis.tokenSymbol} ===\n`)
  
  console.log(`Token: ${analysis.tokenSymbol} (${analysis.tokenName})`)
  console.log(`Address: ${analysis.tokenAddress}`)
  console.log(`Total Creators: ${analysis.totalCreators}`)
  console.log(`Total SOL Earned: ${analysis.totalCalculatedEarnings.toFixed(4)} SOL`)
  console.log(`Total SOL Withdrawn: ${analysis.totalWithdrawalsAcrossCreators.toFixed(4)} SOL`)
  console.log(`Net SOL Remaining: ${analysis.totalRemainingAcrossCreators.toFixed(4)} SOL`)
  console.log(`\nCreator Breakdown:`)
  
  analysis.creatorAnalyses.forEach((creator, index) => {
    console.log(`\n${index + 1}. @${creator.twitterUsername}`)
    console.log(`   Wallet: ${creator.walletAddress}`)
    console.log(`   Should Have Earned: ${creator.calculatedEarnings.toFixed(4)} SOL`)
    console.log(`   Total Withdrawn: ${creator.totalWithdrawals.toFixed(4)} SOL`)
    console.log(`   Remaining Balance: ${creator.remainingBalance.toFixed(4)} SOL`)
    console.log(`   Withdrawal Count: ${creator.withdrawalCount}`)
    console.log(`   Last Withdrawal: ${creator.lastWithdrawal || 'Never'}`)
  })
}

// Utility to save results
export const saveAnalysisResults = async (
  analysis: TokenFeeAnalysis,
  filename?: string
): Promise<void> => {
  try {
    const fs = await import('fs/promises')
    const defaultFilename = `fee-analysis-${analysis.tokenSymbol}-${Date.now()}.json`
    await fs.writeFile(filename || defaultFilename, JSON.stringify(analysis, null, 2))
    console.log(`💾 Analysis saved to ${filename || defaultFilename}`)
  } catch (error) {
    console.error('Error saving analysis:', error)
  }
}