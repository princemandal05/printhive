'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const COMMUNITY_POSTS = [
  {
    id: 1,
    user: 'Karan Mehta',
    role: 'Buyer',
    time: '2 hours ago',
    title: 'Printed the Cyberpunk Dragon in Silk Rainbow PLA!',
    rating: 5,
    printerOwner: "Rohan's PrintLab",
    designer: 'Sneha Kulkarni',
    comment: 'The layer height of 0.16mm made the rainbow gradients pop smoothly. Zero stringing!',
    likes: 42,
    badge: 'Verified Purchase',
  },
  {
    id: 2,
    user: 'Ananya Patel',
    role: 'Buyer',
    time: '1 day ago',
    title: 'Custom replacement knob fits my washing machine perfectly',
    rating: 5,
    printerOwner: 'Bandra MakerSpace',
    designer: 'Aarav Mehta',
    comment: 'Posted a brief on Custom Design Requests and Aarav modeled it from my Word spec doc within 24 hours.',
    likes: 29,
    badge: 'Custom Order',
  },
]

export default function CommunityPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ color: '#10b981', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700 }}>
          Community Gallery & Reviews
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Real Prints from Real Buyers
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32 }}>
          Browse community photo submissions, verified ratings, and print quality showcases from our 3-sided marketplace.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {COMMUNITY_POSTS.map((post) => (
            <div
              key={post.id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                    {post.user.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{post.user}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{post.role} · {post.time}</div>
                  </div>
                </div>

                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                  ✓ {post.badge}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 16 }}>{post.comment}</p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', background: '#0f172a', padding: 12, borderRadius: 10, fontSize: 13, color: '#94a3b8' }}>
                <div>🖨️ Printer: <strong style={{ color: '#fff' }}>{post.printerOwner}</strong></div>
                <div>🎨 Designer: <strong style={{ color: '#fff' }}>{post.designer}</strong></div>
                <div><span style={{ color: '#fbbf24' }}>★ {'★'.repeat(post.rating)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
