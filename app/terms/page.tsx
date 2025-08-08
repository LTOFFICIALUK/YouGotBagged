import { Header } from '@/components/Header'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            These Terms of Service ("Terms") govern your access to and use of YouGotBagged and related services ("Services").
            By using the Services, you agree to these Terms.
          </p>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Eligibility</h2>
            <p>You must be legally capable of entering into a binding agreement in your jurisdiction to use the Services.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Use of the Services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for your activity and the security of your wallets and keys.</li>
              <li>Do not use the Services for unlawful, harmful, or abusive purposes.</li>
              <li>We may modify, suspend, or discontinue the Services at any time without liability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. No Financial Advice</h2>
            <p>All information is provided for informational purposes only and does not constitute financial, legal, or investment advice. You are solely responsible for your decisions.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Third-Party Services</h2>
            <p>The Services may rely on third-party APIs, networks, or data sources. We do not control and are not responsible for third-party content or availability.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Intellectual Property</h2>
            <p>All content and materials provided through the Services are owned by us or our licensors and are protected by applicable laws. You receive a limited, non-exclusive, non-transferable license to use the Services.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Disclaimers</h2>
            <p>The Services are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. We do not warrant that the Services will be uninterrupted, error-free, or secure.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Indemnification</h2>
            <p>You agree to indemnify and hold us harmless from any claims, damages, losses, and expenses arising from your use of the Services or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">9. Changes to the Terms</h2>
            <p>We may update these Terms at any time by posting the revised version. Continued use of the Services constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">10. Contact</h2>
            <p>Questions about these Terms? Contact us via our X profile at <a className="underline hover:no-underline text-foreground" href="https://x.com/YouGotBagged" target="_blank" rel="noopener noreferrer">@YouGotBagged</a>.</p>
          </section>

          <p className="text-xs">Effective date: {new Date().toISOString().slice(0, 10)}</p>
        </div>
      </main>
    </>
  )
}