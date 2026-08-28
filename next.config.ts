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
        source: '/models',
        destination: '/browse',
        permanent: true,
      },
      {
        source: '/print',
        destination: '/print-on-demand',
        permanent: true,
      },
      {
        source: '/design',
        destination: '/requests',
        permanent: true,
      },
      {
        source: '/dashboard/printer',
        destination: '/dashboard/printer-owner',
        permanent: true,
      },
      {
        source: '/dashboard/vendor',
        destination: '/dashboard/seller',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
