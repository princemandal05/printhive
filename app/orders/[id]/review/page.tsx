'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LeaveReviewPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = (params?.id as string) || ''

  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text }),
      })
    } catch (err) {
      console.warn('Review submit note:', err)
    } finally {
      setSubmitting(false)
      router.push(`/orders/${orderId}?reviewed=true`)
    }
  }

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 580, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          ⭐ Amazon & Flipkart Style Review
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Rate Your 3D Print
        </h1>
        <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: 15 }}>
          Your feedback helps millions of buyers choose verified 3D print hubs and designers.
        </p>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {/* Star Rating Selection */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 10 }}>
              Overall Rating
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 36,
                    lineHeight: 1,
                    color: star <= (hoverRating || rating) ? '#FFB800' : 'var(--border-color)',
                    transition: 'transform 0.1s ease',
                    transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#ea580c', marginLeft: 8 }}>
                {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Good (4/5)' : rating === 3 ? 'Average (3/5)' : rating === 2 ? 'Poor (2/5)' : 'Unsatisfactory (1/5)'}
              </span>
            </div>
          </div>

          {/* Written Review Text Area */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
              Write your review
            </label>
            <textarea
              rows={4}
              style={{
                width: '100%',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 14,
                color: 'var(--text-main)',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              placeholder="What did you like or dislike about the print precision, surface finish, or material quality?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Optional Photo Attachment */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
              Add a photo of your printed object (Optional)
            </label>
            <div style={{ background: 'var(--bg-card-hover)', border: '2px dashed var(--border-color)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
                style={{ display: 'none' }}
                id="review-photo"
              />
              <label htmlFor="review-photo" style={{ cursor: 'pointer', fontSize: 14, color: 'var(--text-sub)' }}>
                {photoName ? `📷 Attached: ${photoName}` : '📸 Click to upload print photo'}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: 99,
              padding: '14px',
              fontWeight: 900,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
            }}
          >
            {submitting ? 'Submitting Review...' : 'Submit Review'}
          </button>
        </form>
      </section>

      <Footer />
    </main>
  )
}