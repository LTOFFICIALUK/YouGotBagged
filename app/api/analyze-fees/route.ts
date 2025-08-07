import { NextRequest, NextResponse } from 'next/server'
import { getTokenFeeShareWallets } from '@/lib/fee-share-tracker'
import { analyzeTokenFeeClaims } from '@/lib/sol-transaction-analyzer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const tokenSymbol = searchParams.get('tokenSymbol') || 'TOKEN'
    const tokenName = searchParams.get('tokenName') || 'Token'
    const totalFeesSOL = parseFloat(searchParams.get('totalFeesSOL') || '0')
    const maxTransactions = parseInt(searchParams.get('maxTransactions') || '500')
    
    console.log('Fee analysis API called for token:', tokenAddress)
    
    if (!tokenAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: tokenAddress'
      }, { status: 400 })
    }

    if (totalFeesSOL <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid totalFeesSOL parameter - please provide the total fees earned by this token in SOL'
      }, { status: 400 })
    }

    // Step 1: Get fee share wallets for the token
    console.log('Step 1: Getting fee share wallets...')
    const feeShareData = await getTokenFeeShareWallets(tokenAddress, tokenSymbol, tokenName)
    
    if (feeShareData.totalWallets === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fee share wallets found for this token',
        data: {
          tokenAddress,
          tokenSymbol: feeShareData.tokenSymbol,
          tokenName: feeShareData.tokenName,
          totalFeesEarned: totalFeesSOL,
          totalCreators: 0,
          totalCalculatedEarnings: 0,
          totalWithdrawalsAcrossCreators: 0,
          totalRemainingAcrossCreators: 0,
          creatorAnalyses: []
        }
      })
    }

    console.log(`Found ${feeShareData.totalWallets} fee share wallets`)

    // Step 2: Analyze withdrawal transactions only
    console.log('Step 2: Analyzing withdrawals only (calculating earnings from token data)...')
    const analysis = await analyzeTokenFeeClaims(feeShareData, totalFeesSOL, maxTransactions)
    
    return NextResponse.json({
      success: true,
      data: analysis,
      message: `Analyzed ${analysis.totalCreators} creators for ${analysis.tokenSymbol}`
    })
    
  } catch (error) {
    console.error('Fee analysis API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}