import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title = '', category = '', material = 'PLA' } = body

    let generatedDescription = `Premium 3D printed ${title || 'model'} designed for precision, durability, and modern aesthetics. Printed using high-grade ${material} with ultra-fine layer height, this item is perfect for ${category || 'everyday use'}. Clean finish, zero warping, and packaged with care.`
    let tags = [
      title.toLowerCase().trim(),
      category.toLowerCase().trim(),
      material.toLowerCase().trim(),
      '3d printed',
      'custom design',
      'printhive exclusive',
      'fdm precision',
    ].filter(Boolean)

    // Call Google Gemini API (Server-side) with 5-Second Abort Guard
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && title) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const prompt = `Write a compelling 2-sentence marketing product description and 6 relevant product tags for a 3D printed item titled "${title}" in category "${category}" made from ${material}. Return JSON: {"description": "...", "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]}`
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
            if (parsed.description) generatedDescription = parsed.description.trim()
            if (Array.isArray(parsed.tags) && parsed.tags.length > 0) {
              tags = parsed.tags.map((t: string) => t.toLowerCase().trim())
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini description generation fallback:', geminiErr)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    return NextResponse.json({
      success: true,
      description: generatedDescription,
      tags: Array.from(new Set(tags)).slice(0, 8),
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
