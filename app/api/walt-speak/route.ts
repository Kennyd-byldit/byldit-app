import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const VOICE_ID = 'g3Z5pIW1TcQjt5JV10L3'
const CACHED_INTRO_KEY = 'walt-intro-v1.mp3'

export async function GET() {
  // Return cached Walt intro URL if it exists
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = supabase.storage.from('Assets').getPublicUrl(CACHED_INTRO_KEY)
  return NextResponse.json({ url: data.publicUrl })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text, cache } = body
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

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

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const audioBuffer = await res.arrayBuffer()

  // If cache=true, save to Supabase Storage and return URL
  if (cache) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.storage.from('Assets').upload(CACHED_INTRO_KEY, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })
    const { data } = supabase.storage.from('Assets').getPublicUrl(CACHED_INTRO_KEY)
    return NextResponse.json({ url: data.publicUrl })
  }

  // Otherwise stream the audio directly
  return new NextResponse(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
