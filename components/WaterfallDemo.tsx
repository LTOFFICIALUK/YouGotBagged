'use client'

import React, { useState } from 'react'
import { Activity, TrendingUp, Wallet, DollarSign } from 'lucide-react'

interface CreatorTokenEarning {
  tokenAddress: string
  tokenSymbol: string
  walletAddress: string
  twitterUsername: string
  calculatedEarnings: number
  claimedAmount: number
  claimedPercentage: number
}

interface WaterfallResult {
  walletAddress: string
  twitterUsername: string
  totalCalculatedEarnings: number
  totalWithdrawn: number
  currentBalance: number
  tokens: CreatorTokenEarning[]
}

export const WaterfallDemo: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WaterfallResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        `/api/waterfall-claims?action=creator-waterfall&walletAddress=${walletAddress}`
      )
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to analyze waterfall claims')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error fetching waterfall analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Waterfall Claims Demo</h2>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Enter a creator's wallet address to see how the waterfall claiming logic works. 
        This will show which tokens get "filled up" first when they withdraw SOL.
      </p>

      {/* Input Section */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Creator Wallet Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="6HfyHKMVzNFr7FR8qTDfEPGRBG5aonmwmP2SpZZcoDAQ"
              className="flex-1 px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary/80 disabled:bg-primary/40 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-blue-400" />
                <p className="text-sm text-muted-foreground">Total Should Earn</p>
              </div>
              <p className="text-lg font-semibold text-white">
                {result.totalCalculatedEarnings.toFixed(4)} SOL
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-red-400" />
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              </div>
              <p className="text-lg font-semibold text-white">
                {result.totalWithdrawn.toFixed(4)} SOL
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <p className="text-sm text-muted-foreground">Current Balance</p>
              </div>
              <p className="text-lg font-semibold text-white">
                {result.currentBalance.toFixed(4)} SOL
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <p className="text-sm text-muted-foreground">Overall Claimed</p>
              </div>
              <p className="text-lg font-semibold text-white">
                {result.totalCalculatedEarnings > 0 
                  ? ((result.totalWithdrawn / result.totalCalculatedEarnings) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Creator Information</h3>
            <p className="text-muted-foreground">
              <strong>Twitter:</strong> @{result.twitterUsername}
            </p>
            <p className="text-muted-foreground">
              <strong>Wallet:</strong> {result.walletAddress}
            </p>
          </div>

          {/* Waterfall Explanation */}
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              🌊 Waterfall Logic Explanation
            </h3>
            <p className="text-muted-foreground mb-4">
              When creators withdraw SOL, we assume they claim from their smallest earnings first:
            </p>
            
            {result.tokens.length > 0 ? (
              <div className="space-y-3">
                {result.tokens
                  .sort((a, b) => a.calculatedEarnings - b.calculatedEarnings)
                  .map((token, index) => (
                    <div 
                      key={token.tokenAddress}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">${token.tokenSymbol}</p>
                          <p className="text-sm text-muted-foreground">
                            Should earn: {token.calculatedEarnings.toFixed(4)} SOL
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-700 rounded-full h-2 w-24">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                token.claimedPercentage === 100 
                                  ? 'bg-green-500' 
                                  : token.claimedPercentage > 0 
                                  ? 'bg-yellow-500' 
                                  : 'bg-gray-600'
                              }`}
                              style={{ width: `${Math.min(100, token.claimedPercentage)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12 text-right">
                            {token.claimedPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Claimed: {token.claimedAmount.toFixed(4)} SOL
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No tokens found for this creator.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WaterfallDemo