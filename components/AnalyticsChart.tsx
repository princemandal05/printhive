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
        borderRadius: 20,
        padding: '24px 28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: accentColor, background: `${accentColor}15`, padding: '4px 12px', borderRadius: 8 }}>
          📈 +24.8% vs last week
        </div>
      </div>

      {/* Visual SVG Bar Analytics Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, paddingTop: 20, borderBottom: '1px dashed #E2E8F0' }}>
        {data.map((item, idx) => {
          const heightPct = (item.value / maxValue) * 100
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                ₹{item.value > 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: 36,
                  height: `${heightPct}%`,
                  background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}aa 100%)`,
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: `0 4px 12px ${accentColor}33`,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginTop: 8 }}>
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
