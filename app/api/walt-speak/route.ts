import { NextRequest, NextResponse } from 'next/server'

const VOICE_ID = 'g3Z5pIW1TcQjt5JV10L3'
const CACHED_INTRO_KEY = 'walt-intro-v1.mp3'

export async function GET() {
  // Return cached Walt intro URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/Assets/${CACHED_INTRO_KEY}`
  return NextResponse.json({ url: publicUrl })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text, cache } = body
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  // If cache=true, generate and save to Supabase
  if (cache) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.75, similarity_boost: 0.80, style: 0.15, use_speaker_boost: true, speed: 0.88 },
      }),
    })
    if (!res.ok) return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
    const audioBuffer = await res.arrayBuffer()

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.storage.from('Assets').upload(CACHED_INTRO_KEY, audioBuffer, {
      contentType: 'audio/mpeg', upsert: true,
    })
    const { data } = supabase.storage.from('Assets').getPublicUrl(CACHED_INTRO_KEY)
    return NextResponse.json({ url: data.publicUrl })
  }

  // Streaming TTS — returns audio as a stream so playback starts immediately
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.75, similarity_boost: 0.80, style: 0.15, use_speaker_boost: true, speed: 0.88 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  // Stream the response directly to the client
  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
