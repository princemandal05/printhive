import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dimensions = '10x10x10cm', material = 'PLA', infill = 20, scale = 100 } = body

    // 1. Math Slicing Calculation Model
    const infillFactor = 1 + (infill - 20) / 100
    const scaleFactor = Math.pow(scale / 100, 3)

    const estimatedWeightGrams = Math.round(120 * infillFactor * scaleFactor)
    const estimatedHours = Number((1.5 * infillFactor * scaleFactor).toFixed(1))
    const baseMaterialCostPerGram = material === 'Resin' ? 4.5 : material === 'ABS' ? 3.0 : 2.5
    const materialCost = Math.round(estimatedWeightGrams * baseMaterialCostPerGram)
    const printTimeCost = Math.round(estimatedHours * 80)
    const recommendedPrice = Math.max(150, materialCost + printTimeCost + 100)

    let aiPrintabilityScore = '98% (High Success Probability)'
    let recommendations = [
      'No supports required for current orientation.',
      'Recommended print bed temperature: 60°C.',
    ]

    // 2. Google Gemini API Call (If GEMINI_API_KEY is configured)
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      try {
        const prompt = `Analyze 3D print slicing feasibility for a model with dimensions ${dimensions}, material ${material}, infill ${infill}%, scale ${scale}%. Provide printability score and 2 actionable recommendations in JSON format: {"score": "98%", "recommendations": ["rec1", "rec2"]}`
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
          if (parsed.score) aiPrintabilityScore = parsed.score
          if (parsed.recommendations) recommendations = parsed.recommendations
        }
      } catch (geminiErr) {
        // Fallback to slicer formula
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        estimatedWeightGrams,
        estimatedHours,
        recommendedPrice,
        material,
        infill,
        aiPrintabilityScore,
        recommendations,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
