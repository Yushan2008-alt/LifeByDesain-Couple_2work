'use client'

import Link from 'next/link'
import { useMockStore } from '@/store/mockStore'
import { useRouter } from 'next/navigation'
import { RotateCcw, Crown } from 'lucide-react'

export default function Footer() {
  const reset      = useMockStore((s) => s.reset)
  const isPremium  = useMockStore((s) => s.isPremium)
  const setPremium = useMockStore((s) => s.setPremium)
  const router     = useRouter()

  function handleReset() {
    if (confirm('Reset semua dummy data? Proses ini akan mengembalikan app ke state awal untuk testing ulang.')) {
      reset()
      router.push('/onboarding')
    }
  }

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
          <Link href="/pricing" style={{ fontSize: '0.75rem', color: '#C4A090', textDecoration: 'none', fontFamily: 'var(--font-dm-sans)' }}>Harga</Link>
          <Link href="/privacy" style={{ fontSize: '0.75rem', color: '#C4A090', textDecoration: 'none', fontFamily: 'var(--font-dm-sans)' }}>Privasi</Link>
          <Link href="/recap" style={{ fontSize: '0.75rem', color: '#C4A090', textDecoration: 'none', fontFamily: 'var(--font-dm-sans)' }}>Recap</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Premium demo toggle */}
        <button
          onClick={() => setPremium(!isPremium)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: isPremium ? 'rgba(184,149,106,0.12)' : 'rgba(237,213,200,0.4)',
            color: isPremium ? '#B8956A' : '#8B6B61',
            border: isPremium ? '1px solid rgba(184,149,106,0.4)' : '1px solid rgba(237,213,200,0.8)',
            borderRadius: '0.625rem',
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          <Crown size={12} />
          {isPremium ? 'Nonaktifkan Premium' : 'Demo Premium'}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'rgba(237,213,200,0.4)',
            color: '#8B6B61',
            border: '1px solid rgba(237,213,200,0.8)',
            borderRadius: '0.625rem',
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-dm-sans)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(232,132,106,0.12)'
            e.currentTarget.style.color = '#E8846A'
            e.currentTarget.style.borderColor = 'rgba(232,132,106,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(237,213,200,0.4)'
            e.currentTarget.style.color = '#8B6B61'
            e.currentTarget.style.borderColor = 'rgba(237,213,200,0.8)'
          }}
        >
          <RotateCcw size={13} />
          Reset Data
        </button>
      </div>
    </footer>
  )
}
