import Image from 'next/image'
import { RefreshCw } from 'lucide-react'

interface HeaderProps {
  onRefresh: () => void
  refreshing: boolean
}

export const Header = ({ onRefresh, refreshing }: HeaderProps) => {
  return (
    <header>
      <div className="container mx-auto px-8 py-6 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="YouGotBagged Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
} 