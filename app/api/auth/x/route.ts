import { NextRequest, NextResponse } from 'next/server'
import { storeUserSession } from '@/lib/supabase'

const X_CLIENT_ID = process.env.X_CLIENT_ID
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET
const REDIRECT_URI = 'https://yougotbagged.fun/api/auth/x/callback'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'login') {
    // Check if environment variables are set
    if (!X_CLIENT_ID) {
      console.error('X_CLIENT_ID environment variable is not set')
      return NextResponse.json({ 
        error: 'OAuth configuration error. Please check environment variables.' 
      }, { status: 500 })
    }

    if (!X_CLIENT_SECRET) {
      console.error('X_CLIENT_SECRET environment variable is not set')
      return NextResponse.json({ 
        error: 'OAuth configuration error. Please check environment variables.' 
      }, { status: 500 })
    }

    // Generate OAuth URL for X
    const state = Math.random().toString(36).substring(7)
    const authUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${X_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent('tweet.read users.read offline.access')}&` +
      `state=${state}`

    return NextResponse.json({ authUrl })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: 'challenge' // In production, use PKCE
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData)
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 })
    }

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error('User info fetch failed:', userData)
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 400 })
    }

    const user = userData.data

    // Store user session
    await storeUserSession({
      twitter_id: user.id,
      twitter_username: user.username,
      profile_image_url: user.profile_image_url || '',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        profile_image_url: user.profile_image_url
      }
    })

  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json({ error: 'OAuth authentication failed' }, { status: 500 })
  }
} 