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
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ color: '#10b981', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 800 }}>
          Community Gallery &amp; Reviews
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Real Prints from Real Buyers
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: 16, marginBottom: 32 }}>
          Browse community photo submissions, verified ratings, and print quality showcases from our 4-sided marketplace.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {COMMUNITY_POSTS.map((post) => (
            <div
              key={post.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 20,
                padding: 28,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                    {post.user.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{post.user}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>{post.role} · {post.time}</div>
                  </div>
                </div>

                <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
                  ✓ {post.badge}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 10 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 16 }}>{post.comment}</p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', background: 'var(--bg-card-hover)', padding: 14, borderRadius: 12, fontSize: 13, color: 'var(--text-sub)', border: '1px solid var(--border-color)' }}>
                <div>🖨️ Printer: <strong style={{ color: 'var(--text-main)' }}>{post.printerOwner}</strong></div>
                <div>🎨 Designer: <strong style={{ color: 'var(--text-main)' }}>{post.designer}</strong></div>
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
