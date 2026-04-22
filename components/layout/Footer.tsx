'use client'

import { useMockStore } from '@/store/mockStore'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'

export default function Footer() {
  const reset  = useMockStore((s) => s.reset)
  const router = useRouter()

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem' }}>🌸</span>
        <span style={{ fontSize: '0.8rem', color: '#C4A090', fontFamily: 'var(--font-dm-sans)' }}>
          LifebyDesign Couple — MVP Demo
        </span>
      </div>

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
        Reset Dummy Data
      </button>
    </footer>
  )
}
