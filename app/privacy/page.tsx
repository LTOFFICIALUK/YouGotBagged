import { Header } from '@/components/Header'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            This Privacy Policy explains how YouGotBagged ("we", "us", "our") collects, uses, and protects
            your information when you use our website and related services ("Services").
          </p>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-foreground">Wallet data you share</span>: public wallet addresses you provide to use the Service.</li>
              <li><span className="text-foreground">Usage data</span>: basic analytics such as page views, referrers, device type, and timestamps.</li>
              <li><span className="text-foreground">Technical data</span>: IP address and browser metadata collected for security and to prevent abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the Services, including calculating and displaying token metrics.</li>
              <li>To monitor performance, troubleshoot issues, and ensure platform security.</li>
              <li>To communicate important updates about the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share limited data with trusted service providers (e.g., hosting, analytics) strictly to operate the Service, under confidentiality obligations.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Cookies and Analytics</h2>
            <p>We may use cookies or similar technologies to remember preferences and measure usage. You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Data Retention</h2>
            <p>We retain information only as long as necessary for the purposes outlined in this policy or as required by law. Aggregated or anonymized data may be retained for analytics.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access, update, or delete information you have provided, where applicable.</li>
              <li>Opt out of non-essential analytics where supported by your browser or device.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Security</h2>
            <p>We implement reasonable administrative, technical, and physical safeguards to protect information. However, no method of transmission or storage is completely secure.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Third-Party Links</h2>
            <p>Our site may contain links to third-party services. We are not responsible for the privacy practices of those third parties. Review their policies separately.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Material changes will be reflected on this page with an updated effective date.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">10. Contact</h2>
            <p>For questions about this policy or your data, contact us via our X profile at <a className="underline hover:no-underline text-foreground" href="https://x.com/YouGotBagged" target="_blank" rel="noopener noreferrer">@YouGotBagged</a>.</p>
          </section>

          <p className="text-xs">Effective date: {new Date().toISOString().slice(0, 10)}</p>
        </div>
      </main>
    </>
  )
}