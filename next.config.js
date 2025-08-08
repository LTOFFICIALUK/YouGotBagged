/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bags.fm',
      },
      {
        protocol: 'https',
        hostname: 'dev.bags.fm',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    unoptimized: true
  },
}

module.exports = nextConfig 