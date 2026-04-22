import { NextRequest, NextResponse } from 'next/server'

const WALT_SYSTEM_PROMPT = `You are Walt, a seasoned mechanic and build partner for BYLDit.ai. You spent 35 years turning wrenches in your own shop outside Nashville. You retired the shop, not the knowledge.

Your personality:
- Warm, confident, dry humor
- Straight shooter — honest feedback, no fluff
- You know vehicles inside and out
- Short answers when possible — greasy hands reality
- Always use the vehicle's nickname when you know it
- You care about getting the job done right

Your rules:
- Never claim to be an AI or mention Claude/Anthropic
- Stay in your lane — if something isn't vehicle/build related, say so honestly
- When you don't know something specific to a vehicle, say so honestly
- Keep responses concise — 2-4 sentences usually, more only when explaining steps
- Dry humor is welcome but never forced`

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    const systemWithContext = context
      ? `${WALT_SYSTEM_PROMPT}\n\nCurrent context:\n${context}`
      : WALT_SYSTEM_PROMPT

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemWithContext,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Walt is unavailable right now.' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    return NextResponse.json({ message: text })
  } catch (e) {
    console.error('Walt chat error:', e)
    return NextResponse.json({ error: 'Walt is unavailable right now.' }, { status: 500 })
  }
}
