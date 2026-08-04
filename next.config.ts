import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@google/genai',
      '@supabase/ssr',
      '@supabase/supabase-js',
      'three',
      'leaflet',
    ],
  },
}

export default nextConfig
