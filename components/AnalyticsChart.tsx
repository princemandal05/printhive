'use client'

interface AnalyticsChartProps {
  title?: string
  accentColor?: string
  data?: { label: string; value: number }[]
  subtitle?: string
}

const DEFAULT_DATA = [
  { label: 'Mon', value: 4200 },
  { label: 'Tue', value: 6800 },
  { label: 'Wed', value: 9100 },
  { label: 'Thu', value: 7400 },
  { label: 'Fri', value: 12500 },
  { label: 'Sat', value: 15800 },
  { label: 'Sun', value: 18450 },
]

export default function AnalyticsChart({
  title = 'Weekly Revenue & Royalty Velocity',
  subtitle = 'Live 7-Day Performance Metric',
  accentColor = '#FF6B35',
  data = DEFAULT_DATA,
}: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        padding: '14px 16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{title}</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: accentColor, background: `${accentColor}15`, padding: '3px 10px', borderRadius: 6 }}>
          📈 +24.8% vs last week
        </div>
      </div>

      {/* Visual SVG Bar Analytics Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 110, paddingTop: 14, borderBottom: '1px dashed #E2E8F0' }}>
        {data.map((item, idx) => {
          const heightPct = (item.value / maxValue) * 100
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', marginBottom: 2 }}>
                ₹{item.value > 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: 28,
                  height: `${heightPct}%`,
                  background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}aa 100%)`,
                  borderRadius: '4px 4px 2px 2px',
                  transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: `0 3px 8px ${accentColor}33`,
                }}
              />
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 6 }}>
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
