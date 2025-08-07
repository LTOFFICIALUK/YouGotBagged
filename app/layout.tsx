import type { Metadata } from 'next'
import './globals.css'

const inter = { className: 'font-inter' }

export const metadata: Metadata = {
  title: 'YouGotBagged - Unclaimed Fees Dashboard',
  description: 'Track and manage unclaimed fees from your Bags tokens',
  keywords: ['bags', 'tokens', 'fees', 'dashboard', 'solana'],
  authors: [{ name: 'YouGotBagged Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
} 