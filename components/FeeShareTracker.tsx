import { useState } from 'react'
import { RefreshCw, Wallet, Search } from 'lucide-react'

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

interface FeeShareTrackerProps {
  isOpen: boolean
  onClose: () => void
  availableTokens?: Array<{
    tokenAddress: string
    tokenName: string
    tokenSymbol: string
  }>
}

export const FeeShareTracker = ({ isOpen, onClose, availableTokens = [] }: FeeShareTrackerProps) => {
  if (!isOpen) return null
  const [results, setResults] = useState<TokenFeeShareData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenAddress, setTokenAddress] = useState('')
  const [showInput, setShowInput] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTokenSearch, setShowTokenSearch] = useState(false)





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

  const handleTokenSelect = (token: { tokenAddress: string; tokenSymbol: string; tokenName: string }) => {
    setTokenAddress(token.tokenAddress)
    setShowTokenSearch(false)
    setSearchQuery('')
  }

  const filteredTokens = availableTokens.filter(token =>
    token.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.tokenAddress.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-background/95 backdrop-blur-xl border border-white/20 rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-white/20 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Fee Share Wallet Tracker</span>
            <span className="sm:hidden">Fee Wallet Search</span>
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="glass-effect rounded-lg p-4 sm:p-6">

        
        <p className="text-muted-foreground mb-4">
          Track fee share wallets for tokens by finding BagsApp fee wallets through their X accounts.
        </p>
        
        <div className="space-y-4">
          {showInput && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter token contract address (CA)"
                  className="flex-1 px-3 sm:px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
                />
                <button
                  onClick={handleTrackSingleToken}
                  disabled={loading || !tokenAddress.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-bold text-sm sm:text-base whitespace-nowrap"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  Track
                </button>
              </div>
              
              {availableTokens.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTokenSearch(!showTokenSearch)}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      {showTokenSearch ? 'Hide' : 'Search'} our list ({availableTokens.length})
                    </button>
                  </div>
                  
                  {showTokenSearch && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tokens by symbol, name, or address..."
                        className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary transition-colors text-sm"
                      />
                      
                      <div className="max-h-32 sm:max-h-48 overflow-y-auto space-y-1">
                        {filteredTokens.slice(0, 20).map((token) => (
                          <button
                            key={token.tokenAddress}
                            onClick={() => handleTokenSelect(token)}
                            className="w-full text-left p-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                              <div>
                                <p className="text-white font-medium text-sm">{token.tokenSymbol}</p>
                                <p className="text-muted-foreground text-xs">{token.tokenName}</p>
                              </div>
                              <p className="text-muted-foreground text-xs font-mono">
                                {token.tokenAddress.slice(0, 8)}...{token.tokenAddress.slice(-6)}
                              </p>
                            </div>
                          </button>
                        ))}
                        {filteredTokens.length === 0 && searchQuery && (
                          <p className="text-muted-foreground text-sm p-2">No tokens found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div>
                  <h4 className="font-bold text-white text-base sm:text-lg">
                    {token.tokenSymbol} ({token.tokenName})
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all">
                    {token.tokenAddress}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-white text-sm sm:text-base">
                    {token.totalWallets} Fee Share Wallet{token.totalWallets !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {token.feeShareWallets.length > 0 ? (
                <div className="space-y-3">
                  {token.feeShareWallets.map((wallet, walletIndex) => (
                    <div key={wallet.walletAddress} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`https://x.com/${wallet.twitterUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer hover:underline"
                              title="View X profile"
                            >
                              @{wallet.twitterUsername}
                            </a>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                              {wallet.royaltyPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(wallet.walletAddress)}
                            className="text-xs sm:text-sm text-muted-foreground font-mono break-all hover:text-white transition-colors cursor-pointer hover:underline"
                            title="Copy wallet address"
                          >
                            {wallet.walletAddress}
                          </button>
                        </div>
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
      </div>
    </div>
  )
} 