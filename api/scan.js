// In-memory rate limit store: ip -> { count, resetAt }
const rateLimitStore = new Map()
const MAX_REQUESTS_PER_DAY = 10

function getRateLimitEntry(ip) {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  // Calculate next midnight UTC
  const nextMidnight = new Date()
  nextMidnight.setUTCHours(24, 0, 0, 0)
  const resetAt = nextMidnight.getTime()

  if (!entry || now >= entry.resetAt) {
    const fresh = { count: 0, resetAt }
    rateLimitStore.set(ip, fresh)
    return fresh
  }
  return entry
}

function buildUserPrompt(triedBottles) {
  const jsonSchema = `Respond with this exact JSON structure:
{
  "name": "full bottle name including age statement if visible",
  "distillery": "distillery name or null",
  "type": "one of: Bourbon, Rye, Scotch, Irish, Japanese, Canadian, Tennessee, Other",
  "proof": number or null,
  "description": "2-3 sentences covering flavor profile, style, and what kind of drinker it suits. Be specific and sensory.",
  "tastingNotes": ["note1", "note2", "note3"],
  "matchScore": "High" | "Medium" | "Low",
  "matchReason": "1-2 sentences explaining why this does or does not match the user's taste profile. If no history, write a general recommendation instead.",
  "isPersonalized": true | false,
  "confidence": "high" | "medium" | "low"
}
If you cannot read a field clearly from the label, use null. Do not guess on proof — only include it if clearly printed.`

  if (triedBottles.length > 0) {
    const bottleList = triedBottles
      .map((b) => `- ${b.name} (${b.type}): ${b.rating}/10. Notes: ${b.notes || 'none'}`)
      .join('\n')

    return `Identify this whiskey bottle using the label and your knowledge of this specific bottling, then evaluate whether this user would enjoy it.

The user has rated these bottles:
${bottleList}

Based on their taste history, evaluate how well this bottle matches their preferences and give a personalized match score.

${jsonSchema}`
  }

  return `Identify this whiskey bottle using the label and your knowledge of this specific bottling. The user has no rated bottles yet — provide a general critic-style assessment drawing on your expertise.

${jsonSchema}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' })
  }

  // Determine IP
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  // Rate limiting
  const entry = getRateLimitEntry(ip)
  if (entry.count >= MAX_REQUESTS_PER_DAY) {
    return res.status(429).json({
      error: true,
      message: 'Daily scan limit reached. Try again tomorrow.',
    })
  }
  entry.count += 1

  const { image, mimeType, triedBottles = [] } = req.body

  if (!image || !mimeType) {
    return res.status(400).json({ error: true, message: 'Missing image or mimeType.' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system:
          'You are an expert whiskey reviewer and sommelier with encyclopedic knowledge of whiskeys worldwide. When shown a bottle, identify it from the label and supplement with your full knowledge of that specific product — including flavor profile, production details, distillery notes, and critical reception. If you can identify the bottle, do not limit your response to what is printed on the label; use everything you know about it. Always respond in valid JSON only. No markdown, no code blocks, no explanation outside the JSON.',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: image,
                },
              },
              {
                type: 'text',
                text: buildUserPrompt(triedBottles),
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return res.status(500).json({ error: true, message: "Couldn't read the bottle. Try a clearer photo of the front label." })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? ''

    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error('Failed to parse Claude response as JSON:', rawText)
      return res.status(500).json({ error: true, message: "Couldn't read the bottle. Try a clearer photo of the front label." })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Scan handler error:', err)
    return res.status(500).json({ error: true, message: "Couldn't read the bottle. Try a clearer photo of the front label." })
  }
}
