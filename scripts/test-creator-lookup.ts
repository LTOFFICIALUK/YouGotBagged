import { getCreatorWallets } from '../lib/creator-wallet-lookup'

async function testCreatorLookup() {
  // Test with a known token
  const tokenMint = 'CMx7yon2cLzHcXqgHsKJhuU3MmME6noWLQk2rAycBAGS'
  
  console.log('🧪 Testing creator wallet lookup...\n')
  
  const creators = await getCreatorWallets(tokenMint)
  
  console.log('\n📊 Results:')
  console.log('Total creators:', creators.length)
  
  creators.forEach((creator, index) => {
    console.log(`\n${index + 1}. @${creator.twitterUsername}`)
    console.log(`   Wallet: ${creator.wallet}`)
    console.log(`   Royalty: ${creator.royaltyBps/100}%`)
    console.log(`   Is Creator: ${creator.isCreator ? 'Yes' : 'No'}`)
  })
}

// Run the test
testCreatorLookup().catch(console.error)