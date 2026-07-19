'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type CartItem = {
  id: string
  name: string
  seller: string
  price: number
  quantity: number
  stock: number
  image: string
}

const INITIAL_CART: CartItem[] = [
  {
    id: 'p1',
    name: 'Geometric Planter Set (3)',
    seller: 'UrbanPrint Co.',
    price: 649,
    quantity: 2,
    stock: 18,
    image: '',
  },
  {
    id: 'p3',
    name: 'Articulated Dragon (Painted)',
    seller: 'MiniMakers',
    price: 899,
    quantity: 1,
    stock: 6,
    image: '',
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] =
    useState<CartItem[]>(INITIAL_CART)

  const [coupon, setCoupon] = useState('')

  const updateQuantity = (
    id: string,
    quantity: number
  ) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(quantity, item.stock)
              ),
            }
          : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) =>
      items.filter((item) => item.id !== id)
    )
  }

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      ),
    [cartItems]
  )

  const shipping = subtotal > 1500 ? 0 : 99

  const tax = Math.round(subtotal * 0.18)

  const total = subtotal + shipping + tax

  return (
    <main>
      <Navbar />

      <section className="container section-sm">

        <div className="section-eyebrow">
          Shopping Cart
        </div>

        <h1
          className="section-heading"
          style={{
            marginBottom: '16px',
          }}
        >
          Your Cart
        </h1>

        <p
          className="section-subheading"
          style={{
            marginBottom: '48px',
          }}
        >
          Review your selected products before
          proceeding to checkout.
        </p>

        {cartItems.length === 0 ? (
          <div
            className="empty-state"
            style={{
              padding: '80px 20px',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-slate-400)"
              strokeWidth="1.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.75L23 6H6" />
            </svg>

            <h2
              style={{
                marginTop: '24px',
              }}
            >
              Your Cart is Empty
            </h2>

            <p className="text-muted">
              Browse our marketplace and discover
              amazing 3D printed products.
            </p>

            <Link
              href="/shop"
              className="btn btn-primary"
              style={{
                marginTop: '30px',
              }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            {/* Cart Items */}

            <div>

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '150px 1fr',
                      gap: '24px',
                    }}
                  >
                    <div
                      style={{
                        height: '150px',
                        borderRadius: '16px',
                        background:
                          'linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-slate-400)"
                        strokeWidth="1.5"
                      >
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>

                    <div>

                      <h3
                        style={{
                          marginBottom: '10px',
                        }}
                      >
                        {item.name}
                      </h3>

                      <p className="text-muted">
                        Seller:
                        <strong>
                          {' '}
                          {item.seller}
                        </strong>
                      </p>

                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color:
                            'var(--color-primary)',
                          marginTop: '18px',
                          marginBottom: '20px',
                        }}
                      >
                        ₹{item.price}
                      </div>

                                            <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '20px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            className="btn"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                          >
                            −
                          </button>

                          <div
                            style={{
                              width: '55px',
                              textAlign: 'center',
                              fontWeight: 600,
                            }}
                          >
                            {item.quantity}
                          </div>

                          <button
                            className="btn"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            className="btn btn-secondary"
                          >
                            ♡ Wishlist
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={() =>
                              removeItem(item.id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  gap: '16px',
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
                    fontSize: '1.3rem',
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
                style={{
                  marginTop: '28px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 600,
                  }}
                >
                  Coupon Code
                </label>

                <input
                  type="text"
                  className="input"
                  value={coupon}
                  placeholder="Enter coupon code"
                  onChange={(e) =>
                    setCoupon(e.target.value)
                  }
                />

                <button
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    marginTop: '14px',
                  }}
                >
                  Apply Coupon
                </button>
              </div>

              <div
                className="glass-card"
                style={{
                  padding: '18px',
                  marginTop: '28px',
                  background:
                    'rgba(34,197,94,.08)',
                }}
              >
                🔒 Secure Checkout

                <p
                  className="text-muted"
                  style={{
                    marginTop: '10px',
                  }}
                >
                  All payments are encrypted and
                  protected using industry-standard
                  security.
                </p>
              </div>

              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '24px',
                }}
              >
                Proceed to Checkout
              </button>

              <Link
                href="/shop"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  marginTop: '14px',
                  textAlign: 'center',
                }}
              >
                Continue Shopping
              </Link>
            </div>

          </div>
        )}

      </section>

      <Footer />
    </main>
  )
}
