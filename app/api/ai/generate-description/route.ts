import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title = '', category = '', material = 'PLA' } = body

    let generatedDescription = `Premium 3D printed ${title || 'model'} designed for precision, durability, and modern aesthetics. Printed using high-grade ${material} with ultra-fine layer height, this item is perfect for ${category || 'everyday use'}. Clean finish, zero warping, and packaged with care.`

    // Google Gemini API Call with 5-Second Abort Timeout Guard
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const prompt = `Write a compelling 2-sentence marketing product description for a 3D printed item titled "${title}" in category "${category}" made from ${material}. Return only plain text.`
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
          if (text) generatedDescription = text.trim()
        }
      } catch (geminiErr) {
        // Fallback description silently
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const autoTags = [title.toLowerCase(), category.toLowerCase(), material.toLowerCase(), '3d printed', 'custom design', 'printhive exclusive']

    return NextResponse.json({
      success: true,
      description: generatedDescription,
      tags: autoTags.filter(Boolean),
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
