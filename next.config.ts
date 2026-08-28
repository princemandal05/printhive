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
  async redirects() {
    return [
      {
        source: '/browse',
        destination: '/models',
        permanent: true,
      },
      {
        source: '/print-on-demand',
        destination: '/print',
        permanent: true,
      },
      {
        source: '/requests',
        destination: '/design',
        permanent: true,
      },
      {
        source: '/dashboard/printer-owner',
        destination: '/dashboard/printer',
        permanent: true,
      },
      {
        source: '/dashboard/seller',
        destination: '/dashboard/vendor',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
