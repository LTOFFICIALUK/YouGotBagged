'use client'

import { useState, useEffect, useMemo } from 'react'
import { UnclaimedFee, getUnclaimedFees, getTotalUnclaimedValue, testBagsAPI } from '@/lib/bags-api'
import { formatCurrency, getRelativeTime } from '@/lib/utils'
import { TokenCard } from '@/components/TokenCard'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { FeeShareTracker } from '@/components/FeeShareTracker'
// import { FeeAnalyzer } from '@/components/FeeAnalyzer'

import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search as SearchIcon,
  X as CloseIcon,
  Filter as FilterIcon,
} from 'lucide-react'
import { getTokenClaimedFees } from '@/lib/bagscreener-api'

export default function Dashboard() {
  const [unclaimedFees, setUnclaimedFees] = useState<UnclaimedFee[]>([])
  const [totalValue, setTotalValue] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [showFeeShareTracker, setShowFeeShareTracker] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showZeroOnly, setShowZeroOnly] = useState<boolean>(false)
  const [claimedMap, setClaimedMap] = useState<Record<string, number | undefined>>({})
  const [loadingZeroFilter, setLoadingZeroFilter] = useState<boolean>(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchData()
    } finally {
      setRefreshing(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Test API connectivity first
      console.log('Testing API connectivity...')
      const apiTest = await testBagsAPI()
      console.log('API test result:', apiTest)
      
      const fees = await getUnclaimedFees()
      
      console.log('Fetched fees:', fees)
      
      // Calculate total value by summing all lifetime fees USD (Total Raised)
      const total = fees.reduce((sum, fee) => sum + (fee.lifetimeFeesUSD || fee.totalFees || 0), 0)
      console.log('Calculated total value:', total)
      
      setUnclaimedFees(fees)
      setTotalValue(total)
    } catch (err) {
      setError('Failed to fetch unclaimed fees. Please try again.')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Fetch claimed percentages when zero filter is enabled
  useEffect(() => {
    const loadClaimed = async () => {
      if (!showZeroOnly) return
      setLoadingZeroFilter(true)
      try {
        const tasks = unclaimedFees
          .filter(f => claimedMap[f.tokenAddress] === undefined)
          .map(async (f) => {
            try {
              const data = await getTokenClaimedFees(f.tokenAddress)
              setClaimedMap(prev => ({ ...prev, [f.tokenAddress]: data?.claimedPercentage ?? 0 }))
            } catch {
              setClaimedMap(prev => ({ ...prev, [f.tokenAddress]: undefined }))
            }
          })
        await Promise.allSettled(tasks)
      } finally {
        setLoadingZeroFilter(false)
      }
    }
    loadClaimed()
  }, [showZeroOnly, unclaimedFees])

  const filteredFees = useMemo(() => {
    let list = unclaimedFees
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(fee => {
        const fields = [fee.tokenName, fee.tokenSymbol, fee.tokenAddress]
        return fields.some(v => (v || '').toLowerCase().includes(q))
      })
    }
    if (showZeroOnly) {
      list = list.filter(f => claimedMap[f.tokenAddress] === 0)
    }
    return list
  }, [searchQuery, unclaimedFees, showZeroOnly, claimedMap])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading bags tokens...</p>
        </div>
      </div>
    )
  }

    return (
    <div className="min-h-screen bg-background">
      <Header onOpenFeeTracker={() => setShowFeeShareTracker(true)} />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Raised</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="glass-effect rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">BagsApp Tokens Displayed</p>
                <p className="text-2xl font-bold text-white">
                  {unclaimedFees.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="glass-effect rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Last Updated</p>
                <p className="text-2xl font-bold text-white">
                  {getRelativeTime(new Date().toISOString())}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>



        {/* Fee Claim Analysis - Temporarily Hidden */}
        {/* <div className="mb-8">
          <FeeAnalyzer />
        </div> */}

        {/* Total Raised List */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Total Raised</h2>
            <button
              type="button"
              onClick={() => setShowZeroOnly(v => !v)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${showZeroOnly ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent text-foreground border-border/60 hover:bg-white/5'}`}
              aria-pressed={showZeroOnly}
            >
              <FilterIcon className="h-4 w-4" />
              0% Claimed
              {showZeroOnly && loadingZeroFilter && <Loader2 className="h-4 w-4 animate-spin" />}
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1200px] space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, symbol, or address"
                  aria-label="Search tokens"
                  role="searchbox"
                  className="w-full bg-[#15171A] border border-border/60 rounded-lg pl-9 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-transparent focus:border-border"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5"
                  >
                    <CloseIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {filteredFees.length === 0 ? (
                <div className="glass-effect rounded-lg p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No matches</h3>
                  <p className="text-muted-foreground">
                    {showZeroOnly ? 'No tokens with 0% claimed were found.' : 'Try a different search term.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredFees.map((fee) => (
                    <TokenCard 
                      key={fee.tokenAddress} 
                      fee={fee}
                      onClaim={(tokenAddress) => {
                        console.log('Successfully claimed fees for token:', tokenAddress)
                        // Refresh the data after successful claim
                        fetchData()
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fee Share Tracker Popup */}
      <FeeShareTracker 
        isOpen={showFeeShareTracker}
        onClose={() => setShowFeeShareTracker(false)}
        availableTokens={unclaimedFees.map(fee => ({
          tokenAddress: fee.tokenAddress,
          tokenName: fee.tokenName,
          tokenSymbol: fee.tokenSymbol
        }))}
      />
    </div>
  )
} 