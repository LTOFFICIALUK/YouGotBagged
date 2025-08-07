#!/usr/bin/env node

import { getTokenFeeShareWallets } from '../lib/fee-share-tracker'
import { analyzeTokenFeeClaims, displayTokenAnalysis, saveAnalysisResults } from '../lib/sol-transaction-analyzer'

const main = async () => {
  const tokenAddress = process.argv[2]
  
  if (!tokenAddress) {
    console.log('Usage: npm run analyze-fees <TOKEN_ADDRESS>')
    console.log('Example: npm run analyze-fees DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')
    process.exit(1)
  }

  try {
    console.log('🚀 Starting comprehensive fee analysis...\n')
    
    // Step 1: Get fee share wallets
    console.log('📋 Step 1: Finding fee share wallets...')
    const feeShareData = await getTokenFeeShareWallets(tokenAddress)
    
    if (feeShareData.totalWallets === 0) {
      console.log('❌ No fee share wallets found for this token')
      return
    }
    
    console.log(`✅ Found ${feeShareData.totalWallets} fee share wallets\n`)
    
    // Step 2: Analyze transactions
    console.log('📊 Step 2: Analyzing SOL transactions...')
    const analysis = await analyzeTokenFeeClaims(feeShareData, 1000)
    
    // Step 3: Display results
    displayTokenAnalysis(analysis)
    
    // Step 4: Save results
    await saveAnalysisResults(analysis)
    
    console.log('\n✅ Analysis completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in fee analysis:', error)
  }
}

// Run the script
main()