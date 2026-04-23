'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMockStore } from '@/store/mockStore'
import { Home, CalendarCheck, Flame, BarChart2, Crown } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Daily',   icon: Home },
  { href: '/weekly-ritual', label: 'Weekly',  icon: CalendarCheck },
  { href: '/recap',         label: 'Recap',   icon: BarChart2 },
]

export default function Nav() {
  const pathname = usePathname()
  // Separate selectors — never return new objects (causes infinite re-render loop)
  const partnerA  = useMockStore((s) => s.partnerA)
  const partnerB  = useMockStore((s) => s.partnerB)
  const streak    = useMockStore((s) => s.streak)
  const isPremium = useMockStore((s) => s.isPremium)

  const bothJoined = partnerA.joined && partnerB.joined
  if (!bothJoined || pathname === '/onboarding') return null

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,251,245,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(237,213,200,0.5)',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>🌸</span>
        <span
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#2A1810',
            letterSpacing: '-0.01em',
          }}
        >
          LifebyDesign
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                color: active ? '#E8846A' : '#8B6B61',
                background: active ? 'rgba(232,132,106,0.10)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right side pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Premium badge */}
        {isPremium && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'linear-gradient(135deg,#FFF5E8,#FFE5C0)',
              border: '1px solid rgba(184,149,106,0.35)',
              borderRadius: '2rem',
              padding: '0.3125rem 0.75rem',
            }}
          >
            <Crown size={12} color="#B8956A" fill="#B8956A" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B8956A' }}>Premium</span>
          </div>
        )}

        {/* Streak pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'linear-gradient(135deg,#FFF5EE,#FFE8D6)',
            border: '1px solid rgba(232,132,106,0.2)',
            borderRadius: '2rem',
            padding: '0.375rem 0.875rem',
          }}
        >
          <Flame size={13} color="#E8846A" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#E8846A' }}>{streak}</span>
          <span style={{ fontSize: '0.75rem', color: '#C4A090', fontWeight: 400 }}>days</span>
        </div>
      </div>
    </header>
  )
}
