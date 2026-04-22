'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
// Strip markdown formatting from Walt's responses
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold**
    .replace(/\*([^*]+)\*/g, '$1')       // *italic*
    .replace(/`([^`]+)`/g, '$1')         // `code`
    .replace(/#{1,6}\s/g, '')            // # headers
    .replace(/>\s/g, '')                 // > blockquotes
    .replace(/---/g, '')                 // horizontal rules
    .trim()
}

const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

type Message = { role: 'user' | 'walt'; content: string }

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
  const userIdRef = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const mutedRef = useRef(false)
  // Keep mutedRef in sync with muted state
  useEffect(() => { mutedRef.current = muted }, [muted])

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
    userIdRef.current = user.id

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
      const opening = { role: 'walt' as const, content: openingLine }
      setMessages([opening])
      saveMessage(opening, user.id)
      if (!mutedRef.current) speakText(openingLine)
    }
  }

  const saveMessage = async (msg: Message, userId?: string) => {
    let uid = userId || userIdRef.current
    if (!uid) {
      // Fetch fresh if ref is empty
      const { data: { user } } = await supabase.auth.getUser()
      uid = user?.id || null
      if (uid) userIdRef.current = uid
    }
    if (!uid) { console.error('No user ID for saveMessage'); return }
    const { error } = await supabase.from('walt_messages').insert({
      user_id: uid,
      role: msg.role,
      content: msg.content,
      vehicle_id: vehicleId || null,
      screen,
    })
    if (error) console.error('Save message error:', JSON.stringify(error))
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
      // Stop any currently playing audio first
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { URL.revokeObjectURL(url); }
      audio.onerror = (e) => console.error('Audio error:', e)
      audio.play().catch(e => console.error('Play error:', e))
    } catch (e) {
      console.error('TTS error:', e)
    }
  }

  // Pre-authorize audio on first user interaction with the panel
  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
  }

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: messageText }
    const newMessages: Message[] = [...messages, userMsg]
    setMessages(newMessages)
    saveMessage(userMsg)
    setLoading(true)

    try {
      // Send last 10 messages for context efficiency
      // Map 'walt' role to 'assistant' for Claude API
      const recentMessages = newMessages.slice(-10).map(m => ({
        role: m.role === 'walt' ? 'assistant' : m.role,
        content: m.content,
      }))
      const res = await fetch('/api/walt-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentMessages, context }),
      })
      const data = await res.json()
      const rawReply = data.message || "Having trouble connecting right now. Try again."
      const reply = stripMarkdown(rawReply)
      const assistantMsg: Message = { role: 'walt', content: reply }
      setMessages(prev => [...prev, assistantMsg])
      saveMessage(assistantMsg)
      if (!mutedRef.current) speakText(reply)
    } catch (e) {
      console.error('sendMessage error:', e)
      const errMsg: Message = { role: 'walt', content: "Having trouble connecting right now. Try again in a sec." }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    initAudio()
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported. Try Chrome or Safari on iPhone.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    setListening(true)

    let baseText = ''
    // Capture whatever is already in the input before we start
    setInput(prev => { baseText = prev ? prev + ' ' : ''; return prev })

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      if (final) baseText += final
      // Show live combined text
      setInput(baseText + interim)
    }
    recognition.onerror = (e: any) => {
      console.error('Speech error:', e.error)
      setListening(false)
    }
    recognition.onend = () => {
      setListening(false)
    }
    recognition.start()
  }

  const stopListening = () => {
    try { recognitionRef.current?.stop() } catch (e) {}
    recognitionRef.current = null
    setListening(false)
    // Don't send — user reviews and taps Send manually
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
              {msg.role === 'walt' && (
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
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={listening ? 'Hold mic and speak... release when done' : 'Type here, or hold 🎤 to speak'}
            rows={1}
            style={{
              flex: 1, padding: '10px 16px', background: listening ? '#eaf4fb' : 'var(--bg)',
              border: `1.5px solid ${listening ? '#4da8da' : 'var(--border)'}`,
              borderRadius: 16, fontSize: 16, resize: 'none' as const,
              fontFamily: 'var(--font-nunito)', outline: 'none', color: 'var(--dark-blue)',
              maxHeight: 100, overflowY: 'auto' as const, lineHeight: '1.4',
            }}
          />
          {/* Mic button — hold to talk */}
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onMouseLeave={stopListening}
            onTouchStart={(e) => { e.preventDefault(); startListening() }}
            onTouchEnd={(e) => { e.preventDefault(); stopListening() }}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0, cursor: 'pointer',
              background: listening ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              fontSize: '1.1rem',
              boxShadow: listening ? '0 0 0 6px rgba(232,117,10,0.25)' : 'none',
              WebkitUserSelect: 'none' as const,
              userSelect: 'none' as const,
              touchAction: 'none',
              WebkitTouchCallout: 'none' as any,
            }}>
            🎤
          </button>
          {/* Send button */}
          <button onClick={() => { initAudio(); sendMessage() }} disabled={!input.trim() || loading}
            style={{
              height: 40, borderRadius: 20, border: 'none', flexShrink: 0, padding: '0 14px',
              background: input.trim() && !loading ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: '0.8rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-nunito)',
            }}>
            Send
          </button>
        </div>
      </div>
    </>
  )
}
