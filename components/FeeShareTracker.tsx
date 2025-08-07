import { useState } from 'react'
import { RefreshCw, Wallet, Twitter } from 'lucide-react'

interface FeeShareWallet {
  twitterUsername: string
  walletAddress: string
  tokenAddress: string
  tokenSymbol: string
  royaltyBps: number
  royaltyPercentage: number
}

interface TokenFeeShareData {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  feeShareWallets: FeeShareWallet[]
  totalWallets: number
}

export const FeeShareTracker = () => {
  const [results, setResults] = useState<TokenFeeShareData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenAddress, setTokenAddress] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleTrackAllTokens = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/bags/fee-share?action=all-tokens')
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
        console.log('Fee share tracking results:', data.data)
      } else {
        setError(data.error || 'Failed to track fee share wallets')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error tracking fee share wallets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTestTokenClick = () => {
    setShowInput(true)
    setError(null)
    setResults([])
  }

  const handleTrackSingleToken = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token contract address')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log(`🔍 Starting fee share tracking for token: ${tokenAddress}`)
      
      const response = await fetch(
        `/api/bags/fee-share?action=single-token&tokenAddress=${tokenAddress}&tokenSymbol=TOKEN&tokenName=Token`
      )
      const data = await response.json()
      
      if (data.success) {
        setResults([data.data])
        console.log('✅ Fee share tracking completed:', data.data)
        
        // Log the process for debugging
        if (data.data.feeShareWallets.length > 0) {
          console.log(`Found ${data.data.feeShareWallets.length} fee share wallets:`)
          data.data.feeShareWallets.forEach((wallet: FeeShareWallet, index: number) => {
            console.log(`${index + 1}. @${wallet.twitterUsername} -> ${wallet.walletAddress}`)
          })
        } else {
          console.log('No fee share wallets found for this token')
        }
      } else {
        setError(data.error || 'Failed to track fee share wallets')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error tracking fee share wallets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrackSingleToken()
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Fee Share Wallet Tracker
        </h2>
        
        <p className="text-muted-foreground mb-4">
          Track fee share wallets for tokens by finding creator wallets through their X accounts.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={handleTrackAllTokens}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors font-bold"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Track All Tokens
            </button>
            
            <button
              onClick={handleTestTokenClick}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 disabled:opacity-50 transition-colors font-bold"
            >
              <Twitter className="h-4 w-4" />
              Test a Token
            </button>
          </div>
          
          {showInput && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter token contract address (CA)"
                  className="flex-1 px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleTrackSingleToken}
                  disabled={loading || !tokenAddress.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-bold"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Twitter className="h-4 w-4" />
                  )}
                  Track
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a Solana token contract address to find creator X accounts and their fee share wallets
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">
            Results ({results.length} tokens)
          </h3>
          
          {results.map((token, index) => (
            <div key={token.tokenAddress} className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-white text-lg">
                    {token.tokenSymbol} ({token.tokenName})
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {token.tokenAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {token.totalWallets} Fee Share Wallet{token.totalWallets !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {token.feeShareWallets.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-green-400 font-medium">
                    ✅ Process completed successfully!
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Found {token.feeShareWallets.length} creator{token.feeShareWallets.length !== 1 ? 's' : ''} with fee share wallet{token.feeShareWallets.length !== 1 ? 's' : ''}:
                  </div>
                  {token.feeShareWallets.map((wallet, walletIndex) => (
                    <div key={wallet.walletAddress} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <Twitter className="h-4 w-4 text-blue-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">
                              @{wallet.twitterUsername}
                            </p>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                              {wallet.royaltyPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {wallet.walletAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(wallet.walletAddress)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 bg-blue-500/10 rounded"
                          title="Copy wallet address"
                        >
                          Copy
                        </button>
                        <a
                          href={`https://x.com/${wallet.twitterUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 bg-blue-500/10 rounded"
                          title="View X profile"
                        >
                          View X
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-sm text-yellow-400 font-medium mb-2">
                    ⚠️ No fee share wallets found
                  </div>
                  <p className="text-muted-foreground text-sm">
                    This could mean:
                  </p>
                  <ul className="text-muted-foreground text-sm mt-2 space-y-1">
                    <li>• No creators found for this token</li>
                    <li>• All creators have 0% royalty (can't claim fees)</li>
                    <li>• Creators don't have X accounts linked</li>
                    <li>• No fee share wallets set up for the creators</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 