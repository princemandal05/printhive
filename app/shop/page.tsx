'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'

type Product = {
  id: string
  name: string
  price: number
  category: string
  rating: number
  seller: string
  stock: number
  featured?: boolean
  trending?: boolean
  newest?: boolean
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Geometric Planter Set (3)',
    price: 649,
    category: 'Home Décor',
    rating: 4.7,
    seller: 'UrbanPrint Co.',
    stock: 18,
    featured: true,
    trending: true,
  },
  {
    id: 'p2',
    name: 'Low-Poly Desk Organizer',
    price: 399,
    category: 'Office Accessories',
    rating: 4.6,
    seller: 'DeskWorks',
    stock: 32,
    featured: true,
  },
  {
    id: 'p3',
    name: 'Articulated Dragon (Painted)',
    price: 899,
    category: 'Toys & Miniatures',
    rating: 4.9,
    seller: 'MiniMakers',
    stock: 6,
    trending: true,
  },
  {
    id: 'p4',
    name: 'Personalized Nameplate Set',
    price: 549,
    category: 'Personalized Gifts',
    rating: 4.8,
    seller: 'CustomCraft',
    stock: 24,
    newest: true,
  },
  {
    id: 'p5',
    name: 'Cosplay Helmet Shell',
    price: 2499,
    category: 'Cosplay Items',
    rating: 4.9,
    seller: 'PropForge',
    stock: 3,
    featured: true,
  },
  {
    id: 'p6',
    name: 'Educational Solar System Kit',
    price: 799,
    category: 'Educational Kits',
    rating: 4.7,
    seller: 'LearnLab',
    stock: 15,
    newest: true,
  },
]

const CATEGORIES = [
  'All',
  'Home Décor',
  'Office Accessories',
  'Toys & Miniatures',
  'Personalized Gifts',
  'Cosplay Items',
  'Educational Kits',
]

const STATS = [
  {
    value: '25K+',
    label: 'Products',
  },
  {
    value: '850+',
    label: 'Verified Sellers',
  },
  {
    value: '15+',
    label: 'Categories',
  },
  {
    value: '4.9★',
    label: 'Average Rating',
  },
]

export default function ShopPage() {
  const { addToCart, addToWishlist, isInWishlist } = useStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase()

    const list = MOCK_PRODUCTS.filter((product) => {
      const matchesCategory =
        category === 'All' || product.category === category

      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.seller.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)

      return matchesCategory && matchesSearch
    })

    switch (sort) {
      case 'price-low':
        return [...list].sort((a, b) => a.price - b.price)

      case 'price-high':
        return [...list].sort((a, b) => b.price - a.price)

      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating)

      default:
        return list
    }
  }, [search, category, sort])

  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.featured)

  return (
    <main>
      <Navbar />

      <section className="container section-sm">

        <div className="section-eyebrow">
          PrintHive Marketplace
        </div>

        <h1
          className="section-heading"
          style={{
            marginBottom: 'var(--space-4)',
            maxWidth: '900px',
          }}
        >
          Discover Premium
          <br />
          3D Printed Products
        </h1>

        <p
          className="section-subheading"
          style={{
            maxWidth: '760px',
            marginBottom: 'var(--space-10)',
          }}
        >
          Browse premium ready-made 3D printed products from verified
          creators, independent makers and trusted businesses.
          Discover home décor, engineering models, cosplay items,
          educational kits and personalized gifts—all in one place.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(180px,1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          {STATS.map((item) => (
            <div
              key={item.label}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: '2rem',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                }}
              >
                {item.value}
              </h2>

              <p className="text-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}

        <div
          className="glass-card"
          style={{
            padding: "24px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
            }}
          >
            <input
              type="text"
              className="input"
              placeholder="Search products, sellers or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price : Low to High</option>
              <option value="price-high">Price : High to Low</option>
            </select>
          </div>

          <div
            className="flex gap-2"
            style={{
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`badge ${
                  category === cat
                    ? "badge-primary"
                    : "badge-neutral"
                }`}
                style={{
                  cursor: "pointer",
                  border: "none",
                  padding: "10px 18px",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Collection */}

        <div style={{ marginBottom: "56px" }}>
          <div className="section-eyebrow">
            Featured Collection
          </div>

          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Editor's Picks
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "24px",
            }}
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="glass-card"
                style={{
                  padding: "24px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: ".3s",
                }}
              >
                <div
                  style={{
                    height: "170px",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    background:
                      "linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))",
                  }}
                >
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-slate-400)"
                    strokeWidth="1.5"
                  >
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <span className="badge badge-primary">
                  Featured
                </span>

                <h3
                  style={{
                    marginTop: "18px",
                    fontSize: "1.15rem",
                    fontWeight: 600,
                  }}
                >
                  {product.name}
                </h3>

                <p
                  className="text-muted"
                  style={{
                    marginTop: "10px",
                  }}
                >
                  {product.seller}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  <strong
                    style={{
                      color: "var(--color-primary)",
                      fontSize: "1.3rem",
                    }}
                  >
                    ₹{product.price}
                  </strong>

                  <span className="rating">
                    ★ {product.rating}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div className="section-eyebrow">
              Marketplace
            </div>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              Browse Products
            </h2>
          </div>

          <p className="text-muted">
            Showing {filtered.length} of {MOCK_PRODUCTS.length} products
          </p>
        </div>

        {filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(280px,1fr))",
              gap: "28px",
            }}
          >
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="design-card"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  transition: ".3s",
                  overflow: "hidden",
                }}
              >
                <div
                  className="design-card-image"
                  style={{
                    height: "220px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))",
                  }}
                >
                  <svg
                    width="72"
                    height="72"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-slate-400)"
                    strokeWidth="1.5"
                  >
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <div className="design-card-body">

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span className="badge badge-primary">
                      Verified Seller
                    </span>

                    <span className="rating">
                      ★ {product.rating}
                    </span>
                  </div>

                  <div
                    className="design-card-title"
                    style={{
                      fontSize: "1.1rem",
                      marginBottom: "10px",
                    }}
                  >
                    {product.name}
                  </div>

                  <div
                    style={{
                      color: "var(--color-slate-400)",
                      marginBottom: "10px",
                    }}
                  >
                    {product.seller}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "18px",
                    }}
                  >
                    <span className="badge badge-neutral">
                      {product.category}
                    </span>

                    {product.stock <= 5 && (
                      <span className="badge badge-warning">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      className="design-card-price"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      ₹{product.price}
                    </div>

                    <span
                      style={{
                        color: "var(--color-success)",
                        fontWeight: 600,
                      }}
                    >
                      In Stock
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    <button
                      style={{
                        flex: 1,
                      }}
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart({ id: product.id, name: product.name, price: product.price, seller: product.seller, stock: product.stock }, 1)
                      }}
                    >
                      Buy Now
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToWishlist({ id: product.id, name: product.name, price: product.price, type: 'product' })
                      }}
                    >
                      {isInWishlist(product.id) ? '♥' : '♡'}
                    </button>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="empty-state"
            style={{
              padding: "70px 30px",
            }}
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-slate-400)"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>

            <h2
              style={{
                marginTop: "24px",
                marginBottom: "12px",
              }}
            >
              No Products Found
            </h2>

            <p className="text-muted">
              We couldn't find products matching your search.
              Try another keyword or category.
            </p>
          </div>
        )}

        <section
          className="glass-card"
          style={{
            marginTop: "80px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <div className="section-eyebrow">
            Stay Updated
          </div>

          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Never Miss New Designs
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth: "650px",
              margin: "0 auto 32px",
            }}
          >
            Subscribe to receive new arrivals,
            exclusive collections,
            creator spotlights and future AI-powered
            recommendations from PrintHive.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              style={{
                maxWidth: "420px",
                width: "100%",
              }}
            />

            <button className="btn btn-primary">
              Subscribe
            </button>
          </div>
        </section>

      </section>

      <Footer />
    </main>
  )
}