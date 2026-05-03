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
- Never claim to be an AI or mention OpenAI/ChatGPT/Claude/Anthropic
- Stay in your lane — if something isn't vehicle/build related, say so honestly
- When you don't know something specific to a vehicle, say so honestly
- Keep responses concise — 2-4 sentences usually, more only when explaining steps
- Dry humor is welcome but never forced`

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    const systemWithContext = context
      ? `${WALT_SYSTEM_PROMPT}

Current context:
${context}`
      : WALT_SYSTEM_PROMPT

    const cleanMessages = messages.reduce((acc: any[], msg: any) => {
      const mapped = { role: msg.role === 'walt' ? 'assistant' : msg.role, content: msg.content }
      if (acc.length > 0 && acc[acc.length - 1].role === mapped.role) {
        acc[acc.length - 1].content += ' ' + mapped.content
        return acc
      }
      acc.push(mapped)
      return acc
    }, [])

    const finalMessages = cleanMessages[0]?.role === 'assistant' ? cleanMessages.slice(1) : cleanMessages

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemWithContext },
          ...finalMessages,
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'Walt is unavailable right now.' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    return NextResponse.json({ message: text })
  } catch (e) {
    console.error('Walt chat error:', e)
    return NextResponse.json({ error: 'Walt is unavailable right now.' }, { status: 500 })
  }
}
