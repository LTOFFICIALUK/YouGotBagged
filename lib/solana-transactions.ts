const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY'

if (!process.env.NEXT_PUBLIC_HELIUS_RPC_URL) {
  console.warn('⚠️ NEXT_PUBLIC_HELIUS_RPC_URL not set in environment variables. Using fallback URL.')
}

interface TransactionSignature {
  signature: string
  slot: number
  blockTime: number
}

interface TransactionData {
  txType: 'withdrawal' | 'deposit'
  amount: number
  timestamp: number
  signature: string
}

/**
 * Get all SOL withdrawal transactions from a wallet
 */
export async function getCreatorWithdrawals(walletAddresses: string[]): Promise<{ [wallet: string]: number }> {
  console.log(`\n🔍 Getting withdrawal transactions for ${walletAddresses.length} wallets...`)
  const withdrawalsByWallet: { [wallet: string]: number } = {}

  // Process wallets in sequence to avoid rate limits
  for (const wallet of walletAddresses) {
    try {
      console.log(`\n   Checking wallet ${wallet}...`)
      let withdrawalTotal = 0
      
      // Get all signatures first
      const signatures = await getAllTransactionSignatures(wallet)
      console.log(`   Found ${signatures.length} total transactions`)
      console.log(`   Analyzing transactions for withdrawals...`)
      
      // Process in batches of 5 to avoid rate limits
      const BATCH_SIZE = 5
      for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
        const batch = signatures.slice(i, i + BATCH_SIZE)
        const transactions = await Promise.all(
          batch.map(sig => getTransactionDetails(sig.signature))
        )
        
        // Process transaction details
        for (const tx of transactions) {
          if (tx && tx.txType === 'withdrawal') {
            withdrawalTotal += tx.amount
          }
        }
        
        // Add delay between batches
        if (i + BATCH_SIZE < signatures.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      withdrawalsByWallet[wallet] = withdrawalTotal
      console.log(`   Total withdrawals: ${withdrawalTotal.toFixed(4)} SOL`)
      
      // Add delay between wallets
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`Error getting withdrawals for ${wallet}:`, error)
      withdrawalsByWallet[wallet] = 0
    }
  }

  return withdrawalsByWallet
}

/**
 * Get all transaction signatures for a wallet
 */
async function getAllTransactionSignatures(wallet: string): Promise<TransactionSignature[]> {
  const signatures: TransactionSignature[] = []
  let lastSignature: string | undefined
  
  while (true) {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [
            wallet,
            {
              limit: 100,
              before: lastSignature
            }
          ]
        })
      })
      
      const data = await response.json()
      
      if (!data.result || data.result.length === 0) break
      
      signatures.push(...data.result)
      lastSignature = data.result[data.result.length - 1].signature
      
      // If we've gotten enough recent transactions, stop
      if (signatures.length >= 100) break // Reduced from 1000 to focus on recent transactions
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error('Error getting signatures:', error)
      break
    }
  }
  
  return signatures
}

/**
 * Get detailed transaction data for a signature
 */
async function getTransactionDetails(signature: string): Promise<TransactionData | null> {
  try {
          const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            signature,
            {
              encoding: 'json',
              maxSupportedTransactionVersion: 0
            }
          ]
        })
      })
    
    const data = await response.json()
    if (!data.result) return null
    
    const tx = data.result
    
    // Look for SOL transfers
    let amount = 0
    let isWithdrawal = false
    
    // Check pre and post balances
    if (tx.meta && tx.meta.preBalances && tx.meta.postBalances && tx.meta.preBalances[0] !== undefined) {
      const preBalance = tx.meta.preBalances[0] / 1_000_000_000 // Convert lamports to SOL
      const postBalance = tx.meta.postBalances[0] / 1_000_000_000
      const difference = preBalance - postBalance

      // Only count significant withdrawals (> 0.001 SOL)
      if (difference > 0.001) {
        amount = difference
        isWithdrawal = true
        console.log(`   Found withdrawal: ${amount.toFixed(4)} SOL (${signature})`)
      }
    }
    
    if (isWithdrawal && amount > 0) {
      return {
        txType: 'withdrawal',
        amount,
        timestamp: tx.blockTime,
        signature
      }
    }
    
    return null
    
  } catch (error) {
    console.error('Error getting transaction details:', error)
    return null
  }
}