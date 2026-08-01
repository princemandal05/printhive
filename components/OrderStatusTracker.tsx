'use client'

interface OrderStatusTrackerProps {
  currentStep?: number // 1: Received, 2: Sliced, 3: Printing, 4: Post-Processed, 5: Dispatched
  eta?: string
  layerProgress?: string
}

const STEPS = [
  { id: 1, title: 'Order Received', desc: 'CAD Brief & File Verified', icon: '📝' },
  { id: 2, title: 'Mesh Sliced', desc: 'Toolpath G-Code Generated', icon: '🔪' },
  { id: 3, title: 'Printing Active', desc: 'In-Bed 3D Manufacturing', icon: '🖨️' },
  { id: 4, title: 'Post-Processed', desc: 'Support Removal & QC', icon: '✨' },
  { id: 5, title: 'Dispatched', desc: 'Out for Local Delivery', icon: '🚚' },
]

export default function OrderStatusTracker({
  currentStep = 3,
  eta = 'Tomorrow, 4:00 PM',
  layerProgress = 'Layer 184 / 350 (52%)',
}: OrderStatusTrackerProps) {
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
          <div style={{ fontSize: 12, fontWeight: 800, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ⚡ Live Manufacturing Pipeline
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
            Step {currentStep} of 5: {STEPS[currentStep - 1]?.title}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Estimated Delivery</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: 8, marginTop: 2 }}>
            📅 {eta}
          </div>
        </div>
      </div>

      {/* Visual Pipeline Track */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, position: 'relative' }}>
        {STEPS.map((s) => {
          const completed = s.id < currentStep
          const active = s.id === currentStep
          return (
            <div
              key={s.id}
              style={{
                background: active ? '#FFF7ED' : completed ? '#F0FDF4' : '#F8FAFC',
                border: active ? '2px solid #FF6B35' : completed ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '14px 12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 6px 20px rgba(255, 107, 53, 0.15)' : 'none',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: active ? '#FF6B35' : completed ? '#047857' : '#64748B' }}>
                {s.title}
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{s.desc}</div>
              {active && (
                <div style={{ marginTop: 8, fontSize: 10, fontWeight: 800, color: '#FF6B35', background: '#FFEDD5', borderRadius: 6, padding: '2px 6px', display: 'inline-block' }}>
                  ● {layerProgress}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
