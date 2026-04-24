'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMockStore } from '@/store/mockStore'
import {
  Heart, Shield, Sparkles, BarChart2, BookOpen, Calendar,
  ArrowRight, Check, Flame, Star, Lock,
} from 'lucide-react'

// ── Animation helpers ─────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

// ── Floating petals (decorative) ─────────────────────────────────────────────
const PETALS = ['🌸', '💛', '🌿', '✨', '🌷', '🍀']
function PetalBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${8 + i * 16}%`,
            top: `${10 + ((i * 29) % 75)}%`,
            animationDelay: `${i * 1.1}s`,
            fontSize: `${0.9 + (i % 3) * 0.35}rem`,
            opacity: 0.4,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  )
}

// ── Philosophy cards ──────────────────────────────────────────────────────────
const PHILOSOPHY = [
  {
    icon: Lock,
    emoji: '🔒',
    title: 'Privat Sepenuhnya',
    desc: 'Raw emotions kamu hanya milikmu. AI menyaringnya menjadi bahasa yang konstruktif sebelum (jika) kamu memilih berbagi.',
    color: '#6B9FD4',
    bg: '#EBF4FF',
  },
  {
    icon: Sparkles,
    emoji: '🤖',
    title: 'AI Cooling Off',
    desc: 'Bukan chatbot — AI kami mengubah frustrasi menjadi empati. Dari "kamu selalu…" menjadi "aku merasa…".',
    color: '#E8846A',
    bg: '#FFF5EE',
  },
  {
    icon: Heart,
    emoji: '🏆',
    title: 'Rayakan, Bukan Perbaiki',
    desc: 'Focus pada wins kecil tiap minggu. Hubungan sehat tumbuh dari apresiasi, bukan daftar masalah.',
    color: '#7BAE7F',
    bg: '#F0F7F0',
  },
]

// ── Feature layers ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    layer: 'Daily',
    icon: '☀️',
    color: '#E8846A',
    items: ['Check-in mood dengan emoji & intensitas', 'Habit tracker personal per pasangan', 'Shared to-do list dengan kategori', 'Private journal — hanya milikmu'],
  },
  {
    layer: 'Weekly',
    icon: '🌙',
    color: '#6B9FD4',
    items: ['Review komitmen minggu lalu', 'AI Cooling Off untuk emotion dump', '360° score — self vs perceived partner', 'Wins celebration & new commitments'],
  },
  {
    layer: 'Monthly',
    icon: '📊',
    color: '#7BAE7F',
    items: ['Mood trend 4 minggu', 'Evolusi 360° radar chart', 'Milestone badges yang diraih', 'AI narrative ringkasan bulan ini'],
  },
]

// ── Pricing ───────────────────────────────────────────────────────────────────
const FREE_FEATURES = [
  'Daily mood check-in',
  'Habit tracker (5 habits)',
  'Shared to-do list',
  'Private journal',
]

const PREMIUM_FEATURES = [
  'Semua fitur Free',
  'Weekly Ritual lengkap',
  'AI Cooling Off — emotion translator',
  '360° relationship scoring',
  'Monthly Recap + AI narrative',
  'Milestone badges & analytics',
  'Unlimited habits & journals',
]

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const partnerA   = useMockStore((s) => s.partnerA)
  const partnerB   = useMockStore((s) => s.partnerB)
  const streak     = useMockStore((s) => s.streak)
  const bothJoined = partnerA.joined && partnerB.joined

  return (
    <div
      className="bg-spring"
      style={{ minHeight: '100dvh', position: 'relative', overflowX: 'hidden' }}
    >
      <PetalBg />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(4rem, 10vw, 7rem) 1.5rem 5rem',
          gap: '2rem',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(232,132,106,0.10)',
            border: '1px solid rgba(232,132,106,0.25)',
            borderRadius: '2rem',
            padding: '0.375rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#E8846A',
          }}
        >
          <Sparkles size={13} />
          Didesain untuk pasangan yang intentional
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.18 }}
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.25rem, 7vw, 4rem)',
            fontWeight: 700,
            color: '#2A1810',
            lineHeight: 1.2,
            maxWidth: 700,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35em',
            justifyContent: 'center',
            alignItems: 'baseline',
          }}
        >
          <span>Investasi intentional</span>
          <span style={{ color: '#E8846A' }}>untuk hubunganmu</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.26 }}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.1875rem)',
            color: '#8B6B61',
            lineHeight: 1.7,
            maxWidth: 520,
          }}
        >
          Daily journaling, weekly ritual, dan AI-powered communication
          untuk pasangan yang ingin tumbuh bersama — bukan sekadar bertahan.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.34 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {bothJoined ? (
            <>
              <Link
                href="/dashboard"
                className="btn-primary"
                style={{ textDecoration: 'none', padding: '0.875rem 1.75rem', fontSize: '1rem' }}
              >
                <Flame size={18} />
                Lanjutkan ({streak} day streak 🔥)
              </Link>
              <Link
                href="/onboarding"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '1rem',
                  border: '1.5px solid rgba(232,132,106,0.35)',
                  color: '#E8846A',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  background: 'white',
                  transition: 'all 0.2s ease',
                }}
              >
                Reset & Mulai Ulang
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/onboarding"
                className="btn-primary"
                style={{ textDecoration: 'none', padding: '0.875rem 1.75rem', fontSize: '1rem' }}
              >
                Mulai Gratis Sekarang
                <ArrowRight size={18} />
              </Link>
              <a
                href="#fitur"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '1rem',
                  border: '1.5px solid rgba(139,107,97,0.25)',
                  color: '#8B6B61',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  background: 'white',
                }}
              >
                Lihat Fitur
              </a>
            </>
          )}
        </motion.div>

        {/* Social proof mini */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Privat & aman', 'Tanpa iklan', 'Dibuat dengan ❤️'].map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8125rem',
                color: '#C4A090',
                fontWeight: 500,
              }}
            >
              <Check size={12} color="#7BAE7F" strokeWidth={3} />
              {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── PHILOSOPHY ───────────────────────────────────────────────────── */}
      <section
        id="filosofi"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '4rem 1.5rem',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#E8846A',
                  marginBottom: '0.75rem',
                }}
              >
                Filosofi Kami
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#2A1810',
                  lineHeight: 1.25,
                }}
              >
                Bukan aplikasi chatting.
                <br />
                <span style={{ color: '#E8846A' }}>Ruang refleksi bersama.</span>
              </h2>
            </div>
          </FadeUp>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {PHILOSOPHY.map(({ emoji, title, desc, color, bg }, i) => (
              <FadeUp key={title} delay={i * 0.1}>
                <div
                  style={{
                    background: 'white',
                    border: `1px solid ${color}22`,
                    borderRadius: '1.5rem',
                    padding: '1.75rem',
                    boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '1rem',
                      background: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {emoji}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: '#2A1810',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#8B6B61', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (3 layers) ───────────────────────────────────────────── */}
      <section
        id="fitur"
        style={{ position: 'relative', zIndex: 1, padding: '5rem 1.5rem' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#E8846A',
                  marginBottom: '0.75rem',
                }}
              >
                Tiga Layer Ritual
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#2A1810',
                  lineHeight: 1.25,
                }}
              >
                Satu menit sehari.
                <br />
                <span style={{ color: '#E8846A' }}>Setengah jam seminggu.</span>
              </h2>
              <p style={{ color: '#8B6B61', fontSize: '1rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                Habit kecil yang konsisten mengalahkan grand gesture yang sporadis.
              </p>
            </div>
          </FadeUp>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {FEATURES.map(({ layer, icon, color, items }, i) => (
              <FadeUp key={layer} delay={i * 0.12}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    padding: '1.75rem',
                    border: '1px solid rgba(237,213,200,0.6)',
                    boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
                    height: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1.625rem' }}>{icon}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {layer}
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {items.map((item) => (
                      <li
                        key={item}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#5A3E38', lineHeight: 1.5 }}
                      >
                        <Check size={14} color={color} strokeWidth={2.5} style={{ marginTop: 3, flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '4rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(255,245,238,0.7), rgba(240,247,240,0.7))',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <FadeUp>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💞</div>
            <blockquote
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
                fontWeight: 600,
                color: '#2A1810',
                lineHeight: 1.5,
                margin: '0 0 1rem',
                fontStyle: 'italic',
              }}
            >
              &ldquo;Kami tidak lagi membahas masalah saat emosi tinggi.
              Weekly ritual jadi momen aman untuk jujur tanpa defensive.&rdquo;
            </blockquote>
            <p style={{ fontSize: '0.875rem', color: '#C4A090', fontWeight: 500 }}>
              — Rizky & Nadia, 2 tahun bersama
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section
        id="harga"
        style={{ position: 'relative', zIndex: 1, padding: '5rem 1.5rem' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#E8846A',
                  marginBottom: '0.75rem',
                }}
              >
                Harga
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#2A1810',
                }}
              >
                Mulai gratis. Upgrade saat siap.
              </h2>
              <p style={{ color: '#8B6B61', marginTop: '0.5rem', lineHeight: 1.6 }}>
                Tidak ada trial batas waktu. Fitur gratis selalu gratis.
              </p>
            </div>
          </FadeUp>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Free tier */}
            <FadeUp delay={0.05}>
              <div
                style={{
                  background: 'white',
                  borderRadius: '1.75rem',
                  padding: '2rem',
                  border: '1.5px solid rgba(237,213,200,0.7)',
                  boxShadow: '0 4px 20px rgba(200,130,100,0.07)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B6B61', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gratis</span>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: 'clamp(1.875rem,5.5vw,2.5rem)', fontWeight: 800, color: '#2A1810' }}>Rp 0</span>
                    <span style={{ color: '#C4A090', fontSize: '0.9rem' }}> / selamanya</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {FREE_FEATURES.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#5A3E38' }}>
                      <Check size={15} color="#7BAE7F" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    borderRadius: '0.875rem',
                    border: '1.5px solid rgba(232,132,106,0.35)',
                    color: '#E8846A',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    background: 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Mulai Gratis
                  <ArrowRight size={16} />
                </Link>
              </div>
            </FadeUp>

            {/* Premium tier */}
            <FadeUp delay={0.12}>
              <div
                style={{
                  background: 'linear-gradient(145deg, #FFF5EE, #FFF0F8)',
                  borderRadius: '1.75rem',
                  padding: '2rem',
                  border: '2px solid rgba(232,132,106,0.35)',
                  boxShadow: '0 12px 40px rgba(232,132,106,0.18)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Popular badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.625rem',
                    borderRadius: '2rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  ✨ Recommended
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E8846A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Premium</span>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: 'clamp(1.875rem,5.5vw,2.5rem)', fontWeight: 800, color: '#2A1810' }}>Rp 49k</span>
                    <span style={{ color: '#C4A090', fontSize: '0.9rem' }}> / bulan</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#C4A090', marginTop: '0.25rem' }}>≈ Rp 1.600/hari — lebih murah dari secangkir kopi</p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#5A3E38' }}>
                      <Star size={14} color="#E8846A" fill="#E8846A" style={{ marginTop: 2, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/onboarding"
                  className="btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'center', padding: '0.875rem', fontSize: '0.9375rem' }}
                >
                  Coba Premium Gratis 7 Hari
                  <ArrowRight size={16} />
                </Link>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#C4A090', marginTop: '0.75rem' }}>
                  Tidak perlu kartu kredit untuk trial
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '5rem 1.5rem 6rem',
          textAlign: 'center',
        }}
      >
        <FadeUp>
          <div
            style={{
              maxWidth: 560,
              margin: '0 auto',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,245,238,0.9))',
              backdropFilter: 'blur(20px)',
              borderRadius: '2rem',
              padding: 'clamp(2rem, 5vw, 3rem)',
              border: '1px solid rgba(237,213,200,0.6)',
              boxShadow: '0 16px 48px rgba(200,130,100,0.12)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
            <h2
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 700,
                color: '#2A1810',
                marginBottom: '0.75rem',
                lineHeight: 1.3,
              }}
            >
              Mulai ritual pertamamu
              <br />
              hari ini.
            </h2>
            <p style={{ color: '#8B6B61', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '2rem' }}>
              Investasi 5 menit sehari untuk hubungan yang lebih dalam,
              lebih jujur, dan lebih terhubung.
            </p>
            <Link
              href="/onboarding"
              className="btn-primary"
              style={{ textDecoration: 'none', justifyContent: 'center', padding: '1rem 2rem', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
            >
              <Heart size={18} fill="#fff" />
              Mulai Bersama Pasanganmu
              <ArrowRight size={18} />
            </Link>
            <p style={{ fontSize: '0.8rem', color: '#C4A090', marginTop: '1rem' }}>
              Gratis · Setup 3 menit · Tanpa kartu kredit
            </p>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER mini ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '1.5rem',
          borderTop: '1px solid rgba(237,213,200,0.4)',
          color: '#C4A090',
          fontSize: '0.8rem',
        }}
      >
        © 2026 LifebyDesign Couple · Dibuat dengan ❤️ untuk pasangan intentional
      </div>
    </div>
  )
}
