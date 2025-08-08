import Image from 'next/image'
import { Wallet, Copy } from 'lucide-react'

interface HeroProps {
  solBalance?: number
  profileImage?: string
}

export const Hero = ({ 
  solBalance = 0, 
  profileImage 
}: HeroProps) => {

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Profile Picture */}
      <div className="relative mb-9">
        {profileImage ? (
          <Image
            src={profileImage}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full"
          />
        ) : (
          <Image
            src="/Logo-X.png"
            alt="YouGotBagged Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        )}
      </div>

      {/* Username */}
      <div className="mb-2">
        <p className="text-white font-bold text-3xl">@YouGotBagged</p>
      </div>

      <div className="mb-6 px-10">
        <p className="text-gray-400 text-xl text-center">YouGotBagged uses the power of the community to help others find their bags.</p>
      </div>

      {/* Follow Button */}
      <div className="mb-6">
        <a 
          href="https://x.com/intent/follow?screen_name=YouGotBagged" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-primary text-primary-foreground px-9 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors text-lg"
        >
          Follow us X
        </a>
      </div>

      {/* SOL Balance */}
      <div className="flex items-center gap-3 mb-12">
        <Wallet className="w-6 h-6 text-primary" />
        <span className="text-white font-semibold text-lg">{solBalance} SOL Claimed</span>
      </div>
    </div>
  )
} 