import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { WALT_SYSTEM_PROMPT } from '@/lib/walt-prompt'
import { formatWaltContextPack } from '@/lib/walt-context'

type IncomingMessage = {
  role: 'user' | 'assistant' | 'walt' | 'system'
  content: string
}

type OpenAIMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type WaltAction = {
  type: 'save_note' | 'add_part'
  content?: string
  name?: string
  quantity?: number
  notes?: string
  part_number?: string
  source?: string
}

type WaltResponse = {
  reply: string
  actions?: WaltAction[]
}

type ServerSupabase = {
  from: (table: string) => {
    insert: (values: Record<string, unknown> | Record<string, unknown>[]) => Promise<{ error: unknown }>
  }
}

const WALT_ACTION_RULES = `## App Memory and Safe Skills
You receive a WALT CONTEXT PACK with the user's current app memory. Treat it as the source of truth.

When useful vehicle data exists, answer from that data first. Do not tell the user to "check the vehicle profile" as your main answer.
If a spec is likely but not confirmed, give the best practical answer with careful wording, then say exactly what to verify.

You can use these safe BYLDit skills:
1. save_note — when the user asks you to remember, note, save, flag for later, or record something.
2. add_part — when the user asks you to add a part/material/supply to the project parts list.

Return only valid JSON with this shape:
{
  "reply": "What Walt says to the user.",
  "actions": [
    { "type": "save_note", "content": "note text" },
    { "type": "add_part", "name": "part name", "quantity": 1, "notes": "optional note", "part_number": "optional", "source": "optional" }
  ]
}

Only include actions when the user clearly asks for the app to save or add something. Do not include destructive actions.`

const cleanJson = (text: string) => text
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/```$/i, '')
  .trim()

const toMoney = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const safeText = (value: unknown, max = 500) => String(value || '').trim().slice(0, max)

async function buildContextFromDatabase({
  authHeader,
  pageContext,
  screen,
  vehicleId,
  projectId,
  phaseId,
  stepId,
}: {
  authHeader: string
  pageContext?: string
  screen?: string
  vehicleId?: string
  projectId?: string
  phaseId?: string
  stepId?: string
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { context: pageContext || '', userId: null, supabase }

  const [{ data: profile }, { data: vehicle }, { data: project }, { data: phase }, { data: step }] = await Promise.all([
    supabase.from('profiles').select('name, experience, reason').eq('id', user.id).maybeSingle(),
    vehicleId
      ? supabase.from('vehicles').select('nickname, year, make, model, trim, vin, color, engine, fuel_type, transmission, drivetrain, mileage, condition, notes').eq('id', vehicleId).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    projectId
      ? supabase.from('projects').select('name, goal_type, condition, budget_estimate, budget_actual, status').eq('id', projectId).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    phaseId
      ? supabase.from('phases').select('name, status, cost_estimate').eq('id', phaseId).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    stepId
      ? supabase.from('steps').select('name, status, difficulty, estimated_hours, cost_estimate, diy_or_shop, instructions').eq('id', stepId).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const [{ data: notes }, { data: parts }, { data: recentMessages }] = await Promise.all([
    projectId
      ? supabase.from('notes').select('content, author').eq('project_id', projectId).eq('user_id', user.id).order('created_at', { ascending: false }).limit(8)
      : supabase.from('notes').select('content, author').eq('user_id', user.id).is('project_id', null).order('created_at', { ascending: false }).limit(8),
    projectId
      ? supabase.from('parts').select('name, quantity, part_number, status, notes').eq('project_id', projectId).eq('user_id', user.id).order('created_at', { ascending: false }).limit(12)
      : Promise.resolve({ data: [] }),
    supabase.from('walt_messages').select('role, content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
  ])

  const context = formatWaltContextPack({
    screen,
    userName: profile?.name || user.email?.split('@')[0] || 'there',
    routeContext: screen,
    vehicle,
    project,
    phase,
    step,
    notes: (notes || []).map(note => `${note.author}: ${note.content}`),
    parts: (parts || []).map(part => [
      `${part.quantity || 1}x ${part.name}`,
      part.part_number ? `#${part.part_number}` : '',
      part.status ? `(${part.status})` : '',
      part.notes ? `- ${part.notes}` : '',
    ].filter(Boolean).join(' ')),
    recentMessages: (recentMessages || []).reverse().map(msg => `${msg.role}: ${msg.content}`),
    pageContext,
  })

  return { context, userId: user.id, supabase }
}

async function applyActions({
  actions,
  supabase,
  userId,
  projectId,
  stepId,
}: {
  actions: WaltAction[]
  supabase: ServerSupabase
  userId: string | null
  projectId?: string
  stepId?: string
}) {
  if (!userId) return []
  const applied: string[] = []

  for (const action of actions.slice(0, 3)) {
    if (action.type === 'save_note') {
      const content = safeText(action.content, 1000)
      if (!content) continue
      const { error } = await supabase.from('notes').insert({
        user_id: userId,
        project_id: projectId || null,
        step_id: stepId || null,
        author: 'walt',
        content,
      })
      if (!error) applied.push('Saved note')
    }

    if (action.type === 'add_part') {
      if (!projectId) continue
      const name = safeText(action.name, 180)
      if (!name) continue
      const quantity = Number.isFinite(Number(action.quantity)) && Number(action.quantity) > 0 ? Math.round(Number(action.quantity)) : 1
      const { error } = await supabase.from('parts').insert({
        user_id: userId,
        project_id: projectId,
        step_id: stepId || null,
        name,
        quantity,
        part_number: safeText(action.part_number, 120) || null,
        source: safeText(action.source, 160) || null,
        notes: safeText(action.notes, 500) || null,
        status: 'needed',
        added_via: 'walt',
        cost_estimate: toMoney(null),
      })
      if (!error) applied.push(`Added part: ${name}`)
    }
  }

  return applied
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      messages?: IncomingMessage[]
      context?: string
      vehicleId?: string
      projectId?: string
      phaseId?: string
      stepId?: string
      screen?: string
    }
    const authHeader = req.headers.get('authorization') || ''
    const { context, userId, supabase } = await buildContextFromDatabase({
      authHeader,
      pageContext: body.context,
      screen: body.screen,
      vehicleId: body.vehicleId,
      projectId: body.projectId,
      phaseId: body.phaseId,
      stepId: body.stepId,
    })

    const cleanMessages = (body.messages || []).reduce<OpenAIMessage[]>((acc, msg) => {
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
        temperature: 0.45,
        max_tokens: 1400,
        messages: [
          { role: 'system', content: `${WALT_SYSTEM_PROMPT}\n\n${WALT_ACTION_RULES}` },
          { role: 'system', content: `Current context:\n${context}` },
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
    const rawText = data.choices?.[0]?.message?.content || ''
    let parsed: WaltResponse
    try {
      parsed = JSON.parse(cleanJson(rawText)) as WaltResponse
    } catch {
      parsed = { reply: rawText, actions: [] }
    }

    const applied = await applyActions({
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      supabase: supabase as unknown as ServerSupabase,
      userId,
      projectId: body.projectId,
      stepId: body.stepId,
    })

    const blockedPart = parsed.actions?.some(action => action.type === 'add_part') && !body.projectId
    const actionNote = applied.length ? `\n\n${applied.join('. ')}.` : blockedPart ? '\n\nI need an active project before I can add that part to a parts list.' : ''

    return NextResponse.json({ message: `${parsed.reply || ''}${actionNote}`.trim(), actionsApplied: applied })
  } catch (e) {
    console.error('Walt chat error:', e)
    return NextResponse.json({ error: 'Walt is unavailable right now.' }, { status: 500 })
  }
}
