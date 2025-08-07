# Fee Claim Analysis System

This system provides comprehensive analysis of SOL deposits and withdrawals for creator fee share wallets, helping you understand exactly how much in fees has been claimed by creators for specific tokens.

## What It Does

1. **Finds Fee Share Wallets**: Uses our existing fee share tracker to find creator wallets
2. **Analyzes All SOL Transactions**: Examines every SOL deposit and withdrawal
3. **Identifies Meteora Interactions**: Specifically tracks fee claims from Meteora
4. **Calculates Net Balances**: Shows total earned vs. total withdrawn

## Key Features

### 📊 **Comprehensive Analysis**
- Total SOL earned by each creator
- Total SOL withdrawn by each creator  
- Net remaining balance in wallets
- Meteora-specific fee claims
- Transaction history with timestamps

### 🔍 **Smart Filtering**
- Only analyzes creators with >0% royalty
- Identifies Meteora program interactions
- Filters deposit vs. withdrawal transactions
- Pre-filtering to avoid rate limits

### 🆓 **Uses Free Solana RPC**
- No API costs - uses public Solana RPC
- Built-in rate limiting to stay within limits
- Efficient batch processing

## Usage

### 1. UI Component (Easiest)

Use the `FeeAnalyzer` component in your app:

```tsx
import { FeeAnalyzer } from '@/components/FeeAnalyzer'

// In your component
<FeeAnalyzer />
```

**Steps:**
1. Click "Analyze Token Fees"
2. Enter a token contract address
3. Click "Analyze" 
4. View comprehensive results

### 2. API Route

```bash
GET /api/analyze-fees?tokenAddress=TOKEN_ADDRESS&maxTransactions=1000
```

**Example:**
```bash
curl "http://localhost:3000/api/analyze-fees?tokenAddress=DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
```

### 3. Command Line Script

```bash
npm run analyze-fees TOKEN_ADDRESS
```

**Example:**
```bash
npm run analyze-fees DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
```

### 4. Library Functions

```typescript
import { 
  analyzeWalletTransactions, 
  analyzeTokenFeeClaims 
} from '@/lib/sol-transaction-analyzer'

// Analyze a specific wallet
const walletAnalysis = await analyzeWalletTransactions(
  'WALLET_ADDRESS',
  'twitterUsername', 
  'TOKEN_ADDRESS',
  'TOKEN_SYMBOL'
)

// Analyze entire token
const tokenAnalysis = await analyzeTokenFeeClaims(feeShareData)
```

## Data Structure

### WalletAnalysis
```typescript
interface WalletAnalysis {
  walletAddress: string
  twitterUsername: string
  tokenAddress: string
  tokenSymbol: string
  totalDeposits: number        // Total SOL earned
  totalWithdrawals: number     // Total SOL withdrawn
  netBalance: number           // Remaining in wallet
  transactionCount: number
  transactions: SolTransaction[]
  meteoraDeposits: number      // SOL from Meteora specifically
  meteoraTransactionCount: number
  lastActivity: string | null
}
```

### TokenFeeAnalysis
```typescript
interface TokenFeeAnalysis {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  totalCreators: number
  totalDepositsAcrossCreators: number    // Total earned by all creators
  totalWithdrawalsAcrossCreators: number // Total withdrawn by all creators
  netFeesRemaining: number               // Total still in wallets
  creatorAnalyses: WalletAnalysis[]
}
```

## Example Output

```
=== FEE CLAIM ANALYSIS: BONK ===

Token: BONK (Bonk)
Address: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
Total Creators: 2
Total SOL Earned: 15.2470 SOL
Total SOL Withdrawn: 8.1200 SOL
Net SOL Remaining: 7.1270 SOL

Creator Breakdown:

1. @bonk_inu
   Wallet: 6HfyHKMVzNFr7FR8qTDfEPGRBG5aonmwmP2SpZZcoDAQ
   Total Earned: 12.5000 SOL
   Total Withdrawn: 5.0000 SOL
   Net Remaining: 7.5000 SOL
   Meteora Deposits: 12.5000 SOL (25 txns)
   Total Transactions: 35
   Last Activity: 2024-01-15

2. @bonk_team
   Wallet: 9XQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
   Total Earned: 2.7470 SOL
   Total Withdrawn: 3.1200 SOL
   Net Remaining: -0.3730 SOL
   Meteora Deposits: 2.7470 SOL (8 txns)
   Total Transactions: 15
   Last Activity: 2024-01-10
```

## Technical Details

### Meteora Program Detection
The system identifies Meteora interactions by checking for:
- Known Meteora program IDs in transaction logs
- Keywords like "meteora", "claim", "fee" in logs
- Specific program interactions

### Rate Limiting Strategy
- 100ms delay between individual transactions
- 200ms delay between transaction batches
- 500ms delay between wallet analyses
- Batch size of 10 transactions per RPC call

### SOL Balance Analysis
For each transaction, the system:
1. Compares pre/post SOL balances
2. Identifies if SOL increased (deposit) or decreased (withdrawal)
3. Calculates exact SOL amount transferred
4. Associates with Meteora program interactions

## Files Created

### Core System
- `lib/sol-transaction-analyzer.ts` - Main analysis engine
- `app/api/analyze-fees/route.ts` - API endpoint
- `components/FeeAnalyzer.tsx` - React UI component

### Scripts
- `scripts/analyze-token-fees.ts` - Command line tool

### Documentation
- `docs/fee-claim-analysis.md` - This documentation

## Performance

- **Average analysis time**: 30-60 seconds per token
- **Transactions analyzed**: Up to 1000 per wallet
- **API calls**: ~50-100 per wallet (depending on transaction history)
- **Memory usage**: Low (streaming transaction analysis)

## Limitations

- **Historical data**: Limited by Solana's transaction retention
- **Rate limits**: Solana RPC has limits, but they're generous
- **Transaction detection**: May miss non-standard Meteora interactions
- **SOL price**: Currently uses estimated USD values

## Future Enhancements

1. **Real-time SOL price integration**
2. **Historical SOL price for accurate USD values**
3. **Additional DEX program detection**
4. **Export to CSV/Excel**
5. **Automated monitoring and alerts**
6. **Batch analysis for multiple tokens**

## Troubleshooting

### Common Issues

**"No transactions found"**
- Wallet may be new or inactive
- Transactions may be older than retention period

**"Rate limit exceeded"**
- Reduce maxTransactions parameter
- Add longer delays between analyses

**"Transaction parsing failed"**
- Some complex transactions may not parse correctly
- Usually doesn't affect overall analysis

### Getting Help

Check the console logs for detailed analysis progress and any errors encountered.