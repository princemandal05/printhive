'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LeaveReviewPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Replace with:
    // 1. Upload the print photo to Cloudinary
    // 2. Insert a row into the `reviews` table via Supabase (order_id, rating, text, photo_url)
    // 3. Optionally run the photo through the Gemini quality-check endpoint
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 800))
    router.push('/dashboard/buyer')
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="section-eyebrow">Order #{orderId?.slice(0, 8)}</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          How was your print?
        </h1>
        <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
          Your review helps other buyers trust this designer and printer owner.
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="form-group">
            <label className="label label-required">Rating</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
                    fontSize: 32,
                    lineHeight: 1,
                    color: star <= (hoverRating || rating) ? 'var(--color-warning)' : 'var(--color-border-strong)',
                  }}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Photo of your print</label>
            <label
              htmlFor="review-photo"
              className="flex flex-col items-center justify-center"
              style={{
                border: '2px dashed var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-6)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 24, marginBottom: 'var(--space-2)' }}>📷</span>
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {photoName || 'Add a photo (optional but recommended)'}
              </span>
              <input
                id="review-photo"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
              />
            </label>
          </div>

          <div className="form-group">
            <label className="label">Your review</label>
            <textarea
              className="textarea"
              placeholder="How was print quality, communication, and delivery time?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || rating === 0}
          onClick={handleSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </section>

      <Footer />
    </main>
  )
}