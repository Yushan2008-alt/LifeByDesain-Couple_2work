'use client'

import Link from 'next/link'
import { useMockStore } from '@/store/mockStore'
import { useRouter } from 'next/navigation'
import { RotateCcw, Crown } from 'lucide-react'

export default function Footer() {
  const reset      = useMockStore((s) => s.reset)
  const isPremium  = useMockStore((s) => s.isPremium)
  const setPremium = useMockStore((s) => s.setPremium)
  const partnerA   = useMockStore((s) => s.partnerA)
  const partnerB   = useMockStore((s) => s.partnerB)
  const router     = useRouter()

  const bothJoined = partnerA.joined && partnerB.joined

  function handleReset() {
    if (confirm('Reset semua dummy data? Proses ini akan mengembalikan app ke state awal untuk testing ulang.')) {
      reset()
      router.push('/onboarding')
    }
  }

  // ── App pages (paired): tampilkan strip dev-tool di atas bottom nav ────────
  if (bothJoined) {
    return (
      <div
        style={{
          // sits just above the fixed bottom nav
          position: 'fixed',
          bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,251,245,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(237,213,200,0.6)',
          borderRadius: '2rem',
          padding: '0.4rem 0.875rem',
          boxShadow: '0 4px 16px rgba(200,130,100,0.12)',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#C4A090', fontSize: '0.65rem', fontWeight: 600 }}>DEV</span>
        <button
          onClick={() => setPremium(!isPremium)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: isPremium ? 'rgba(184,149,106,0.15)' : 'rgba(237,213,200,0.5)',
            color: isPremium ? '#B8956A' : '#8B6B61',
            border: 'none', borderRadius: '1rem',
            padding: '0.3rem 0.75rem', minHeight: 32,
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Crown size={11} />
          {isPremium ? 'Premium ✓' : 'Free'}
        </button>
        <button
          onClick={handleReset}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: 'rgba(237,213,200,0.4)',
            color: '#8B6B61',
            border: 'none', borderRadius: '1rem',
            padding: '0.3rem 0.75rem', minHeight: 32,
            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>
    )
  }

  // ── Public pages (landing, pricing, privacy): full footer ────────────────
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(237,213,200,0.5)',
        background: 'rgba(255,251,245,0.8)',
        backdropFilter: 'blur(12px)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>🌸</span>
          <span style={{ fontSize: '0.8rem', color: '#8B6B61', fontFamily: 'var(--font-dm-sans)', fontWeight: 600 }}>
            LifebyDesign Couple
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.875rem', paddingLeft: '0.125rem' }}>
          <Link href="/pricing"  style={{ fontSize: '0.75rem', color: '#C4A090', textDecoration: 'none' }}>Harga</Link>
          <Link href="/privacy"  style={{ fontSize: '0.75rem', color: '#C4A090', textDecoration: 'none' }}>Privasi</Link>
          <Link href="/onboarding" style={{ fontSize: '0.75rem', color: '#C4A090', textDecoration: 'none' }}>Mulai</Link>
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#C4A090' }}>© 2026 LifebyDesign Couple</p>
    </footer>
  )
}
