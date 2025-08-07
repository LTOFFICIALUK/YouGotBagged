import { createClient } from '@supabase/supabase-js'

interface CreatorResponse {
  username: string
  pfp: string
  twitterUsername: string
  royaltyBps: number
  isCreator: boolean
  wallet: string
}

interface CreatorData {
  success: boolean
  response: CreatorResponse[]
}

export async function getCreatorWallets(tokenMint: string): Promise<CreatorResponse[]> {
  try {
    console.log(`🔍 Looking up creators for ${tokenMint}...`)
    
    const response = await fetch(
      `https://api2.bags.fm/api/v1/token-launch/creator/v2?tokenMint=${tokenMint}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch creator data: ${response.status}`)
    }

    const data: CreatorData = await response.json()

    if (data.success && Array.isArray(data.response)) {
      // Log what we found
      console.log(`Found ${data.response.length} creators:`)
      data.response.forEach(creator => {
        console.log(`   @${creator.twitterUsername}: ${creator.wallet} (${creator.royaltyBps/100}%)`)
      })

      return data.response
    }

    return []
  } catch (error) {
    console.error('Error fetching creator data:', error)
    return []
  }
}