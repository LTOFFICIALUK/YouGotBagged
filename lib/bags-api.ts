// Types for unclaimed fees
export interface UnclaimedFee {
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  unclaimedAmount: number
  totalFees: number
  lastClaimed?: string
  imageUrl?: string
  positionId?: string
  marketCap?: number
  price?: number
  volume24h?: number
  priceChange24h?: number
  priceChange1h?: number
  priceChange6h?: number
  lastUpdated?: string
  topPoolLiquidity?: number
}

// Types for creator information
export interface Creator {
  username: string
  pfp: string
  twitterUsername: string
  royaltyBps: number
  isCreator: boolean
  wallet: string
}

export interface CreatorResponse {
  success: boolean
  response: Creator[]
}

// Client-side API functions that call our Next.js API routes
const callApiRoute = async (action: string) => {
  const response = await fetch(`/api/bags?action=${action}`)
  
  if (!response.ok) {
    throw new Error(`API route error: ${response.status}`)
  }
  
  return response.json()
}

// Enhanced mock data for development/testing
const mockUnclaimedFees: UnclaimedFee[] = [
  {
    tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenName: 'Sample Token 1',
    tokenSymbol: 'ST1',
    unclaimedAmount: 1250.50,
    totalFees: 2500000.00, // $2.5M MCAP
    lastClaimed: '2024-01-15T10:30:00Z',
    imageUrl: 'https://via.placeholder.com/48/3b82f6/ffffff?text=ST1',
    positionId: 'pos_1'
  },
  {
    tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tokenName: 'Sample Token 2',
    tokenSymbol: 'ST2',
    unclaimedAmount: 875.25,
    totalFees: 1100000.00, // $1.1M MCAP
    lastClaimed: '2024-01-10T14:20:00Z',
    imageUrl: 'https://via.placeholder.com/48/10b981/ffffff?text=ST2',
    positionId: 'pos_2'
  },
  {
    tokenAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    tokenName: 'Sample Token 3',
    tokenSymbol: 'ST3',
    unclaimedAmount: 2100.75,
    totalFees: 3000000.00, // $3.0M MCAP
    imageUrl: 'https://via.placeholder.com/48/f59e0b/ffffff?text=ST3',
    positionId: 'pos_3'
  }
]

// Test function to check API connectivity
export const testBagsAPI = async () => {
  try {
    console.log('Testing Bags API connectivity via our API route...')
    const result = await callApiRoute('test')
    console.log('API test result:', result)
    return result
  } catch (error) {
    console.error('API test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Function to fetch creator information for a token
export const getTokenCreators = async (tokenMint: string): Promise<Creator[]> => {
  try {
    console.log('Fetching creator information for token:', tokenMint)
    
    const response = await fetch(`https://api2.bags.fm/api/v1/token-launch/creator/v2?tokenMint=${tokenMint}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch creator data: ${response.status}`)
    }
    
    const data: CreatorResponse = await response.json()
    
    if (data.success && data.response) {
      console.log('Creator data fetched successfully:', data.response)
      return data.response
    } else {
      console.error('Failed to fetch creator data:', data)
      return []
    }
    
  } catch (error) {
    console.error('Error fetching creator data:', error)
    return []
  }
}

// Helper function to get all tokens with unclaimed fees
export const getUnclaimedFees = async (forceRealData: boolean = true): Promise<UnclaimedFee[]> => {
  try {
    console.log('Fetching unclaimed fees via API route...')
    
    const result = await callApiRoute('unclaimed-fees')
    
    if (result.success) {
      console.log('Unclaimed fees fetched successfully:', result.data)
      return result.data
    } else {
      console.error('Failed to fetch unclaimed fees:', result.error)
      return []
    }
    
  } catch (error) {
    console.error('Error fetching unclaimed fees:', error)
    
    // Only return mock data if explicitly requested and not forcing real data
    if (!forceRealData && process.env.NODE_ENV === 'development') {
      console.log('Development mode: returning mock data as fallback')
      return mockUnclaimedFees
    }
    
    // Return empty array instead of mock data
    console.log('Returning empty array due to API error - no mock data')
    return []
  }
}

// Helper function to claim fees for a specific token
export const claimFees = async (tokenAddress: string, positionId: string): Promise<boolean> => {
  try {
    console.log(`Claiming fees for token ${tokenAddress}, position ${positionId}`)
    
    // For now, simulate successful claim since we don't have a claim endpoint yet
    console.log('Simulating successful claim for demo')
    return true
  } catch (error) {
    console.error('Error claiming fees:', error)
    return false
  }
}

// Helper function to get total unclaimed fees value
export const getTotalUnclaimedValue = async (): Promise<number> => {
  try {
    const result = await callApiRoute('total-value')
    
    if (result.success) {
      console.log('Total unclaimed value:', result.total)
      return result.total
    } else {
      console.error('Failed to fetch total value:', result.error)
      return 0
    }
  } catch (error) {
    console.error('Error calculating total unclaimed value:', error)
    return 0
  }
}

// Helper function to get all available tokens from Bags API
export const getAvailableTokens = async () => {
  try {
    console.log('Fetching available tokens via API route...')
    
    const result = await callApiRoute('available-tokens')
    
    if (result.success) {
      console.log('Available tokens fetched successfully:', result.data)
      return result.data
    } else {
      console.error('Failed to fetch available tokens:', result.error)
      return []
    }
  } catch (error) {
    console.error('Error fetching available tokens:', error)
    return []
  }
}

// Helper function to test which tokens work with the Bags SDK
export const testTokens = async () => {
  try {
    console.log('Testing tokens via API route...')
    
    const result = await callApiRoute('test-tokens')
    
    if (result.success) {
      console.log('Token test results:', result)
      return result
    } else {
      console.error('Failed to test tokens:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error testing tokens:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper function to get user wallet info
export const getUserWalletInfo = async () => {
  try {
    // For now, return mock user info
    return {
      address: '0x1234...5678',
      balance: 0,
      solBalance: 0
    }
  } catch (error) {
    console.warn('Failed to fetch user info:', error)
    return {
      address: '0x1234...5678',
      balance: 0,
      solBalance: 0
    }
  }
} 