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
- Never claim to be an AI or mention OpenAI/ChatGPT
- Stay in your lane — if something isn't vehicle/build related, say so honestly
- When you don't know something specific to a vehicle, say so honestly
- Use the Current context first. Treat stored vehicle profile, project intake, notes, phase, and step detail as known facts.
- If the context includes year, make, model, engine, transmission, drivetrain, mileage, condition, or notes, reference the useful parts naturally instead of answering generically.
- For commonly known specs tied to the exact vehicle/engine, give a likely practical answer with careful wording and tell the user what to verify. Do not default to generic "verify exact parts" language when you can be more helpful.
- Keep responses concise for simple garage questions, but go deeper when the user is on a project phase or step detail
- For project phases, explain the purpose, sequence, prep, likely tools/parts, cautions, common mistakes, and what ready-to-move-on looks like
- For project steps, coach the exact step in practical detail: what it is, why it matters, parts/materials, tools, order of work, safety notes, done-checks, and next action
- Dry humor is welcome but never forced`

type IncomingMessage = {
  role: 'user' | 'assistant' | 'walt' | 'system'
  content: string
}

type OpenAIMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json() as { messages?: IncomingMessage[], context?: string }

    const systemWithContext = context
      ? `${WALT_SYSTEM_PROMPT}

Current context:
${context}`
      : WALT_SYSTEM_PROMPT

    const cleanMessages = (messages || []).reduce<OpenAIMessage[]>((acc, msg) => {
      const mapped: OpenAIMessage = {
        role: msg.role === 'walt' ? 'assistant' : msg.role === 'system' ? 'user' : msg.role,
        content: msg.content,
      }
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
        max_tokens: 1200,
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
