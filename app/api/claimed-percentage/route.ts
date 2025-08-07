import { NextRequest, NextResponse } from 'next/server'
import { calculateTokenClaimedPercentage, calculateTokenClaimedPercentageQuick } from '@/lib/claimed-percentage-calculator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const tokenSymbol = searchParams.get('tokenSymbol') || 'TOKEN'
    const totalFeesSOL = parseFloat(searchParams.get('totalFeesSOL') || '0')
    const quick = searchParams.get('quick') === 'true'
    
    console.log('Claimed percentage API called for token:', tokenAddress)
    
    if (!tokenAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: tokenAddress'
      }, { status: 400 })
    }

    if (totalFeesSOL <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid totalFeesSOL parameter'
      }, { status: 400 })
    }

    let result
    if (quick) {
      // Quick estimation without blockchain analysis
      result = await calculateTokenClaimedPercentageQuick(tokenAddress, tokenSymbol, totalFeesSOL)
    } else {
      // Full analysis with blockchain transaction checking
      result = await calculateTokenClaimedPercentage(tokenAddress, tokenSymbol, totalFeesSOL)
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Calculated claimed percentage for ${tokenSymbol}: ${result.claimedPercentage.toFixed(1)}%`
    })
    
  } catch (error) {
    console.error('Claimed percentage API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}