'use client'

import { useState } from 'react'

export interface AISearchFilterResult {
  query: string
  filters: {
    cleanSearchTerm: string
    maxPrice: number | null
    material: string | null
    category: string | null
    technology: string | null
  }
}

interface AISearchBarProps {
  onSearchProcessed: (result: AISearchFilterResult) => void
  placeholder?: string
}

export default function AISearchBar({
  onSearchProcessed,
  placeholder = 'Try: "I need a phone stand under ₹500 that can be printed using PLA."',
}: AISearchBarProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<AISearchFilterResult['filters'] | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!res.ok) {
        throw new Error('AI Search service temporarily busy')
      }

      const data = await res.json()
      if (data.success && data.filters) {
        setActiveFilters(data.filters)
        onSearchProcessed({
          query: data.query,
          filters: data.filters,
        })
      }
    } catch (err: unknown) {
      const errObj = err as Error
      setErrorMsg(errObj.message || 'Failed to process natural language search')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setActiveFilters(null)
    setQuery('')
    onSearchProcessed({
      query: '',
      filters: {
        cleanSearchTerm: '',
        maxPrice: null,
        material: null,
        category: null,
        technology: null,
      },
    })
  }

  return (
    <div style={{ width: '100%', marginBottom: 24 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, width: '100%' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              paddingLeft: 46,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              fontSize: 14,
              color: 'var(--text-main)',
              outline: 'none',
              boxSizing: 'border-box',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          />
          <span style={{ position: 'absolute', left: 16, top: 14, fontSize: 18 }}>✨</span>
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#fff',
            border: 'none',
            padding: '0 24px',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(234,88,12,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {loading ? '⏳ AI Parsing…' : '✨ AI Search'}
        </button>
      </form>

      {errorMsg && (
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* STRUCTURED FILTER CHIPS DISPLAY */}
      {activeFilters && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 800 }}>Extracted Filters:</span>
          {activeFilters.cleanSearchTerm && (
            <span style={{ background: 'rgba(234,88,12,0.12)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.3)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
              🔍 Topic: {activeFilters.cleanSearchTerm}
            </span>
          )}
          {activeFilters.maxPrice !== null && (
            <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
              💰 Max: ₹{activeFilters.maxPrice}
            </span>
          )}
          {activeFilters.material && (
            <span style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.3)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
              🏷️ Material: {activeFilters.material}
            </span>
          )}
          {activeFilters.category && (
            <span style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
              📂 Category: {activeFilters.category}
            </span>
          )}
          {activeFilters.technology && (
            <span style={{ background: 'rgba(236,72,153,0.12)', color: '#EC4899', border: '1px solid rgba(236,72,153,0.3)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
              ⚙️ Tech: {activeFilters.technology}
            </span>
          )}

          <button
            type="button"
            onClick={clearFilters}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
