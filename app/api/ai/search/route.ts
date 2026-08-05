import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query = '' } = body

    const keywords = query
      .toLowerCase()
      .split(' ')
      .filter((w: string) => w.length > 2)

    let detectedCategory = query.includes('headphone') || query.includes('desk') ? 'Office Accessories' : 'Home Décor'
    let expandedKeywords = [...keywords, '3d print', 'high resolution', 'custom model']

    // Google Gemini API Call with 5-Second Abort Timeout Guard
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && query.trim()) {
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

    return NextResponse.json({
      success: true,
      query,
      aiAnalysis: {
        detectedCategory,
        expandedKeywords,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
