import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type GeneratedStep = {
  name: string
  instructions?: string
  difficulty?: 'Easy' | 'Moderate' | 'Advanced' | 'Pro'
  estimated_hours?: number
  cost_estimate?: number
  diy_or_shop?: 'DIY' | 'Shop' | 'Either'
}

type GeneratedPhase = {
  name: string
  cost_estimate?: number
  steps: GeneratedStep[]
}

type GeneratedPlan = {
  phases: GeneratedPhase[]
}

const PLAN_SYSTEM_PROMPT = `You are Walt, a seasoned mechanic and build partner for BYLDit.ai. Generate practical vehicle project plans that can be saved into phases and steps.

Return only valid JSON. No markdown. No commentary.

Schema:
{
  "phases": [
    {
      "name": "Phase name",
      "cost_estimate": 500,
      "steps": [
        {
          "name": "Step name",
          "instructions": "Short, useful guidance for the user.",
          "difficulty": "Easy | Moderate | Advanced | Pro",
          "estimated_hours": 2,
          "cost_estimate": 100,
          "diy_or_shop": "DIY | Shop | Either"
        }
      ]
    }
  ]
}

Rules:
- Create 3 to 6 phases.
- Each phase should have 2 to 5 steps.
- Sequence the project in the order a mechanic would actually do it.
- Keep step names short and garage-friendly.
- Cost and hour estimates can be rough.
- Use "Shop" for paint, structural, safety-critical, or highly specialized work when appropriate.
- Use only these difficulty values: Easy, Moderate, Advanced, Pro.
- Use only these diy_or_shop values: DIY, Shop, Either.`

function cleanJson(text: string) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function normalizeDifficulty(value: unknown): GeneratedStep['difficulty'] {
  if (value === 'Easy' || value === 'Moderate' || value === 'Advanced' || value === 'Pro') return value
  return 'Moderate'
}

function normalizeDiyOrShop(value: unknown): GeneratedStep['diy_or_shop'] {
  if (value === 'DIY' || value === 'Shop' || value === 'Either') return value
  return 'Either'
}

function normalizeMoney(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function normalizeHours(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await context.params
    const authHeader = req.headers.get('authorization') || ''
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { data: existingPhases } = await supabase
      .from('phases')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .limit(1)

    if ((existingPhases?.length ?? 0) > 0) {
      return NextResponse.json({ projectId, alreadyGenerated: true })
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        goal_type,
        condition,
        budget_estimate,
        vehicle:vehicles (
          id,
          nickname,
          year,
          make,
          model,
          color,
          engine,
          transmission,
          drivetrain,
          mileage,
          condition,
          notes
        )
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: notes } = await supabase
      .from('notes')
      .select('content, author, created_at')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    const planContext = JSON.stringify({
      project,
      notes: notes || [],
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.45,
        max_tokens: 2500,
        messages: [
          { role: 'system', content: PLAN_SYSTEM_PROMPT },
          { role: 'user', content: `Generate the BYLDit.ai project plan for this intake:\n${planContext}` },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Project plan generation error:', errorText)
      return NextResponse.json({ error: 'Walt could not generate the project plan right now.' }, { status: 500 })
    }

    const data = await response.json()
    const rawPlan = data.choices?.[0]?.message?.content || ''
    let generated: GeneratedPlan

    try {
      generated = JSON.parse(cleanJson(rawPlan)) as GeneratedPlan
    } catch (error) {
      console.error('Project plan JSON parse error:', error, rawPlan)
      return NextResponse.json({ error: 'Walt generated a plan, but it could not be saved yet.' }, { status: 500 })
    }

    const phases = Array.isArray(generated.phases)
      ? generated.phases.filter(phase => phase?.name && Array.isArray(phase.steps) && phase.steps.length > 0).slice(0, 6)
      : []

    if (phases.length === 0) {
      return NextResponse.json({ error: 'Walt did not return enough plan detail.' }, { status: 500 })
    }

    for (const [phaseIndex, phase] of phases.entries()) {
      const { data: savedPhase, error: phaseError } = await supabase
        .from('phases')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: phase.name.slice(0, 120),
          order_index: phaseIndex,
          status: phaseIndex === 0 ? 'in_progress' : 'upcoming',
          cost_estimate: normalizeMoney(phase.cost_estimate),
        })
        .select('id')
        .single()

      if (phaseError || !savedPhase) {
        console.error('Phase save error:', phaseError)
        return NextResponse.json({ error: 'Project plan could not be saved.' }, { status: 500 })
      }

      const steps = phase.steps.slice(0, 5).map((step, stepIndex) => ({
        phase_id: savedPhase.id,
        user_id: user.id,
        name: String(step.name || `Step ${stepIndex + 1}`).slice(0, 140),
        instructions: step.instructions ? String(step.instructions).slice(0, 1200) : null,
        difficulty: normalizeDifficulty(step.difficulty),
        estimated_hours: normalizeHours(step.estimated_hours),
        cost_estimate: normalizeMoney(step.cost_estimate),
        diy_or_shop: normalizeDiyOrShop(step.diy_or_shop),
        status: 'not_started',
        order_index: stepIndex,
      }))

      const { error: stepsError } = await supabase.from('steps').insert(steps)
      if (stepsError) {
        console.error('Steps save error:', stepsError)
        return NextResponse.json({ error: 'Project steps could not be saved.' }, { status: 500 })
      }
    }

    await supabase.from('notes').insert({
      project_id: projectId,
      user_id: user.id,
      author: 'walt',
      content: 'Generated the first project plan with phases and steps.',
    })

    return NextResponse.json({ projectId, generated: true })
  } catch (error) {
    console.error('Generate project plan route error:', error)
    return NextResponse.json({ error: 'Project plan generation failed.' }, { status: 500 })
  }
}
