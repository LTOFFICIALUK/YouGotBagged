import { UnclaimedFee, claimFees } from '@/lib/bags-api'
import { formatNumber, truncateAddress } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { getTokenClaimedFees } from '@/lib/bagscreener-api'

interface Creator {
  username: string
  pfp: string
  twitterUsername: string
  royaltyBps: number
  isCreator: boolean
  wallet: string
}

interface TokenCardProps {
  fee: UnclaimedFee
  onClaim?: (tokenAddress: string) => void
}

interface CreatorEarning {
  tokenSymbol: string
  calculatedEarnings: number
}

export const TokenCard = ({ fee, onClaim }: TokenCardProps) => {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loadingCreators, setLoadingCreators] = useState(false)
  const [claimedPercentage, setClaimedPercentage] = useState<number | null>(null)
  const [loadingClaimed, setLoadingClaimed] = useState(false)
  const [claimedError, setClaimedError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCreators = async () => {
      setLoadingCreators(true)
      try {
        const response = await fetch(
          `/api/proxy/creator?tokenMint=${fee.tokenAddress}`
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch creator data: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.response) {
          setCreators(data.response)
        } else {
          throw new Error('Failed to fetch creator data')
        }
      } catch (error) {
        console.error('Failed to fetch creators:', error)
      } finally {
        setLoadingCreators(false)
      }
    }

    fetchCreators()
  }, [fee.tokenAddress])

  const fetchClaimedPercentage = async (quick: boolean = true) => {
    setLoadingClaimed(true)
    setClaimedError(null)
    
    try {
      // Get claimed fees data from Bagscreener
      const claimedData = await getTokenClaimedFees(fee.tokenAddress)
      
      if (!claimedData) {
        setClaimedError('Failed to fetch claimed fees data')
        return
      }

      setClaimedPercentage(claimedData.claimedPercentage)
    } catch (error) {
      console.error('Error calculating claimed percentage:', error)
      setClaimedError('Failed to calculate claimed percentage')
    } finally {
      setLoadingClaimed(false)
    }
  }

  // Auto-fetch quick estimate on component mount
  useEffect(() => {
    fetchClaimedPercentage(true)
  }, [fee.tokenAddress])

  const handlePost = () => {
    // Only include creators with royalty > 0, sorted by highest percentage first
    const creatorUsernames = creators
      .filter(creator => creator.royaltyBps > 0)
      .sort((a, b) => b.royaltyBps - a.royaltyBps)
      .map(creator => `@${creator.twitterUsername}`)
      .join(' ')
    
    const postText = `Hey ${creatorUsernames || `@${fee.tokenSymbol}`} you have generated $${fee.unclaimedAmount.toFixed(2)} in fees from $${fee.tokenSymbol} launched on @bagsapp! Have you claimed them yet?

DM @YouGotBagged to claim your funds! 💰🫵`
    
    const encodedText = encodeURIComponent(postText)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
    
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="glass-effect rounded-lg p-4 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {fee.imageUrl ? (
            <img 
              src={fee.imageUrl} 
              alt={fee.tokenName}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {fee.tokenSymbol.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-bold text-white text-lg">
                {fee.tokenSymbol}
                {fee.priceChange24h !== undefined && fee.priceChange24h !== null && (
                  <span className={`ml-2 text-sm font-medium ${
                    Number(fee.priceChange24h) > 0 ? 'text-green-500' : 
                    Number(fee.priceChange24h) < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {Number(fee.priceChange24h) > 0 ? '+' : ''}{Number(fee.priceChange24h).toFixed(2)}%
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigator.clipboard.writeText(fee.tokenAddress)}
                  className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  title="Copy contract address"
                >
                  {truncateAddress(fee.tokenAddress)}
                </button>
                <span className="text-muted-foreground">•</span>
                {loadingCreators ? (
                  <p className="text-sm text-muted-foreground">Loading creators...</p>
                ) : creators.length > 0 ? (
                  <div className="flex items-center gap-1">
                    {creators
                      .filter(creator => creator.royaltyBps > 0)
                      .sort((a, b) => b.royaltyBps - a.royaltyBps)
                      .map((creator, index) => (
                        <div key={creator.wallet} className="flex items-center gap-1">
                          <a
                            href={`https://x.com/${creator.twitterUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            @{creator.twitterUsername}
                          </a>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(creator.royaltyBps / 100)}%)
                          </span>
                          {index < creators.filter(c => c.royaltyBps > 0).length - 1 && (
                            <span className="text-muted-foreground">•</span>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">BAGS</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
                <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-semibold text-white">
              {fee.marketCap && fee.marketCap !== null && Number(fee.marketCap) > 0 
                ? Number(fee.marketCap) >= 1000000 
                  ? `$${formatNumber(Number(fee.marketCap) / 1000000, 2)}M`
                  : `$${formatNumber(Number(fee.marketCap) / 1000, 1)}K`
                : `$${formatNumber(fee.totalFees / 1000000, 2)}M`
              } <span className="text-muted-foreground font-normal">MCAP</span>
            </p>
            {fee.volume24h !== undefined && fee.volume24h !== null && Number(fee.volume24h) > 0 && (
              <p className="text-xs text-muted-foreground">
                Vol: ${Number(fee.volume24h) >= 1000000 
                  ? `${formatNumber(Number(fee.volume24h) / 1000000, 1)}M`
                  : Number(fee.volume24h) >= 1000
                    ? `${formatNumber(Number(fee.volume24h) / 1000, 1)}K`
                    : formatNumber(Number(fee.volume24h), 0)}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="font-semibold text-white">
              Total Raised
            </p>
            {fee.lifetimeFeesUSD && fee.lifetimeFeesUSD > 0 && (
              <p className="text-xs text-muted-foreground">
                ${formatNumber(fee.lifetimeFeesUSD, 0)} USD
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="font-semibold text-white">
              Claimed
            </p>
            {loadingClaimed ? (
              <div className="flex items-center justify-end gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : claimedError ? (
              <div className="text-right">
                <p className="text-xs text-red-400">Error</p>
                <button
                  onClick={() => fetchClaimedPercentage(true)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Retry
                </button>
              </div>
            ) : claimedPercentage !== null ? (
              <div className="text-right">
                <p className={`text-xs ${
                  claimedPercentage <= 20 
                    ? 'text-green-400 font-semibold' 
                    : claimedPercentage <= 50 
                      ? 'text-blue-400 font-medium'
                      : 'text-muted-foreground'
                }`}>
                  {claimedPercentage.toFixed(1)}%
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Unknown
              </p>
            )}
          </div>
          
          <button 
            onClick={handlePost}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
} 