import { NextRequest, NextResponse } from 'next/server'
import { getTokenFeeShareWallets, trackFeeShareWallets } from '@/lib/fee-share-tracker'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const tokenAddress = searchParams.get('tokenAddress')
    const tokenSymbol = searchParams.get('tokenSymbol')
    const tokenName = searchParams.get('tokenName')
    
    console.log('Fee share API route called with action:', action)
    
    if (action === 'single-token') {
      // Get fee share wallets for a specific token
      if (!tokenAddress || !tokenSymbol || !tokenName) {
        return NextResponse.json({
          success: false,
          error: 'Missing required parameters: tokenAddress, tokenSymbol, tokenName'
        }, { status: 400 })
      }
      
      const result = await getTokenFeeShareWallets(tokenAddress, tokenSymbol, tokenName)
      
      return NextResponse.json({
        success: true,
        data: result,
        message: `Found ${result.totalWallets} fee share wallets for ${tokenSymbol}`
      })
    }
    
    if (action === 'all-tokens') {
      // Track fee share wallets for all tokens
      const results = await trackFeeShareWallets()
      
      return NextResponse.json({
        success: true,
        data: results,
        message: `Found fee share wallets for ${results.length} tokens`
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action. Use ?action=single-token&tokenAddress=...&tokenSymbol=...&tokenName=... or ?action=all-tokens' 
    })
    
  } catch (error) {
    console.error('Fee share API route error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 