'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMockStore } from '@/store/mockStore'
import { Home, CalendarCheck, Flame, CreditCard } from 'lucide-react'
import { isPartnerActiveToday, streakRiskStatus, today } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Daily',  icon: Home },
  { href: '/weekly-ritual', label: 'Weekly', icon: CalendarCheck },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
]

// Nav items shown to non-paired visitors (landing page)
const LANDING_NAV_ITEMS = [
  { href: '/#fitur', label: 'Fitur' },
  { href: '/pricing', label: 'Harga' },
  { href: '/privacy', label: 'Privasi' },
]

export default function Nav() {
  const pathname = usePathname()
  // Separate selectors — never return new objects (causes infinite re-render loop)
  const partnerA = useMockStore((s) => s.partnerA)
  const partnerB = useMockStore((s) => s.partnerB)
  const streak   = useMockStore((s) => s.streak)
  const moodHistory = useMockStore((s) => s.moodHistory)
  const habits = useMockStore((s) => s.habits)

  const bothJoined = partnerA.joined && partnerB.joined

  // On onboarding page — hide nav entirely
  if (pathname === '/onboarding') return null

  // On root landing page for non-paired users — show minimal landing nav
  if (!bothJoined && pathname === '/') {
    return (
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(255,251,245,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(237,213,200,0.5)',
          padding: '0.875rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🌸</span>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', fontWeight: 600, color: '#2A1810', letterSpacing: '-0.01em' }}>LifebyDesign</span>
        </Link>
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {LANDING_NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#8B6B61', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <Link href="/onboarding" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', marginLeft: '0.25rem' }}>
            Mulai Gratis
          </Link>
        </nav>
      </header>
    )
  }

  // Not paired and not on landing page — hide nav
  if (!bothJoined) return null

  const todayDate = today()
  const activeA = isPartnerActiveToday({ partner: 'A', todayDate, moodHistory, habits })
  const activeB = isPartnerActiveToday({ partner: 'B', todayDate, moodHistory, habits })
  const risk = streakRiskStatus({ todayDate, moodHistory, habits })

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

      {/* Streak + partner activity */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          {risk === 'at-risk' && (
            <span style={{ fontSize: '0.7rem', color: '#C07070', fontWeight: 700 }}>• at risk</span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.28rem 0.55rem',
            borderRadius: '999px',
            border: '1px solid rgba(123,174,127,0.28)',
            background: 'rgba(123,174,127,0.1)',
            fontSize: '0.7rem',
            color: '#3D7A43',
            fontWeight: 600,
          }}
          title="Status aktivitas hari ini"
        >
          <span>{activeA ? 'A✓' : 'A•'}</span>
          <span>{activeB ? 'B✓' : 'B•'}</span>
        </div>
      </div>
    </header>
  )
}
