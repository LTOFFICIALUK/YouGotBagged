import { NextRequest, NextResponse } from 'next/server'
import { storeUserSession } from '@/lib/supabase'

const X_CLIENT_ID = process.env.X_CLIENT_ID
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET
const REDIRECT_URI = 'https://yougotbagged.fun/api/auth/x/simple/callback'

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

    // Generate simple OAuth URL for X (without PKCE)
    const state = Math.random().toString(36).substring(7)
    const authUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${X_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent('users.read')}&` +
      `state=${state}`

    console.log('Simple OAuth URL:', authUrl)
    console.log('Client ID:', X_CLIENT_ID)
    console.log('Redirect URI:', REDIRECT_URI)

    return NextResponse.json({ authUrl })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
} 