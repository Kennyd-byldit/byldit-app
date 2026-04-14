'use client'
import { useEffect, useState } from 'react'
const WALT_AVATAR = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'
const WALT_VOICE_ID = 'Zz0vK5YhSHXzKc3Oy7KJ'

const WALT_INTRO = "Hey. Name's Walt. I'm your build partner — think of me as the crew chief who actually answers the phone. Full restorations, quick mods, or just trying to figure out what broke... I'm your guy. Here's the deal — I'm always at the bottom of every screen. That little face down there? That's me. Tap it anytime — day or night. I don't sleep. Now let's get your garage set up. I've got questions."

const capabilities = [
  'Plan your build',
  'Find parts',
  'Track budget',
  'Answer questions',
  'Flag problems',
  'Anything else',
]

export default function MeetWaltPage() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    window.history.replaceState(null, "", window.location.href)
  }, [])

  const playWalt = async () => {
    // If loading, ignore tap
    if (loading) return

    // If playing, stop
    if (playing && audio) {
      audio.pause()
      audio.currentTime = 0
      setPlaying(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/walt-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: WALT_INTRO }),
      })
      if (!res.ok) throw new Error('TTS failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = new Audio(url)
      setAudio(a)
      setLoading(false)
      setPlaying(true)
      a.play()
      a.onended = () => { setPlaying(false); URL.revokeObjectURL(url) }
    } catch (e) {
      console.error(e)
      setLoading(false)
      setPlaying(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:10 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* App Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>

          {/* Meet Walt heading */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-blue)', lineHeight: 1 }}>Meet Walt</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--orange)', marginTop: 2 }}>Your Crew Chief</p>
          </div>

          {/* Walt avatar card — tap to hear */}
          <style>{`
            @keyframes pulse-ring {
              0% { transform: scale(1); opacity: 0.6; }
              100% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>
          <div onClick={playWalt} style={{ background: 'var(--dark-blue)', borderRadius: 16, padding: '18px 16px', textAlign: 'center', marginBottom: 14, boxShadow: '0 4px 16px rgba(36,80,122,0.2)', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 12px', overflow: 'visible' }}>
              {loading && <>
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 88, height: 88, marginTop: -44, marginLeft: -44, borderRadius: '50%', border: '2px solid #f4a543', animation: 'pulse-ring 1.4s ease-out infinite', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 88, height: 88, marginTop: -44, marginLeft: -44, borderRadius: '50%', border: '2px solid #f4a543', animation: 'pulse-ring 1.4s ease-out 0.45s infinite', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 88, height: 88, marginTop: -44, marginLeft: -44, borderRadius: '50%', border: '2px solid #f4a543', animation: 'pulse-ring 1.4s ease-out 0.9s infinite', pointerEvents: 'none' }} />
              </>}
              <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${loading ? '#f4a543' : playing ? '#4da8da' : 'var(--orange)'}`, boxShadow: loading ? '0 4px 15px rgba(244,165,67,0.5)' : playing ? '0 4px 15px rgba(77,168,218,0.5)' : '0 4px 15px rgba(232,117,10,0.3)', transition: 'all 0.3s' }}>
                <img src={WALT_AVATAR} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700, marginBottom: 3 }}>
              {loading ? '⏳ Loading...' : playing ? '▐▐  Tap to stop' : '▶  Tap to hear from Walt'}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--light-blue)', fontWeight: 300 }}>
              {loading ? 'Give him a second...' : playing ? 'Walt is speaking...' : '30 seconds — he\'ll tell you who he is'}
            </p>
          </div>

          {/* What I do */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-blue)', marginBottom: 8, textAlign: 'center' }}>What I do:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {capabilities.map((cap) => (
                <div key={cap} style={{ background: 'white', borderRadius: 20, padding: '6px 8px', fontSize: '0.7rem', color: 'var(--dark-blue)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  {cap}
                </div>
              ))}
            </div>
          </div>

          {/* Where to find Walt */}
          <div style={{ background: 'white', border: '2px solid var(--orange)', borderRadius: 14, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(232,117,10,0.1)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
              <img src={WALT_AVATAR} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: 'var(--dark-blue)', lineHeight: 1.5 }}>
              Once you&apos;re in, I&apos;m always at the bottom of every screen. Tap my face — I&apos;m listening.
            </p>
          </div>

          {/* CTA */}
          <button style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }} onClick={() => { window.location.href = '/build-profile' }}>
            Let&apos;s go →
          </button>

        </div>
      </main>

    </div>
  )
}
