import { NextResponse } from 'next/server'

// Bounded search cache with LRU / eviction capacity
const MAX_CACHE_ENTRIES = 100
const MAX_QUERY_LENGTH = 200
const SEARCH_CACHE = new Map<string, { detectedCategory: string; expandedKeywords: string[] }>()

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

    const query = payload.query
    const cleanQuery = query.toLowerCase().trim()
    const isCacheable = cleanQuery.length > 0 && cleanQuery.length <= MAX_QUERY_LENGTH

    if (isCacheable && SEARCH_CACHE.has(cleanQuery)) {
      const cached = SEARCH_CACHE.get(cleanQuery)!
      return NextResponse.json({
        success: true,
        query,
        cached: true,
        aiAnalysis: cached,
      })
    }

    const keywords = cleanQuery
      .split(' ')
      .filter((w: string) => w.length > 2)

    let detectedCategory = cleanQuery.includes('headphone') || cleanQuery.includes('desk') ? 'Office Accessories' : 'Home Décor'
    let expandedKeywords = [...keywords, '3d print', 'high resolution', 'custom model']

    // Google Gemini API Call with 5-Second Abort Timeout Guard
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && cleanQuery) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const prompt = `Analyze search query "${query}" for a 3D printing marketplace. Return JSON with detectedCategory and array of 3 expandedKeywords: {"detectedCategory": "...", "expandedKeywords": ["...", "..."]}`
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
            if (typeof parsed.detectedCategory === 'string' && parsed.detectedCategory.trim().length > 0) {
              detectedCategory = parsed.detectedCategory.trim()
            }
            if (
              Array.isArray(parsed.expandedKeywords) &&
              parsed.expandedKeywords.length > 0 &&
              parsed.expandedKeywords.every((k: unknown) => typeof k === 'string' && k.trim().length > 0)
            ) {
              expandedKeywords = parsed.expandedKeywords.map((k: unknown) => (k as string).trim()).slice(0, 5)
            }
          }
        }
      } catch (geminiErr) {
        // Fallback keyword parser
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const aiAnalysis = { detectedCategory, expandedKeywords }
    if (isCacheable) {
      if (SEARCH_CACHE.size >= MAX_CACHE_ENTRIES) {
        const firstKey = SEARCH_CACHE.keys().next().value
        if (firstKey) SEARCH_CACHE.delete(firstKey)
      }
      SEARCH_CACHE.set(cleanQuery, aiAnalysis)
    }

    return NextResponse.json({
      success: true,
      query,
      cached: false,
      aiAnalysis,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
