import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { getFeeShareWallet, getTokenCreators } from '../lib/fee-share-tracker'

// Load environment variables
config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testCaching() {
  // Test with BONK token
  const tokenAddress = '9AigQnqGxMEPX1jzVxDR8sDyUrMcJyHoKeMeqLjGwxsM'
  
  console.log('🧪 Testing wallet caching system...\n')
  
  // 1. First get creators
  console.log('1️⃣ Getting creators for BONK...')
  const creators = await getTokenCreators(tokenAddress)
  console.log(`   Found ${creators.length} creators`)
  
  // 2. Check cache status before
  console.log('\n2️⃣ Checking current cache status...')
  for (const creator of creators) {
    if (creator.twitterUsername) {
      const { data } = await supabase
        .from('wallet_mappings')
        .select('wallet_address')
        .eq('twitter_username', creator.twitterUsername.toLowerCase())
        .single()
      
      console.log(`   @${creator.twitterUsername}: ${data ? 'Cached ✅' : 'Not cached ❌'}`)
    }
  }
  
  // 3. Get wallets (should cache new ones)
  console.log('\n3️⃣ Getting fee share wallets (should cache new ones)...')
  for (const creator of creators) {
    if (creator.twitterUsername) {
      console.log(`\n   @${creator.twitterUsername}:`)
      const wallet = await getFeeShareWallet(creator.twitterUsername)
      console.log(`   Wallet: ${wallet || 'Not found'}`)
    }
  }
  
  // 4. Check cache status after
  console.log('\n4️⃣ Checking cache status after lookups...')
  for (const creator of creators) {
    if (creator.twitterUsername) {
      const { data } = await supabase
        .from('wallet_mappings')
        .select('wallet_address, last_checked')
        .eq('twitter_username', creator.twitterUsername.toLowerCase())
        .single()
      
      console.log(`   @${creator.twitterUsername}: ${data ? 'Cached ✅' : 'Not cached ❌'}`)
      if (data) {
        console.log(`   Last checked: ${new Date(data.last_checked).toLocaleString()}`)
      }
    }
  }
  
  // 5. Test cache speed
  console.log('\n5️⃣ Testing cache speed (second lookup should be instant)...')
  for (const creator of creators.slice(0, 1)) {
    if (creator.twitterUsername) {
      console.log(`\n   @${creator.twitterUsername}:`)
      
      console.log('   First lookup:')
      const start1 = Date.now()
      const wallet1 = await getFeeShareWallet(creator.twitterUsername)
      console.log(`   Time: ${Date.now() - start1}ms`)
      
      console.log('   Second lookup:')
      const start2 = Date.now()
      const wallet2 = await getFeeShareWallet(creator.twitterUsername)
      console.log(`   Time: ${Date.now() - start2}ms`)
      
      console.log(`   Same result: ${wallet1 === wallet2 ? 'Yes ✅' : 'No ❌'}`)
    }
  }
}

// Run the test
testCaching().catch(console.error)