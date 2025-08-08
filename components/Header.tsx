"use client"

import Image from 'next/image'
import { Wallet, Twitter, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { UserSession } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

interface HeaderProps {
  onOpenFeeTracker?: () => void
}

export const Header = ({ onOpenFeeTracker }: HeaderProps) => {
  const { user, login, isAuthenticated } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check for auth success in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const userData = urlParams.get('user')
    
    if (authStatus === 'success' && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData))
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        // The user will be automatically logged in via the auth hook
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleConnectX = async () => {
    try {
      setIsConnecting(true)
      
      // Get OAuth URL (try simple version first)
      const response = await fetch('/api/auth/x/simple?action=login')
      const data = await response.json()
      
      if (data.authUrl) {
        // Open OAuth in new tab
        window.open(data.authUrl, '_blank')
        setIsConnecting(false)
        // Show message to user
        alert('OAuth window opened in new tab. Please complete the authorization and return here.')
      } else if (data.error) {
        alert(`OAuth Error: ${data.error}`)
        setIsConnecting(false)
      }
    } catch (error) {
      console.error('Error connecting to X:', error)
      setIsConnecting(false)
    }
  }

  const handlePost = async () => {
    if (!isAuthenticated || !user) {
      alert('Please connect your X account first')
      return
    }

    try {
      setIsPosting(true)
      
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ twitterId: user.twitter_id })
      })

      const data = await response.json()

      if (data.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        // Optionally refresh the page or update leaderboard
        window.location.reload()
      } else {
        alert(data.error || 'Failed to post to leaderboard')
      }
    } catch (error) {
      console.error('Error posting to leaderboard:', error)
      alert('Failed to post to leaderboard')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <header>
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Go to home" className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="YouGotBagged Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </Link>
          
          <div className="flex items-center gap-4">
            {onOpenFeeTracker && (
              <button
                onClick={onOpenFeeTracker}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-bold"
              >
                <Wallet className="h-4 w-4" />
                Fee Wallet Search
              </button>
            )}
            
            {!isAuthenticated ? (
              <button
                onClick={handleConnectX}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-bold disabled:opacity-50"
              >
                <Twitter className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect X'}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.profile_image_url || '/Logo.png'}
                    alt={`${user?.twitter_username || 'User'}'s profile`}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/Logo.png'
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    @{user?.twitter_username || 'user'}
                  </span>
                </div>
                
                <button
                  onClick={handlePost}
                  disabled={isPosting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-bold disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {showSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            {isAuthenticated ? 'Post added to leaderboard successfully!' : 'Successfully connected to X!'}
          </div>
        )}
      </div>
    </header>
  )
} 