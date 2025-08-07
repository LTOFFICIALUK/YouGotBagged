# Fee Share Wallet Tracking System

This system tracks how much SOL has been claimed through bagsapp for each token by finding creator wallets through their X accounts.

## How It Works

1. **Get X Accounts**: Uses the existing creator data from the Bags API to find Twitter usernames for each token
2. **Find Fee Share Wallets**: Calls the Bags API to get the fee share wallet address for each Twitter username
3. **Track Results**: Stores and displays the wallet addresses found for each token

## Files Created

### Core Library
- `lib/fee-share-tracker.ts` - Main tracking functionality
- `app/api/bags/fee-share/route.ts` - API route for fee share tracking
- `components/FeeShareTracker.tsx` - React component for testing

### Scripts
- `scripts/test-fee-share-tracking.ts` - Node.js test script
- `scripts/browser-fee-share-test.js` - Browser console test script

## Usage

### 1. Using the React Component

Add the `FeeShareTracker` component to your app:

```tsx
import { FeeShareTracker } from '@/components/FeeShareTracker'

// In your component
<FeeShareTracker />
```

### 2. Using the API Routes

#### Track all tokens:
```bash
GET /api/bags/fee-share?action=all-tokens
```

#### Track a specific token:
```bash
GET /api/bags/fee-share?action=single-token&tokenAddress=ADDRESS&tokenSymbol=SYMBOL&tokenName=NAME
```

### 3. Using the Library Functions

```typescript
import { 
  trackFeeShareWallets, 
  getTokenFeeShareWallets,
  getFeeShareWallet 
} from '@/lib/fee-share-tracker'

// Track all tokens
const results = await trackFeeShareWallets()

// Track a specific token
const result = await getTokenFeeShareWallets(
  'TOKEN_ADDRESS',
  'TOKEN_SYMBOL', 
  'TOKEN_NAME'
)

// Get fee share wallet for a Twitter username
const wallet = await getFeeShareWallet('twitterUsername')
```

### 4. Browser Console Testing

Load the browser test script and use:

```javascript
// Test a specific token
testFeeShareTracking('TOKEN_ADDRESS', 'SYMBOL', 'NAME')

// Get fee share wallet for a Twitter username
getFeeShareWallet('twitterUsername')
```

## API Endpoints Used

### Bags API Endpoints
- `GET /token-launch/creator/v2?tokenMint={tokenMint}` - Get creator information
- `GET /token-launch/fee-share/wallet/twitter?twitterUsername={username}` - Get fee share wallet

### Required Headers
```
x-api-key: bags_prod_hpcZlGVqjTEOFwgq7sRue9ob19oOEGDP2GEFg2biBE4
```

## Data Structure

### FeeShareWallet
```typescript
interface FeeShareWallet {
  twitterUsername: string
  walletAddress: string
  tokenAddress: string
  tokenSymbol: string
}
```

### TokenFeeShareData
```typescript
interface TokenFeeShareData {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  feeShareWallets: FeeShareWallet[]
  totalWallets: number
}
```

## Rate Limiting

The system includes built-in rate limiting:
- 100ms delay between individual API calls
- 2-second delay between batches of 5 tokens
- Batch processing to avoid overwhelming the API

## Error Handling

- Graceful handling of API failures
- Detailed logging for debugging
- Fallback behavior when creators or wallets aren't found
- Network error handling with user-friendly messages

## Next Steps

Once this system is working, the next step will be to:
1. Track SOL balances for each fee share wallet
2. Calculate total SOL claimed through bagsapp
3. Display comprehensive analytics

## Testing

1. **Component Test**: Use the `FeeShareTracker` component in your app
2. **API Test**: Call the API routes directly
3. **Browser Test**: Use the browser console script
4. **Node Test**: Run the Node.js test script

## Example Output

```
=== FEE SHARE WALLET TRACKING RESULTS ===

1. BONK (Bonk)
   Token Address: 7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs
   Fee Share Wallets: 2
   1. @bonk_inu -> 6HfyHKMVzNFr7FR8qTDfEPGRBG5aonmwmP2SpZZcoDAQ
   2. @bonk_creator -> 9XQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin

Total tokens with fee share wallets: 1
Total fee share wallets found: 2
``` 