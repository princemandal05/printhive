'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const CART_ITEMS = [
  {
    id: 'p1',
    name: 'Geometric Planter Set (3)',
    price: 649,
    quantity: 2,
  },
  {
    id: 'p3',
    name: 'Articulated Dragon (Painted)',
    price: 899,
    quantity: 1,
  },
]

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('upi')

  const subtotal = useMemo(
    () =>
      CART_ITEMS.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    []
  )

  const shipping = subtotal > 1500 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  return (
    <main>
      <Navbar />

      <section className="container section-sm">

        <div className="section-eyebrow">
          Checkout
        </div>

        <h1
          className="section-heading"
          style={{
            marginBottom: '16px',
          }}
        >
          Secure Checkout
        </h1>

        <p
          className="section-subheading"
          style={{
            marginBottom: '48px',
          }}
        >
          Complete your purchase by providing your shipping
          details and preferred payment method.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '40px',
            alignItems: 'start',
          }}
        >

          {/* Checkout Form */}

          <div>

            <div
              className="glass-card"
              style={{
                padding: '32px',
                marginBottom: '30px',
              }}
            >
              <h2
                style={{
                  marginBottom: '24px',
                }}
              >
                Shipping Address
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <input
                  className="input"
                  placeholder="First Name"
                />

                <input
                  className="input"
                  placeholder="Last Name"
                />

                <input
                  className="input"
                  placeholder="Email Address"
                />

                <input
                  className="input"
                  placeholder="Phone Number"
                />

                <input
                  className="input"
                  placeholder="City"
                />

                <input
                  className="input"
                  placeholder="State"
                />

                <input
                  className="input"
                  placeholder="PIN Code"
                />

                <input
                  className="input"
                  placeholder="Country"
                />
              </div>

              <textarea
                className="input"
                rows={4}
                placeholder="Full Address"
                style={{
                  marginTop: '20px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div
              className="glass-card"
              style={{
                padding: '32px',
              }}
            >
              <h2
                style={{
                  marginBottom: '24px',
                }}
              >
                Payment Method
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: '16px',
                }}
              >
                {[
                  'upi',
                  'credit-card',
                  'debit-card',
                  'net-banking',
                  'cash-on-delivery',
                ].map((method) => (
                  <label
                    key={method}
                    className="glass-card"
                    style={{
                      padding: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === method}
                      onChange={() =>
                        setPaymentMethod(method)
                      }
                    />

                    <span
                      style={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {method.replaceAll('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Order Summary */}

          <div
            className="glass-card"
            style={{
              padding: '30px',
              position: 'sticky',
              top: '110px',
            }}
          >
            <h2
              style={{
                marginBottom: '24px',
              }}
            >
              Order Summary
            </h2>

                        <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                marginBottom: '30px',
              }}
            >
              {CART_ITEMS.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>

                    <p
                      className="text-muted"
                      style={{
                        marginTop: '6px',
                      }}
                    >
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <hr />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                margin: '24px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Shipping</span>

                <strong>
                  {shipping === 0
                    ? 'FREE'
                    : `₹${shipping}`}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>GST (18%)</span>

                <strong>₹{tax}</strong>
              </div>

              <hr />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                }}
              >
                <span>Total</span>

                <span
                  style={{
                    color: 'var(--color-primary)',
                  }}
                >
                  ₹{total}
                </span>
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: '18px',
                marginBottom: '24px',
                background: 'rgba(34,197,94,.08)',
              }}
            >
              <strong>Estimated Delivery</strong>

              <p
                className="text-muted"
                style={{
                  marginTop: '8px',
                }}
              >
                🚚 Delivery within 3–5 business days
              </p>

              <p className="text-muted">
                📦 Secure Packaging Included
              </p>
            </div>

            <div
              className="glass-card"
              style={{
                padding: '18px',
                marginBottom: '28px',
              }}
            >
              <strong>Secure Payment</strong>

              <p
                className="text-muted"
                style={{
                  marginTop: '10px',
                }}
              >
                Your payment information is protected using
                industry-standard SSL encryption.
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                marginBottom: '16px',
              }}
            >
              Place Order
            </button>

            <Link
              href="/cart"
              className="btn btn-secondary"
              style={{
                width: '100%',
                textAlign: 'center',
              }}
            >
              Back to Cart
            </Link>

          </div>

        </div>

        {/* Order Confirmation */}

        <section
          className="glass-card"
          style={{
            marginTop: '80px',
            padding: '50px',
            textAlign: 'center',
          }}
        >
          <div className="section-eyebrow">
            Need Help?
          </div>

          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '20px',
            }}
          >
            Secure & Trusted Checkout
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth: '700px',
              margin: '0 auto 30px',
            }}
          >
            PrintHive partners with trusted payment providers to
            ensure safe transactions. Once your order is placed,
            you'll receive an order confirmation, live order
            tracking, and delivery updates.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/shop"
              className="btn btn-secondary"
            >
              Continue Shopping
            </Link>

            <Link
              href="/orders"
              className="btn btn-primary"
            >
              View My Orders
            </Link>
          </div>
        </section>

      </section>

      <Footer />
    </main>
  )
}