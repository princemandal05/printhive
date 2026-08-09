import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { useCase = '', environment = 'indoor', durability = 'standard' } = body

    let recommendedMaterial = 'PLA'
    let reasoning = 'PLA is optimal for standard indoor accessories, prototyping, and decorative models with easy printing.'
    let bedTemp = '60°C'
    let printTemp = '210°C'
    let score = '95%'

    const lowerCase = `${useCase} ${environment} ${durability}`.toLowerCase()

    if (lowerCase.includes('outdoor') || lowerCase.includes('water') || lowerCase.includes('heat') || lowerCase.includes('car')) {
      recommendedMaterial = 'PETG'
      reasoning = 'PETG provides high UV resistance, water resistance, and heat tolerance up to 80°C, making it ideal for outdoor and functional parts.'
      bedTemp = '80°C'
      printTemp = '240°C'
    } else if (lowerCase.includes('flexible') || lowerCase.includes('rubber') || lowerCase.includes('phone case') || lowerCase.includes('gasket')) {
      recommendedMaterial = 'TPU'
      reasoning = 'TPU is an elastomeric flexible filament with high shock absorption, impact resistance, and flexibility.'
      bedTemp = '50°C'
      printTemp = '225°C'
    } else if (lowerCase.includes('miniature') || lowerCase.includes('jewelry') || lowerCase.includes('high detail') || lowerCase.includes('figurine')) {
      recommendedMaterial = 'Resin'
      reasoning = 'Resin SLA 8K printing delivers sub-50 micron layer resolution, ultra-smooth surfaces, and crisp fine detail.'
      bedTemp = 'N/A (SLA Vat)'
      printTemp = 'UV 405nm'
    } else if (lowerCase.includes('mechanical') || lowerCase.includes('gear') || lowerCase.includes('high strength') || lowerCase.includes('impact')) {
      recommendedMaterial = 'ABS'
      reasoning = 'ABS provides superior impact strength and ductility under mechanical loads, suitable for functional enclosures.'
      bedTemp = '100°C'
      printTemp = '250°C'
    }

    // Call Google Gemini API (Server-side) with 5-Second Abort Guard
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey && useCase) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const prompt = `Recommend the optimal 3D printing material (PLA, PETG, ABS, TPU, or Resin) for this use case: "${useCase}", environment: "${environment}", durability: "${durability}". Return JSON: {"recommendedMaterial": "...", "reasoning": "...", "bedTemp": "...", "printTemp": "...", "score": "98%"}`
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
            if (parsed.recommendedMaterial) recommendedMaterial = parsed.recommendedMaterial
            if (parsed.reasoning) reasoning = parsed.reasoning
            if (parsed.bedTemp) bedTemp = parsed.bedTemp
            if (parsed.printTemp) printTemp = parsed.printTemp
            if (parsed.score) score = parsed.score
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini material recommendation fallback:', geminiErr)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    return NextResponse.json({
      success: true,
      recommendation: {
        material: recommendedMaterial,
        reasoning,
        bedTemp,
        printTemp,
        score,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
