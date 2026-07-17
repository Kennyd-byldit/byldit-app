'use client'

import { useEffect } from 'react'

const demoModeKey = 'byldit-demo-mode'

export default function DemoEntryPage() {
  useEffect(() => {
    window.sessionStorage.setItem(demoModeKey, 'true')
    window.localStorage.setItem(demoModeKey, 'true')
    window.location.replace('/')
  }, [])

  return (
    <main className="landingPage">
      <section style={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
        <p style={{ color: '#24507a', fontWeight: 900 }}>Opening BYLDit demo...</p>
      </section>
    </main>
  )
}
