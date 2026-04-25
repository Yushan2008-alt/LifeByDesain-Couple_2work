'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMockStore } from '@/store/mockStore'
import { Home, CalendarCheck, Flame, BarChart2, Target, Clock } from 'lucide-react'
import { isPartnerActiveToday, streakRiskStatus, today } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Daily',    icon: Home },
  { href: '/weekly-ritual', label: 'Weekly',   icon: CalendarCheck },
  { href: '/goals',         label: 'Goals',    icon: Target },
  { href: '/recap',         label: 'Recap',    icon: BarChart2 },
  { href: '/timeline',      label: 'Timeline', icon: Clock },
]

// Nav items shown to non-paired visitors (landing page)
const LANDING_NAV_ITEMS = [
  { href: '/#fitur', label: 'Fitur' },
  { href: '/pricing', label: 'Harga' },
  { href: '/privacy', label: 'Privasi' },
]

export default function Nav() {
  const pathname = usePathname()

  const partnerA         = useMockStore((s) => s.partnerA)
  const partnerB         = useMockStore((s) => s.partnerB)
  const streak           = useMockStore((s) => s.streak)
  const moodHistory      = useMockStore((s) => s.moodHistory)
  const habits           = useMockStore((s) => s.habits)
  const activePartner    = useMockStore((s) => s.activePartner)
  const setActivePartner = useMockStore((s) => s.setActivePartner)

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
          padding: '0 1.25rem',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🌸</span>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', fontWeight: 600, color: '#2A1810', letterSpacing: '-0.01em' }}>LifebyDesign</span>
        </Link>
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {LANDING_NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ padding: '0.625rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#8B6B61', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem', marginLeft: '0.25rem', minHeight: 44 }}
          >
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

  const nameA = partnerA.name || 'Partner A'
  const nameB = partnerB.name || 'Partner B'
  const activeName = activePartner === 'A' ? nameA : nameB

  return (
    <>
      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,251,245,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(237,213,200,0.5)',
          padding: '0 1rem',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.125rem' }}>🌸</span>
          <span
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              fontWeight: 600,
              color: '#2A1810',
              letterSpacing: '-0.01em',
            }}
          >
            LifebyDesign
          </span>
        </div>

        {/* Switch Partner pill — center */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(237,213,200,0.35)',
            border: '1px solid rgba(237,213,200,0.7)',
            borderRadius: '999px',
            padding: '0.2rem',
            gap: '0.125rem',
          }}
          title="Switch Partner — simulasi dua arah"
        >
          {(['A', 'B'] as const).map((p) => {
            const name    = p === 'A' ? nameA : nameB
            const initial = name.charAt(0).toUpperCase()
            const isActive = activePartner === p

            return (
              <button
                key={p}
                onClick={() => setActivePartner(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.75rem',
                  minHeight: 36,
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.75rem, 2vw, 0.8125rem)',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'linear-gradient(135deg,#E8846A,#D4756A)' : 'transparent',
                  color: isActive ? '#fff' : '#8B6B61',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    background: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(139,107,97,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </span>
                <span style={{ maxWidth: '5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Streak badge + activity */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          {/* Activity dots */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(123,174,127,0.28)',
              background: 'rgba(123,174,127,0.08)',
              fontSize: '0.7rem',
              color: '#3D7A43',
              fontWeight: 600,
            }}
            title="Status aktivitas hari ini"
          >
            <span title={nameA}>{activeA ? 'A✓' : 'A·'}</span>
            <span style={{ color: 'rgba(123,174,127,0.4)' }}>|</span>
            <span title={nameB}>{activeB ? 'B✓' : 'B·'}</span>
          </div>

          {/* Streak */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'linear-gradient(135deg,#FFF5EE,#FFE8D6)',
              border: '1px solid rgba(232,132,106,0.2)',
              borderRadius: '2rem',
              padding: '0.3rem 0.75rem',
            }}
          >
            <Flame size={13} color={risk === 'buffer' ? '#C07070' : '#E8846A'} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: risk === 'buffer' ? '#C07070' : '#E8846A' }}>{streak}</span>
            {(risk === 'at-risk' || risk === 'buffer') && (
              <span
                style={{ fontSize: '0.65rem', color: '#C07070', fontWeight: 700 }}
                title={risk === 'buffer' ? 'Buffer habis — streak akan reset besok!' : 'Salah satu belum aktif hari ini'}
              >
                {risk === 'buffer' ? '💔' : '!'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── BOTTOM NAV BAR ─────────────────────────────────────────────── */}
      <nav className="app-bottom-nav" role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`app-bottom-nav-item${active ? ' active' : ''}`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                color={active ? '#E8846A' : '#C4A090'}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
