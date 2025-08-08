"use client"

import { useState, useEffect } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import { LeaderboardEntry } from '@/lib/supabase'

interface LeaderboardProps {
  limit?: number
  showUserPosition?: boolean
  currentUserId?: string
}

export const Leaderboard = ({ limit = 10, showUserPosition = false, currentUserId }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leaderboard?limit=${limit}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      setLeaderboard(data.leaderboard)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [limit])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-700 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Leaderboard
      </h2>
      
      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
          const rank = index + 1
          const isCurrentUser = currentUserId === entry.twitter_id
          
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                isCurrentUser 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankBadge(rank)}`}>
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex items-center space-x-3">
                  <img
                    src={entry.profile_image_url}
                    alt={`${entry.twitter_username}'s profile`}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/Logo.png'
                    }}
                  />
                  <div>
                    <p className={`font-semibold ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                      @{entry.twitter_username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.post_count} posts
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {entry.total_score} pts
                </p>
                <p className="text-xs text-gray-500">
                  Last: {new Date(entry.last_posted).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      
      {leaderboard.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No posts yet. Be the first to post!</p>
        </div>
      )}
    </div>
  )
} 