import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('Simple OAuth Callback - Code:', code ? 'present' : 'missing')
  console.log('Simple OAuth Callback - State:', state ? 'present' : 'missing')
  console.log('Simple OAuth Callback - Error:', error)
  console.log('Simple OAuth Callback - Error Description:', error_description)

  if (error) {
    console.error('Simple OAuth Error Details:', { error, error_description })
    return NextResponse.redirect(`https://yougotbagged.fun?error=${error}&description=${error_description || 'Unknown error'}`)
  }

  if (!code) {
    return NextResponse.redirect(`https://yougotbagged.fun?error=no_code`)
  }

  // For now, just redirect back with success to test if the OAuth flow works
  return NextResponse.redirect(`https://yougotbagged.fun?auth=success&test=simple`)
} 