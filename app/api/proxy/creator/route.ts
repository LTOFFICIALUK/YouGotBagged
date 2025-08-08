import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenMint = searchParams.get('tokenMint')

  if (!tokenMint) {
    return NextResponse.json(
      { error: 'tokenMint parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://api2.bags.fm/api/v1/token-launch/creator/v2?tokenMint=${tokenMint}`
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch creator data: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error proxying creator request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creator data' },
      { status: 500 }
    )
  }
}