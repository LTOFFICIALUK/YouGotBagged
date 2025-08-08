import { useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity, Calendar } from 'lucide-react'

interface SolTransaction {
  signature: string
  blockTime: number
  date: string
  type: 'deposit' | 'withdrawal'
  amount: number
  amountLamports: number
  fromAddress?: string
  toAddress?: string
  programId?: string
  isProgramInteraction: boolean
  isMeteoraInteraction: boolean
}

interface WalletAnalysis {
  walletAddress: string
  twitterUsername: string
  tokenAddress: string
  tokenSymbol: string
  royaltyPercentage: number
  calculatedEarnings: number
  totalWithdrawals: number
  remainingBalance: number
  withdrawalCount: number
  withdrawalTransactions: SolTransaction[]
  lastWithdrawal: string | null
  netBalance: number
  transactionCount: number
  totalDeposits: number
  meteoraDeposits: number
  meteoraTransactionCount: number
  lastActivity: string | null
  transactions: SolTransaction[]
}

interface TokenFeeAnalysis {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  totalFeesEarned: number
  totalCreators: number
  totalCalculatedEarnings: number
  totalWithdrawalsAcrossCreators: number
  totalRemainingAcrossCreators: number
  creatorAnalyses: WalletAnalysis[]
}

export const FeeAnalyzer = () => {
  const [analysis, setAnalysis] = useState<TokenFeeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenAddress, setTokenAddress] = useState('')
  const [totalFeesSOL, setTotalFeesSOL] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleAnalyzeClick = () => {
    setShowInput(true)
    setError(null)
    setAnalysis(null)
  }

  const handleAnalyze = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token contract address')
      return
    }

    if (!totalFeesSOL.trim() || parseFloat(totalFeesSOL) <= 0) {
      setError('Please enter the total fees earned by this token in SOL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`🔍 Starting withdrawal analysis for: ${tokenAddress}`)
      console.log(`📊 Total token fees: ${totalFeesSOL} SOL`)
      
      const response = await fetch(
        `/api/analyze-fees?tokenAddress=${tokenAddress}&totalFeesSOL=${totalFeesSOL}&maxTransactions=500`
      )
      const data = await response.json()

      if (data.success) {
        setAnalysis(data.data)
        console.log('✅ Withdrawal analysis completed:', data.data)
      } else {
        setError(data.error || 'Failed to analyze fees')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error analyzing fees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const formatSOL = (amount: number) => {
    return `${amount.toFixed(4)} SOL`
  }

  const formatUSD = (solAmount: number, solPrice: number = 200) => {
    return `$${(solAmount * solPrice).toLocaleString()}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Fee Claim Analysis
        </h2>
        
        <p className="text-muted-foreground mb-4">
          Analyze withdrawals from creator fee share wallets. We calculate earnings from token data and track actual withdrawals.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleAnalyzeClick}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors font-bold"
          >
            <Activity className="h-4 w-4" />
            Analyze Token Fees
          </button>
          
          {showInput && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Token contract address (CA)"
                  className="md:col-span-2 px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={totalFeesSOL}
                  onChange={(e) => setTotalFeesSOL(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Total fees in SOL"
                  className="px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !tokenAddress.trim() || !totalFeesSOL.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-bold"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                Analyze Withdrawals
              </button>
              <p className="text-sm text-muted-foreground">
                Enter the token address and total fees earned. We'll calculate each creator's share and track their withdrawals.
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

      {analysis && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Should Have Earned</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatSOL(analysis.totalCalculatedEarnings)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatUSD(analysis.totalCalculatedEarnings)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Actually Withdrawn</p>
                  <p className="text-xl font-bold text-red-400">
                    {formatSOL(analysis.totalWithdrawalsAcrossCreators)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatUSD(analysis.totalWithdrawalsAcrossCreators)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Still Available</p>
                  <p className="text-xl font-bold text-white">
                    {formatSOL(analysis.totalRemainingAcrossCreators)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatUSD(analysis.totalRemainingAcrossCreators)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Creators</p>
                  <p className="text-xl font-bold text-white">
                    {analysis.totalCreators}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fee recipients
                  </p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Token Info */}
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {analysis.tokenSymbol} ({analysis.tokenName})
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {analysis.tokenAddress}
            </p>
          </div>

          {/* Creator Analysis */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Creator Breakdown</h3>
            
            {analysis.creatorAnalyses.map((creator, index) => (
              <div key={creator.walletAddress} className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-white text-lg flex items-center gap-2">
                      @{creator.twitterUsername}
                      <a
                        href={`https://x.com/${creator.twitterUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Profile
                      </a>
                    </h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {creator.walletAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      Net: {formatSOL(creator.netBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {creator.transactionCount} transactions
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="font-semibold text-green-400">
                      {formatSOL(creator.totalDeposits)}
                    </p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                    <p className="font-semibold text-red-400">
                      {formatSOL(creator.totalWithdrawals)}
                    </p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Meteora Deposits</p>
                    <p className="font-semibold text-blue-400">
                      {formatSOL(creator.meteoraDeposits)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {creator.meteoraTransactionCount} txns
                    </p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-semibold text-white">
                      {formatDate(creator.lastActivity)}
                    </p>
                  </div>
                </div>

                {creator.transactions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-white mb-2">Recent Transactions</h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {creator.transactions.slice(0, 10).map((tx, txIndex) => (
                        <div key={tx.signature} className="flex items-center justify-between p-2 bg-black/10 rounded text-sm">
                          <div className="flex items-center gap-2">
                            {tx.type === 'deposit' ? (
                              <TrendingUp className="h-3 w-3 text-green-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-400" />
                            )}
                            <span className={tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                              {tx.type === 'deposit' ? '+' : '-'}{formatSOL(tx.amount)}
                            </span>
                            {tx.isMeteoraInteraction && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1 rounded">
                                Meteora
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">
                              {formatDate(tx.date)}
                            </p>
                            <a
                              href={`https://solscan.io/tx/${tx.signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              View Tx
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}