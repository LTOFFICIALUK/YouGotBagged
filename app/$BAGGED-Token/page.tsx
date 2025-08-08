import { Header } from '@/components/Header'

const LINKS = [
  { label: 'Axiom Exchange', href: 'https://axiom.trade/meme/83BzoNNzcFTGrwdjDDrjURdFQwTxtuPJwZTeGZvZS181' },
  { label: 'Dexscreener', href: 'https://dexscreener.com/solana/83bzonnzcftgrwdjddrjurdfqwtxtupjwztegzvzs181' },
  { label: 'BagsApp', href: 'https://bags.fm/HLLYu3aeNmLXg4bvA9L6UfL1gEk9ACCLJdTKFEinBAGS' },
  { label: 'X (Twitter)', href: 'https://x.com/YouGotBagged' },
]

export default function BaggedTokenPage() {
  const contractAddress = 'HLLYu3aeNmLXg4bvA9L6UfL1gEk9ACCLJdTKFEinBAGS'

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-10">
        {/* Heading + CA */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">$BAGGED</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Contract Address: <span className="text-foreground font-mono bg-[#15171A] border border-border/60 px-2 py-1 rounded">{contractAddress}</span>
            </p>
            <nav className="flex flex-wrap items-center gap-2 md:gap-3">
              {LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Intro */}
        <section className="space-y-3 mb-10">
          <h2 className="text-xl font-semibold">What is BAGGED?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            BAGGED is a community-powered initiative focused on helping creators and token teams discover and claim unclaimed protocol fees. Many teams are unaware they have funds waiting. We surface those opportunities and mobilize the community to reach out, so creators can finally claim what they are owed.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Our aim is simple: make it easy for people to learn they have fees to claim, help them off-ramp those fees, and align incentives so the community benefits when this happens.
          </p>
        </section>

        {/* How It Works */}
        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
            <li>We identify tokens with unclaimed fees and publish clear, public information.</li>
            <li>The community helps contact the creators or teams to claim their funds.</li>
            <li>When we assist with off-ramping, a portion of those fees may be allocated for buybacks as outlined below.</li>
          </ol>
        </section>

        {/* Incentives + Flywheels */}
        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Aligned incentives</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-effect rounded-lg p-5">
              <h3 className="font-semibold mb-2">BAGGED Buyback Flywheel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When we successfully help a team off-ramp their unclaimed fees, a portion may be used for buybacks of $BAGGED. This can create a repeatable loop: more successful claims → more buybacks → more attention on the project → more opportunities to help.
              </p>
            </div>
            <div className="glass-effect rounded-lg p-5">
              <h3 className="font-semibold mb-2">Fee Token Buyback Flywheel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may also buy back the underlying fee token in select cases. This can highlight our contribution within those communities, bringing additional visibility back to BAGGED.
              </p>
            </div>
          </div>
        </section>

        {/* Community Rewards */}
        <section className="space-y-3 mb-10">
          <h2 className="text-xl font-semibold">Community rewards</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We plan to reward active community members who help us reach creators and teams with unclaimed fees. This may include periodic giveaways of free SOL to recognize meaningful outreach and verified, constructive participation.
          </p>
        </section>

        {/* Get Involved */}
        <section className="space-y-3 mb-10">
          <h2 className="text-xl font-semibold">How to participate</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Share leads about tokens or creators who might have unclaimed fees.</li>
            <li>Help us get in touch with teams in a respectful, constructive way.</li>
            <li>Create your own Telegram/Discord groups to coordinate outreach. Please note: official updates and announcements will only be posted on our X page.</li>
          </ul>
        </section>

        {/* Notes & Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Important notes</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>BAGGED does not provide financial, legal, or investment advice. All information is for educational and informational purposes only.</li>
            <li>Any buybacks or rewards are discretionary and may change over time.</li>
            <li>Outreach should always be respectful and aligned with platform policies and local laws.</li>
          </ul>
        </section>
      </main>
    </>
  )
}