import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground leading-relaxed md:max-w-2xl">
            Disclaimer: The information provided on this site is for informational purposes only and should not be considered financial, legal, or investment advice. Do your own research. You are solely responsible for your decisions.
          </p>

          <nav className="flex items-center gap-4 md:gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Privacy Policy">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Terms of Service">
              Terms of Service
            </Link>
            <a
              href="https://x.com/YouGotBagged"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on X"
            >
              Follow on X
            </a>
          </nav>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} YouGotBagged. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}