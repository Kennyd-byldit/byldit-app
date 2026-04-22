'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

type Message = { role: 'user' | 'assistant'; content: string }

interface WaltPanelProps {
  open: boolean
  onClose: () => void
  context: string
  openingLine?: string
  vehicleId?: string
  screen?: string
}

export default function WaltPanel({
  open,
  onClose,
  context,
  openingLine = 'Talk to me.',
  vehicleId,
  screen = 'garage',
}: WaltPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  // Load conversation history on first open
  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true)
      loadHistory()
    }
  }, [open])

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('walt_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('screen', screen)
      .order('created_at', { ascending: true })
      .limit(20)

    if (data && data.length > 0) {
      setMessages(data as Message[])
    } else {
      // First time — show opening line
      const opening = { role: 'assistant' as const, content: openingLine }
      setMessages([opening])
      saveMessage(opening, user.id)
      if (!muted) speakText(openingLine)
    }
  }

  const saveMessage = async (msg: Message, userId?: string) => {
    let uid = userId
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser()
      uid = user?.id
    }
    if (!uid) return
    await supabase.from('walt_messages').insert({
      user_id: uid,
      role: msg.role,
      content: msg.content,
      vehicle_id: vehicleId || null,
      screen,
    })
  }

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakText = async (text: string) => {
    try {
      const res = await fetch('/api/walt-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play().catch(() => {})
      audio.onended = () => URL.revokeObjectURL(url)
    } catch (e) {
      console.error('TTS error:', e)
    }
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: messageText }
    const newMessages: Message[] = [...messages, userMsg]
    setMessages(newMessages)
    saveMessage(userMsg)
    setLoading(true)

    try {
      // Send last 10 messages for context efficiency
      const recentMessages = newMessages.slice(-10)
      const res = await fetch('/api/walt-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentMessages, context }),
      })
      const data = await res.json()
      const reply = data.message || "Having trouble connecting right now. Try again."
      const assistantMsg: Message = { role: 'assistant', content: reply }
      setMessages(prev => [...prev, assistantMsg])
      saveMessage(assistantMsg)
      if (!muted) speakText(reply)
    } catch (e) {
      const errMsg: Message = { role: 'assistant', content: "Having trouble connecting right now. Try again in a sec." }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported on this browser. Try Chrome or Safari.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    setListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setListening(false)
      sendMessage(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        height: '75%', background: 'white', borderRadius: '20px 20px 0 0',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
        fontFamily: 'var(--font-nunito)',
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d4e0eb', cursor: 'pointer' }} onClick={onClose} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
            <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark-blue)', margin: 0 }}>Walt</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', margin: 0 }}>Your crew chief</p>
          </div>
          <button onClick={() => setMuted(m => !m)}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px', color: muted ? '#d4e0eb' : 'var(--orange)' }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: '4px', color: 'var(--secondary-text)', lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
                  <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{
                maxWidth: '72%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? '#24507a' : '#4da8da',
                color: 'white', fontSize: '0.9rem', lineHeight: 1.5,
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
                <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ background: '#4da8da', borderRadius: '18px 18px 18px 4px', padding: '10px 16px' }}>
                <span style={{ color: 'white', fontSize: '1.2rem', letterSpacing: 3 }}>···</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: '10px 12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={listening ? 'Listening...' : 'Talk to Walt...'}
            style={{
              flex: 1, padding: '10px 16px', background: listening ? '#eaf4fb' : 'var(--bg)',
              border: `1.5px solid ${listening ? '#4da8da' : 'var(--border)'}`,
              borderRadius: 25, fontSize: 16,
              fontFamily: 'var(--font-nunito)', outline: 'none', color: 'var(--dark-blue)'
            }}
          />
          {/* Mic button — active */}
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0, cursor: 'pointer',
              background: listening ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              fontSize: '1rem',
              boxShadow: listening ? '0 0 0 4px rgba(232,117,10,0.3)' : 'none',
            }}>
            🎤
          </button>
          {/* Send button */}
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: input.trim() && !loading ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
            }}>
            ↑
          </button>
        </div>
      </div>
    </>
  )
}
