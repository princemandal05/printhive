'use client'

interface SkeletonShimmerProps {
  count?: number
  height?: number
  columns?: string
}

export default function SkeletonShimmer({
  count = 6,
  height = 320,
  columns = 'repeat(auto-fill, minmax(280px, 1fr))',
}: SkeletonShimmerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 20, width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: 18,
            background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s infinite linear',
            border: '1px solid #E2E8F0',
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
