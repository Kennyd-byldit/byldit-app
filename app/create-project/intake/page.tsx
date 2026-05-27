'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BottomNav, LoadingScreen, MobileAppFrame, MobileHeader, VehicleHero } from '@/components/AppChrome'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import { supabase } from '@/lib/supabase'
import { getVehicleName } from '@/lib/vehicle-display'
import type { VehicleSummary } from '@/lib/types'
import {
  PROJECT_MODE_EXAMPLES,
  PROJECT_MODE_LABELS,
  PROJECT_MODE_OPENERS,
  PROJECT_MODES,
  ProjectMode,
  getPlanTypeForMode,
} from '@/lib/project-modes'

type Message = { role: 'user' | 'walt'; content: string }
type Vehicle = VehicleSummary

const WALT = WALT_AVATAR_URL

const MODE_GUIDANCE: Record<ProjectMode, string> = {
  maintenance: 'Pick a quick starter if one fits, or just tell me what service you want to do. We can talk through parts, brands, tools, and what to verify before I build the project.',
  repair: 'Tell me what is broken or what you think needs replacing. We can sort symptoms, parts, tools, and the safest repair path before I build it.',
  upgrade: 'Tell me what you want to improve. We can compare options, fitment, brands, budget, and install approach before I build it.',
  restoration: 'Tell me the big goal and the current condition. We can shape the phases, priorities, budget, and work environment before I build it.',
  diagnostic: 'Tell me what feels wrong. I will start with safety, ask a few diagnostic questions, and help narrow it down before we turn it into a repair.',
}

function isProjectMode(value: string): value is ProjectMode {
  return PROJECT_MODES.includes(value as ProjectMode)
}

function cleanTitle(input: string) {
  const cleaned = input
    .replace(/[^\w\s/&+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)

  if (!cleaned) return 'New Project'

  return cleaned
    .split(' ')
    .map(word => word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function getLastUserMessage(messages: Message[]) {
  return [...messages].reverse().find(message => message.role === 'user')?.content || ''
}

function getLastWaltMessage(messages: Message[]) {
  return [...messages].reverse().find(message => message.role === 'walt')?.content || ''
}

function buildProjectName(vehicle: Vehicle, mode: ProjectMode, selectedStarter: string, messages: Message[]) {
  const task = selectedStarter || getLastUserMessage(messages)
  const title = cleanTitle(task)
  if (title === 'New Project') return `${getVehicleName(vehicle)} ${PROJECT_MODE_LABELS[mode]}`
  return `${getVehicleName(vehicle)} ${title}`
}

function buildIntakeSummary(vehicle: Vehicle, mode: ProjectMode, selectedStarter: string, messages: Message[]) {
  const userDetail = getLastUserMessage(messages)
  const waltDetail = getLastWaltMessage(messages)
  const starter = selectedStarter ? `Highlighted task: ${selectedStarter}. ` : ''
  const userLine = userDetail ? `User detail: ${userDetail}. ` : ''
  const waltLine = waltDetail ? `Latest Walt guidance: ${waltDetail}` : ''

  return `${PROJECT_MODE_LABELS[mode]} project for ${getVehicleName(vehicle)}. ${starter}${userLine}${waltLine}`.trim()
}

function starterOpening(mode: ProjectMode, vehicle: Vehicle, selectedStarter?: string) {
  if (selectedStarter) {
    return `Got it, I highlighted ${selectedStarter} for ${getVehicleName(vehicle)}. What do you want to know before I build this project? We can talk parts, brands, tools, budget, or the exact checklist.`
  }

  return `${PROJECT_MODE_OPENERS[mode]} ${MODE_GUIDANCE[mode]}`
}

function IntakeContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const modeParam = searchParams.get('mode') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedStarter, setSelectedStarter] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const mode = isProjectMode(modeParam) ? modeParam : null
  const planType = getPlanTypeForMode(mode)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      if (!mode) { window.location.replace(`/create-project/goal?vehicle=${vehicleId}`); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data } = await supabase
        .from('vehicles')
        .select('id, nickname, year, make, model, trim, cover_photo_url')
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .single()

      if (!data) { window.location.replace('/create-project'); return }
      setVehicle(data as Vehicle)
      setUserId(user.id)
      setMessages([{ role: 'walt', content: starterOpening(mode, data as Vehicle) }])
      setLoading(false)
    }
    load()
  }, [vehicleId, mode])

  const canBuild = Boolean(vehicle && mode && (selectedStarter || getLastUserMessage(messages)) && !creating)
  const projectName = useMemo(
    () => vehicle && mode ? buildProjectName(vehicle, mode, selectedStarter, messages) : '',
    [vehicle, mode, selectedStarter, messages]
  )
  const intakeSummary = useMemo(
    () => vehicle && mode ? buildIntakeSummary(vehicle, mode, selectedStarter, messages) : '',
    [vehicle, mode, selectedStarter, messages]
  )

  const selectStarter = (starter: string) => {
    if (!vehicle || !mode) return
    setSelectedStarter(starter)
    setMessages([{ role: 'walt', content: starterOpening(mode, vehicle, starter) }])
    setChatInput('')
  }

  const sendMessage = async () => {
    const text = chatInput.trim()
    if (!text || sending || !vehicle || !mode) return

    setChatInput('')
    setError('')
    setSending(true)

    const userMessage: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const context = [
        'Screen: Create Project - Walt Intake Chat',
        `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''})`,
        `Project mode: ${PROJECT_MODE_LABELS[mode]}`,
        `Plan type: ${planType}`,
        `Highlighted task: ${selectedStarter || 'none selected'}`,
        'This is pre-project intake. Walt should talk naturally, answer questions, compare options, and help the user decide what should be saved before the project is created.',
        'Do not claim the project already exists. Ask if the user is ready to build it when there is enough direction.',
      ].join('\n')

      const res = await fetch('/api/walt-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: nextMessages.map(message => ({
            role: message.role === 'walt' ? 'assistant' : 'user',
            content: message.content,
          })),
          context,
          vehicleId: vehicle.id,
          screen: 'create-project-intake',
        }),
      })

      const data = await res.json()
      const reply = data.message || 'I had trouble answering right then. Try me again.'
      setMessages(current => [...current, { role: 'walt', content: reply }])
    } catch (sendError) {
      console.error('Create project intake chat error:', sendError)
      setMessages(current => [...current, { role: 'walt', content: 'I had trouble connecting right then. Try me again in a second.' }])
    } finally {
      setSending(false)
    }
  }

  const createProject = async () => {
    if (!vehicle || !mode || !userId || !canBuild) return
    setCreating(true)
    setError('')

    const intakeAnswers = {
      source: 'walt_guided_intake_chat_v1',
      project_mode: mode,
      plan_type: planType,
      highlighted_task: selectedStarter || null,
      project_name: projectName,
      transcript: messages,
    }

    const { data, error: projectError } = await supabase
      .from('projects')
      .insert({
        vehicle_id: vehicle.id,
        user_id: userId,
        name: projectName,
        goal_type: PROJECT_MODE_LABELS[mode],
        project_mode: mode,
        plan_type: planType,
        condition: null,
        intake_summary: intakeSummary,
        intake_answers: intakeAnswers,
        budget_estimate: null,
        status: 'active',
        cover_photo_url: vehicle.cover_photo_url,
      })
      .select('id')
      .single()

    if (projectError || !data) {
      setError('Something stopped the project from being created. Try again in a minute.')
      setCreating(false)
      return
    }

    await supabase.from('notes').insert({
      project_id: data.id,
      user_id: userId,
      content: [
        'Walt-guided intake chat',
        `Mode: ${PROJECT_MODE_LABELS[mode]}`,
        selectedStarter ? `Highlighted task: ${selectedStarter}` : '',
        `Summary: ${intakeSummary}`,
      ].filter(Boolean).join('\n'),
      author: 'user',
    })

    await supabase.from('walt_messages').insert(messages.map(message => ({
      user_id: userId,
      project_id: data.id,
      vehicle_id: vehicle.id,
      role: message.role,
      content: message.content,
      screen: 'create-project-intake',
    })))

    window.location.replace(`/projects?created=${data.id}`)
  }

  if (loading) return <LoadingScreen />
  if (!vehicle || !mode) return null

  return (
    <MobileAppFrame>
      <MobileHeader backHref={`/create-project/goal?vehicle=${vehicleId}`} />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />

          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 4 }}>
              {PROJECT_MODE_LABELS[mode]}
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>
              Talk it through with Walt
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 14 }}>
              Pick a starter if it fits. Walt will use it as context, then you can ask questions before building the project.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {PROJECT_MODE_EXAMPLES[mode].map(example => {
                const isSelected = selectedStarter === example
                return (
                  <button
                    key={example}
                    onClick={() => selectStarter(example)}
                    style={{
                      border: `1.5px solid ${isSelected ? 'var(--orange)' : 'var(--border)'}`,
                      background: isSelected ? '#fff1e6' : 'white',
                      color: 'var(--dark-blue)',
                      borderRadius: 18,
                      padding: '8px 11px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-nunito)',
                      cursor: 'pointer',
                    }}
                  >
                    {example}
                  </button>
                )
              })}
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '11px 13px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <img src={WALT} alt="Walt" style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--orange)', flexShrink: 0 }} />
                <div>
                  <p style={{ color: 'var(--dark-blue)', fontSize: '0.86rem', fontWeight: 800, margin: 0 }}>Walt intake chat</p>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.72rem', margin: '2px 0 0' }}>
                    {selectedStarter ? `${selectedStarter} is highlighted` : 'No starter selected yet'}
                  </p>
                </div>
              </div>

              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 300, overflowY: 'auto' }}>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    style={{
                      alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '86%',
                      background: message.role === 'user' ? 'var(--dark-blue)' : 'var(--bg)',
                      color: message.role === 'user' ? 'white' : 'var(--dark-blue)',
                      borderRadius: message.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      padding: '9px 11px',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.content}
                  </div>
                ))}
                {sending && (
                  <div style={{ alignSelf: 'flex-start', background: 'var(--bg)', color: 'var(--secondary-text)', borderRadius: '14px 14px 14px 4px', padding: '9px 11px', fontSize: '0.82rem' }}>
                    Walt is thinking...
                  </div>
                )}
              </div>

              <div style={{ padding: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <textarea
                  value={chatInput}
                  onChange={event => setChatInput(event.target.value)}
                  placeholder="Ask Walt a question or describe what you want..."
                  rows={2}
                  style={{
                    flex: 1,
                    resize: 'none',
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 12,
                    padding: '9px 10px',
                    color: 'var(--dark-blue)',
                    fontSize: 16,
                    lineHeight: 1.35,
                    fontFamily: 'var(--font-nunito)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || sending}
                  style={{ width: 46, borderRadius: 14, border: 'none', background: chatInput.trim() && !sending ? 'var(--orange)' : '#d4e0eb', color: 'white', fontWeight: 900, cursor: chatInput.trim() && !sending ? 'pointer' : 'not-allowed' }}
                >
                  →
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fff1e6', border: '1.5px solid var(--orange)', borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
                <p style={{ color: 'var(--dark-blue)', fontSize: '0.85rem', fontWeight: 700 }}>{error}</p>
              </div>
            )}

            <button
              onClick={createProject}
              disabled={!canBuild}
              style={{
                width: '100%',
                padding: '14px',
                background: canBuild ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
                borderRadius: 25,
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: canBuild ? 'pointer' : 'not-allowed',
                boxShadow: canBuild ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
              }}
            >
              {creating ? 'Building project...' : 'Build This Project →'}
            </button>
          </div>
        </div>
      </main>
      <BottomNav active="Projects" />
    </MobileAppFrame>
  )
}

export default function CreateProjectIntakePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <IntakeContent />
    </Suspense>
  )
}
