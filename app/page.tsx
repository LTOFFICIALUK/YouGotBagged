'use client'

import { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'

export default function Dashboard() {
  const [unclaimedFees, setUnclaimedFees] = useState<UnclaimedFee[]>([])
  const [totalValue, setTotalValue] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [showFeeShareTracker, setShowFeeShareTracker] = useState<boolean>(false)

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
          <h2 className="text-xl font-semibold text-foreground">Total Raised</h2>
          
          {unclaimedFees.length === 0 ? (
            <div className="glass-effect rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Unclaimed Fees</h3>
              <p className="text-muted-foreground">
                All your fees have been claimed! Check back later for new unclaimed fees.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid gap-4" style={{ minWidth: 'max-content' }}>
                {unclaimedFees.map((fee) => (
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
            </div>
          )}
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