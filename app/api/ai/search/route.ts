import { NextResponse } from 'next/server'

// Bounded search cache with LRU / eviction capacity
const MAX_CACHE_ENTRIES = 100
const MAX_QUERY_LENGTH = 200

export interface StructuredSearchFilters {
  cleanSearchTerm: string
  maxPrice: number | null
  material: string | null
  category: string | null
  technology: string | null
}

interface CacheEntry {
  filters: StructuredSearchFilters
  aiAnalysis: {
    detectedCategory: string
    expandedKeywords: string[]
  }
}

const SEARCH_CACHE = new Map<string, CacheEntry>()

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    if (typeof payload.query !== 'string') {
      return NextResponse.json({ error: 'Query parameter must be a string' }, { status: 400 })
    }

    const query = payload.query.trim()
    const cleanQuery = query.toLowerCase()
    const isCacheable = cleanQuery.length > 0 && cleanQuery.length <= MAX_QUERY_LENGTH

    // Check LRU cache first to prevent redundant AI calls
    if (isCacheable && SEARCH_CACHE.has(cleanQuery)) {
      const cached = SEARCH_CACHE.get(cleanQuery)!
      return NextResponse.json({
        success: true,
        query,
        cached: true,
        filters: cached.filters,
        aiAnalysis: cached.aiAnalysis,
      })
    }

    // Default / Fallback regex parser for natural language
    let cleanSearchTerm = query
    let maxPrice: number | null = null
    let material: string | null = null
    let category: string | null = null
    let technology: string | null = null

    // Extract price pattern (e.g. under ₹500, below 300, < 400)
    const priceMatch = query.match(/(?:under|below|less than|<|₹|rs\.?)\s*(\d+)/i) || query.match(/(\d+)\s*(?:rupees|rs|inr)/i)
    if (priceMatch) {
      maxPrice = Number(priceMatch[1])
    }

    // Extract material pattern
    const materialsList = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon']
    for (const m of materialsList) {
      if (new RegExp(`\\b${m}\\b`, 'i').test(query)) {
        material = m
        break
      }
    }

    // Extract category
    if (/phone|holder|stand|desk|cable/i.test(query)) {
      category = 'Office & Desk'
    } else if (/toy|game|dragon|figure/i.test(query)) {
      category = 'Toys & Games'
    } else if (/cosplay|helmet|visor|prop/i.test(query)) {
      category = 'Personalized & Props'
    }

    // Clean search term by stripping price/material keywords
    cleanSearchTerm = query
      .replace(/(?:under|below|less than|<|₹|rs\.?)\s*\d+/gi, '')
      .replace(/(?:printed using|in|with|using|made of)\s*(?:PLA|PETG|ABS|TPU|Resin|Nylon)/gi, '')
      .replace(/\b(?:I need|a|an|for|that|can|be|printed)\b/gi, '')
      .trim()

    const detectedCategory = category || '3D Printing'
    let expandedKeywords = [cleanSearchTerm || query, material || 'PLA', '3d model', 'printable'].filter(Boolean)

    // Call Google Gemini API (Server-side) with 5-Second Abort Guard
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && cleanQuery) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const prompt = `Analyze this 3D printing customer search query: "${query}".
Extract structured JSON filters matching this schema:
{
  "cleanSearchTerm": "extracted core product topic (e.g. phone stand)",
  "maxPrice": number or null (e.g. 500),
  "material": "PLA" | "PETG" | "ABS" | "TPU" | "Resin" | null,
  "category": "Office & Desk" | "Toys & Games" | "Personalized & Props" | "Home & Living" | null,
  "technology": "FDM" | "SLA" | "SLS" | null,
  "expandedKeywords": ["keyword1", "keyword2", "keyword3"]
}`

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
            if (parsed.cleanSearchTerm) cleanSearchTerm = parsed.cleanSearchTerm
            if (typeof parsed.maxPrice === 'number') maxPrice = parsed.maxPrice
            if (parsed.material) material = parsed.material
            if (parsed.category) category = parsed.category
            if (parsed.technology) technology = parsed.technology
            if (Array.isArray(parsed.expandedKeywords)) expandedKeywords = parsed.expandedKeywords
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini natural language search fallback:', geminiErr)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const filters: StructuredSearchFilters = {
      cleanSearchTerm: cleanSearchTerm || query,
      maxPrice,
      material,
      category,
      technology,
    }

    const aiAnalysis = {
      detectedCategory: category || detectedCategory,
      expandedKeywords,
    }

    const cacheEntry = { filters, aiAnalysis }

    if (isCacheable) {
      if (SEARCH_CACHE.size >= MAX_CACHE_ENTRIES) {
        const firstKey = SEARCH_CACHE.keys().next().value
        if (firstKey) SEARCH_CACHE.delete(firstKey)
      }
      SEARCH_CACHE.set(cleanQuery, cacheEntry)
    }

    return NextResponse.json({
      success: true,
      query,
      cached: false,
      filters,
      aiAnalysis,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
