'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useStore()

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="section-eyebrow">Saved</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-8)' }}>
          Your wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <div className="empty-state-title">Your wishlist is empty</div>
            <p className="empty-state-text" style={{ marginBottom: 'var(--space-4)' }}>
              Save designs and products you like to find them again later.
            </p>
            <Link href="/shop" className="btn btn-primary">Browse the shop</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            {wishlist.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: 'var(--space-5)' }}>
                <div className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                <span className="badge badge-neutral" style={{ marginBottom: 'var(--space-3)' }}>
                  {item.type === 'product' ? 'Product' : 'Design'}
                </span>
                <div style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>₹{item.price}</div>
                <div className="flex gap-2">
                  <Link
                    href={item.type === 'product' ? `/shop/${item.id}` : `/designs/${item.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    View
                  </Link>
                  {item.type === 'product' && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, seller: '', stock: 99 })}
                    >
                      Add to cart
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)', width: '100%' }}
                >
                  Remove from wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}