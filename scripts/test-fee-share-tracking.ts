import { createClient } from '@supabase/supabase-js'
import { getFeeShareWallet, getTokenFeeShareWallets } from '../lib/fee-share-tracker'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testFeeShareTracking() {
  // Example token to test with
  const tokenAddress = process.argv[2] || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
  const tokenSymbol = process.argv[3] || 'SAMO'
  
  console.log('🔍 Testing fee share wallet tracking...')
  console.log(`Token: ${tokenSymbol} (${tokenAddress})`)
  
  try {
    const result = await getTokenFeeShareWallets(tokenAddress, tokenSymbol)
    
    console.log('\n=== RESULTS ===\n')
    console.log(`Total fee share wallets found: ${result.totalWallets}`)
    
    if (result.totalWallets > 0) {
      console.log('\nFee Share Wallets:')
      result.feeShareWallets.forEach((wallet, index) => {
        console.log(`${index + 1}. @${wallet.twitterUsername}`)
        console.log(`   Wallet: ${wallet.walletAddress}`)
        console.log(`   Royalty: ${wallet.royaltyPercentage}%`)
      })
    }
    
  } catch (error) {
    console.error('Error running test:', error)
  }
}

// Run the test
testFeeShareTracking()