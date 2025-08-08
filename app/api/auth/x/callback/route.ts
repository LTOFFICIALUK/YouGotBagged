import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('OAuth Callback - Code:', code ? 'present' : 'missing')
  console.log('OAuth Callback - State:', state ? 'present' : 'missing')
  console.log('OAuth Callback - Error:', error)
  console.log('OAuth Callback - Error Description:', error_description)

  if (error) {
    console.error('OAuth Error Details:', { error, error_description })
    return NextResponse.redirect(`https://yougotbagged.fun?error=${error}&description=${error_description || 'Unknown error'}`)
  }

  if (!code) {
    return NextResponse.redirect(`https://yougotbagged.fun?error=no_code`)
  }

  try {
    // Exchange code for token
    const response = await fetch(`https://yougotbagged.fun/api/auth/x`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, state })
    })

    const data = await response.json()

    if (data.success) {
      // Redirect back to app with success and user data
      const userData = encodeURIComponent(JSON.stringify(data.user))
      return NextResponse.redirect(`https://yougotbagged.fun?auth=success&user=${userData}`)
    } else {
      return NextResponse.redirect(`https://yougotbagged.fun?error=auth_failed`)
    }

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`https://yougotbagged.fun?error=callback_failed`)
  }
} 