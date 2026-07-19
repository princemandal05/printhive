'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type Product = {
  id: string
  name: string
  price: number
  category: string
  rating: number
  seller: string
  stock: number
  description: string
  images: string[]
  specifications: {
    material: string
    technology: string
    layerHeight: string
    weight: string
    color: string
  }
}

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Geometric Planter Set (3)',
    price: 649,
    category: 'Home Décor',
    rating: 4.7,
    seller: 'UrbanPrint Co.',
    stock: 18,
    description:
      'A premium geometric planter collection designed for modern homes. Made using high-quality PLA with excellent finish and durability.',
    images: ['', '', '', ''],
    specifications: {
      material: 'PLA+',
      technology: 'FDM',
      layerHeight: '0.20 mm',
      weight: '350 g',
      color: 'Matte White',
    },
  },
  {
    id: 'p2',
    name: 'Low-Poly Desk Organizer',
    price: 399,
    category: 'Office Accessories',
    rating: 4.6,
    seller: 'DeskWorks',
    stock: 32,
    description:
      'Keep your desk organized using this stylish low-poly organizer perfect for stationery and accessories.',
    images: ['', '', '', ''],
    specifications: {
      material: 'PLA',
      technology: 'FDM',
      layerHeight: '0.16 mm',
      weight: '240 g',
      color: 'Black',
    },
  },
]

export default function ProductDetailsPage() {
  const params = useParams()

  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === params.id),
    [params]
  )

  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <main>
        <Navbar />

        <section className="container section-sm">
          <div className="empty-state">
            <h2>Product not found</h2>

            <p className="text-muted">
              The requested product does not exist.
            </p>

            <Link
              href="/shop"
              className="btn btn-primary"
            >
              Back to Shop
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm">

        <nav
          style={{
            marginBottom: '30px',
            fontSize: '.95rem',
          }}
        >
          <Link href="/">Home</Link>
          {' / '}
          <Link href="/shop">Shop</Link>
          {' / '}
          <span>{product.name}</span>
        </nav>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: '50px',
            alignItems: 'start',
          }}
        >

          {/* Product Images */}

          <div>

            <div
              style={{
                height: '520px',
                borderRadius: '20px',
                background:
                  'linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <svg
                width="130"
                height="130"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-slate-400)"
                strokeWidth="1.5"
              >
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: '16px',
                marginTop: '20px',
              }}
            >
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  style={{
                    height: '95px',
                    borderRadius: '12px',
                    background:
                      'linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))',
                  }}
                />
              ))}
            </div>

          </div>

          {/* Product Information */}

          <div>

            <span className="badge badge-primary">
              Verified Product
            </span>

            <h1
              style={{
                fontSize: '2.8rem',
                marginTop: '20px',
                marginBottom: '15px',
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <span className="rating">
                ★ {product.rating}
              </span>

              <span>
                Seller:
                <strong> {product.seller}</strong>
              </span>

              <span
                style={{
                  color: 'green',
                  fontWeight: 600,
                }}
              >
                In Stock
              </span>
            </div>

            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: '24px',
              }}
            >
              ₹{product.price}
            </div>

            <p
              className="text-muted"
              style={{
                lineHeight: 1.8,
                marginBottom: '32px',
              }}
            >
              {product.description}
            </p>

                        {/* Quantity */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                marginBottom: '28px',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                }}
              >
                Quantity
              </span>

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
                    setQuantity((q) => Math.max(1, q - 1))
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
                  {quantity}
                </div>

                <button
                  className="btn"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.stock, q + 1)
                    )
                  }
                >
                  +
                </button>
              </div>

              <span className="text-muted">
                {product.stock} available
              </span>
            </div>

            {/* Action Buttons */}

            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '36px',
              }}
            >
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                }}
              >
                Buy Now
              </button>

              <button
                className="btn btn-secondary"
                style={{
                  flex: 1,
                }}
              >
                Add to Cart
              </button>

              <button className="btn btn-secondary">
                ♡ Wishlist
              </button>
            </div>

            {/* Delivery Card */}

            <div
              className="glass-card"
              style={{
                padding: '24px',
                marginBottom: '28px',
              }}
            >
              <h3
                style={{
                  marginBottom: '16px',
                }}
              >
                Delivery Information
              </h3>

              <p className="text-muted">
                🚚 Estimated Delivery: 3–5 Business Days
              </p>

              <p className="text-muted">
                📦 Secure Packaging
              </p>

              <p className="text-muted">
                🔄 7-Day Replacement Policy
              </p>

              <p className="text-muted">
                ✔ Quality Checked Before Shipping
              </p>
            </div>

            {/* Specifications */}

            <div
              className="glass-card"
              style={{
                padding: '24px',
              }}
            >
              <h3
                style={{
                  marginBottom: '20px',
                }}
              >
                Specifications
              </h3>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <tbody>

                  <tr>
                    <td
                      style={{
                        padding: '10px 0',
                        fontWeight: 600,
                      }}
                    >
                      Material
                    </td>

                    <td>{product.specifications.material}</td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: '10px 0',
                        fontWeight: 600,
                      }}
                    >
                      Technology
                    </td>

                    <td>{product.specifications.technology}</td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: '10px 0',
                        fontWeight: 600,
                      }}
                    >
                      Layer Height
                    </td>

                    <td>{product.specifications.layerHeight}</td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: '10px 0',
                        fontWeight: 600,
                      }}
                    >
                      Weight
                    </td>

                    <td>{product.specifications.weight}</td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: '10px 0',
                        fontWeight: 600,
                      }}
                    >
                      Color
                    </td>

                    <td>{product.specifications.color}</td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Seller Card */}

        <section
          className="glass-card"
          style={{
            marginTop: '60px',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div>
              <div className="section-eyebrow">
                Seller
              </div>

              <h2
                style={{
                  marginTop: '10px',
                }}
              >
                {product.seller}
              </h2>

              <p className="text-muted">
                Trusted PrintHive Creator with verified
                products and excellent customer ratings.
              </p>
            </div>

            <button className="btn btn-primary">
              Visit Store
            </button>
          </div>
        </section>

                {/* Customer Reviews */}

        <section
          style={{
            marginTop: '70px',
          }}
        >
          <div className="section-eyebrow">
            Customer Reviews
          </div>

          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '30px',
            }}
          >
            What Buyers Say
          </h2>

          <div
            style={{
              display: 'grid',
              gap: '24px',
            }}
          >
            {[
              {
                name: 'Rahul Sharma',
                rating: 5,
                review:
                  'Excellent print quality and premium finish. Packaging was secure and delivery was faster than expected.',
              },
              {
                name: 'Ananya Patel',
                rating: 5,
                review:
                  'Very satisfied with the product. Looks exactly like the pictures and the material quality is amazing.',
              },
              {
                name: 'Karan Mehta',
                rating: 4,
                review:
                  'Good quality overall. Would definitely recommend this seller for 3D printed products.',
              },
            ].map((review, index) => (
              <div
                key={index}
                className="glass-card"
                style={{
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <strong>{review.name}</strong>

                  <span className="rating">
                    ★ {review.rating}.0
                  </span>
                </div>

                <p className="text-muted">
                  {review.review}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}

        <section
          style={{
            marginTop: '80px',
          }}
        >
          <div className="section-eyebrow">
            Recommended
          </div>

          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '32px',
            }}
          >
            You May Also Like
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(250px,1fr))',
              gap: '24px',
            }}
          >
            {PRODUCTS.filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/${item.id}`}
                  className="design-card"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    className="design-card-image"
                    style={{
                      height: '180px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))',
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

                  <div className="design-card-body">
                    <div className="design-card-title">
                      {item.name}
                    </div>

                    <div
                      className="design-card-price"
                      style={{
                        marginTop: '10px',
                      }}
                    >
                      ₹{item.price}
                    </div>

                    <div
                      className="design-card-meta"
                      style={{
                        marginTop: '10px',
                      }}
                    >
                      ★ {item.rating} · {item.seller}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* CTA */}

        <section
          className="glass-card"
          style={{
            marginTop: '90px',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          <div className="section-eyebrow">
            PrintHive Marketplace
          </div>

          <h2
            style={{
              fontSize: '2.4rem',
              marginBottom: '20px',
            }}
          >
            Looking for a Custom 3D Print?
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth: '700px',
              margin: '0 auto 32px',
            }}
          >
            Upload your own 3D model or describe your idea using
            PrintHive AI. Connect with verified printing partners,
            receive instant quotations, and get your custom product
            delivered to your doorstep.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '18px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/requests"
              className="btn btn-primary"
            >
              Start Custom Order
            </Link>

            <Link
              href="/shop"
              className="btn btn-secondary"
            >
              Continue Shopping
            </Link>
          </div>
        </section>

      </section>

      <Footer />
    </main>
  )
}
