"use client"

import Image from 'next/image'
import { Wallet } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onOpenFeeTracker?: () => void
}

export const Header = ({ onOpenFeeTracker }: HeaderProps) => {

  return (
    <header>
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Go to home" className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="YouGotBagged Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </Link>
          
          {onOpenFeeTracker && (
            <button
              onClick={onOpenFeeTracker}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-bold"
            >
              <Wallet className="h-4 w-4" />
              Fee Wallet Search
            </button>
          )}
        </div>
      </div>
    </header>
  )
} 