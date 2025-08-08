import { NextRequest, NextResponse } from 'next/server'
import { addLeaderboardPost, getLeaderboard, getUserSession } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const leaderboard = await getLeaderboard(limit)
    
    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { twitterId } = await request.json()

    if (!twitterId) {
      return NextResponse.json({ error: 'Twitter ID required' }, { status: 400 })
    }

    // Get user session to verify authentication
    const userSession = await getUserSession(twitterId)
    
    if (!userSession) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Check if token is expired
    if (Date.now() > userSession.expires_at) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Add post to leaderboard
    await addLeaderboardPost(
      userSession.twitter_id,
      userSession.twitter_username,
      userSession.profile_image_url
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Post added to leaderboard successfully' 
    })

  } catch (error) {
    console.error('Error adding post to leaderboard:', error)
    return NextResponse.json({ error: 'Failed to add post to leaderboard' }, { status: 500 })
  }
} 