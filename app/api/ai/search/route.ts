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

    // Google Gemini API Call (If GEMINI_API_KEY is configured)
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && query.trim()) {
      try {
        const prompt = `Analyze search query "${query}" for a 3D printing marketplace. Return JSON with detectedCategory and array of 3 expandedKeywords: {"detectedCategory": "...", "expandedKeywords": ["...", "..."]}`
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        })
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
          if (parsed.detectedCategory) detectedCategory = parsed.detectedCategory
          if (parsed.expandedKeywords) expandedKeywords = parsed.expandedKeywords
        }
      } catch (geminiErr) {
        // Fallback keyword parser
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
