'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Star, ArrowRight, Heart, Shield, Sparkles, Crown, X } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import { useEffect } from 'react'

const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

// ── Feature comparison table ──────────────────────────────────────────────────
const FEATURES: { label: string; free: boolean | string; premium: boolean | string }[] = [
  { label: 'Daily mood check-in',                  free: true,         premium: true },
  { label: 'Habit tracker',                         free: '5 habits',   premium: 'Unlimited' },
  { label: 'Shared to-do list',                     free: true,         premium: true },
  { label: 'Private journal',                       free: true,         premium: true },
  { label: 'Shared streak',                         free: true,         premium: true },
  { label: 'Partner activity indicator',            free: true,         premium: true },
  { label: 'Weekly ritual lengkap',                 free: false,        premium: true },
  { label: 'AI Cooling Off (emotion translator)',   free: false,        premium: true },
  { label: '360° relationship scoring',             free: false,        premium: true },
  { label: 'Commitment tracker mingguan',           free: false,        premium: true },
  { label: 'Monthly recap + trend charts',          free: false,        premium: true },
  { label: 'Milestone badges',                      free: 'Basic',      premium: 'All badges' },
  { label: 'Template library (18 prompts)',         free: false,        premium: true },
  { label: 'AI self-suggestion dari pola mood',     free: false,        premium: true },
  { label: 'Deep trend analysis (3 bulan)',         free: false,        premium: true },
  { label: 'Data export (JSON/PDF)',                free: false,        premium: true },
  { label: 'Priority support',                      free: false,        premium: true },
]

const FAQ = [
  {
    q: 'Apakah bisa dicoba gratis?',
    a: 'Ya! Fitur Free tersedia selamanya tanpa batas waktu. Free trial 7 hari Premium juga tersedia tanpa kartu kredit.',
  },
  {
    q: 'Apakah data kami aman?',
    a: 'Data pribadi hanya bisa dilihat olehmu. Mood raw dan jurnal private tidak pernah dibagikan tanpa izin eksplisit dari kamu. Kami tidak menggunakan data untuk training AI model publik.',
  },
  {
    q: 'Bagaimana pembayaran?',
    a: 'Kami menggunakan Midtrans — mendukung transfer bank, kartu kredit/debit, GoPay, OVO, QRIS, dan metode pembayaran Indonesia lainnya.',
  },
  {
    q: 'Bisa cancel kapan saja?',
    a: 'Tentu. Tidak ada kontrak, tidak ada biaya cancel. Kamu tetap bisa menggunakan fitur Free setelah cancel.',
  },
  {
    q: 'Kalau putus (break up), data ke mana?',
    a: 'Kamu bisa export datamu sendiri kapan saja, dan disconnect pair connection. Data masing-masing partner bisa dihapus secara independen.',
  },
]

function FeatureRow({ label, free, premium }: { label: string; free: boolean | string; premium: boolean | string }) {
  function renderVal(val: boolean | string) {
    if (val === true)  return <Check size={16} color="#7BAE7F" strokeWidth={2.5} />
    if (val === false) return <X size={15} color="#D4B5A8" strokeWidth={2} />
    return <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B9FD4' }}>{val}</span>
  }
  return (
    <tr>
      <td style={{ padding: '0.625rem 0', fontSize: '0.875rem', color: '#5A3E38', borderBottom: '1px solid rgba(237,213,200,0.4)' }}>
        {label}
      </td>
      <td style={{ padding: '0.625rem 0', textAlign: 'center', borderBottom: '1px solid rgba(237,213,200,0.4)' }}>
        {renderVal(free)}
      </td>
      <td style={{ padding: '0.625rem 0', textAlign: 'center', borderBottom: '1px solid rgba(237,213,200,0.4)' }}>
        {renderVal(premium)}
      </td>
    </tr>
  )
}

export default function PricingPage() {
  useEffect(() => {
    analytics.pricingPageViewed('direct')
  }, [])

  return (
    <div className="bg-spring" style={{ minHeight: '100dvh', padding: '3rem 1rem 5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          style={{ textAlign: 'center' }}
        >
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
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#2A1810',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            Investasi kecil.
            <br />
            <span style={{ color: '#E8846A' }}>Dampak besar.</span>
          </h1>
          <p style={{ color: '#8B6B61', fontSize: '1rem', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Mulai gratis — upgrade saat kamu siap merasakan ritual yang lebih dalam.
            Tidak perlu kartu kredit untuk trial.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Free */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.75rem',
              padding: '2rem',
              border: '1.5px solid rgba(237,213,200,0.7)',
              boxShadow: '0 4px 20px rgba(200,130,100,0.07)',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B6B61', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Gratis</span>
              <div>
                <span style={{ fontSize: 'clamp(2rem,6vw,2.75rem)', fontWeight: 800, color: '#2A1810', lineHeight: 1 }}>Rp 0</span>
                <span style={{ color: '#C4A090', fontSize: '0.9rem', display: 'block', marginTop: '0.25rem' }}>Selamanya</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['Daily mood check-in', 'Habit tracker (5 habits)', 'Shared to-do list', 'Private journal', 'Streak counter'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: '#5A3E38' }}>
                  <Check size={15} color="#7BAE7F" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              style={{
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
                textDecoration: 'none',
              }}
            >
              Mulai Gratis
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Monthly */}
          <div
            style={{
              background: 'white',
              borderRadius: '1.75rem',
              padding: '2rem',
              border: '1.5px solid rgba(232,132,106,0.3)',
              boxShadow: '0 4px 24px rgba(232,132,106,0.12)',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E8846A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Premium Bulanan</span>
              <div>
                <span style={{ fontSize: 'clamp(2rem,6vw,2.75rem)', fontWeight: 800, color: '#2A1810', lineHeight: 1 }}>Rp 49k</span>
                <span style={{ color: '#C4A090', fontSize: '0.9rem', display: 'block', marginTop: '0.25rem' }}>/bulan</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#C4A090', marginTop: '0.375rem' }}>≈ Rp 1.600/hari</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['Semua fitur Free', 'Weekly Ritual lengkap', 'AI Cooling Off', '360° scoring + gap analysis', 'Monthly recap & milestone badges', 'Template library (18 prompts)', 'Data export'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: '#5A3E38' }}>
                  <Star size={14} color="#E8846A" fill="#E8846A" style={{ marginTop: 2, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="#trial"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => analytics.subscribeClicked('monthly', 'pricing_page')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem',
                borderRadius: '0.875rem',
                background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Coba 7 Hari Gratis
              <ArrowRight size={16} />
            </motion.a>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#C4A090', marginTop: '0.625rem' }}>Tidak perlu kartu kredit</p>
          </div>

          {/* Yearly — most popular anchor */}
          <div
            style={{
              background: 'linear-gradient(145deg,#FFF5EE,#FFF0E8)',
              borderRadius: '1.75rem',
              padding: '2rem',
              border: '2px solid rgba(232,132,106,0.4)',
              boxShadow: '0 12px 48px rgba(232,132,106,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Most popular badge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.5rem 1.25rem 0.5rem 1rem',
                borderBottomLeftRadius: '1rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              ✨ Paling Populer
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E8846A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Premium Tahunan</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: 'clamp(2rem,6vw,2.75rem)', fontWeight: 800, color: '#2A1810', lineHeight: 1 }}>Rp 399k</span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#D4B5A8',
                    textDecoration: 'line-through',
                    fontWeight: 500,
                  }}
                >
                  Rp 588k
                </span>
              </div>
              <span style={{ color: '#C4A090', fontSize: '0.9rem', display: 'block', marginTop: '0.25rem' }}>/tahun (≈ Rp 33k/bln)</span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'rgba(123,174,127,0.15)',
                  border: '1px solid rgba(123,174,127,0.3)',
                  borderRadius: '2rem',
                  padding: '0.25rem 0.75rem',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#3D7A43',
                }}
              >
                <Heart size={11} fill="#3D7A43" color="#3D7A43" />
                Hemat 32% vs bulanan
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['Semua fitur Premium Bulanan', 'Hemat Rp 189k/tahun', 'Deep trend analysis (3 bulan+)', 'Priority support', 'Akses fitur baru pertama'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: '#5A3E38' }}>
                  <Crown size={14} color="#B8956A" fill="#B8956A" style={{ marginTop: 2, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            <motion.a
              href="#trial"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => analytics.subscribeClicked('yearly', 'pricing_page')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                borderRadius: '0.875rem',
                background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(232,132,106,0.35)',
              }}
            >
              <Crown size={17} />
              Mulai 7 Hari Gratis
            </motion.a>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#C4A090', marginTop: '0.625rem' }}>
              Tagih Rp 399k/tahun setelah trial · Cancel kapan saja
            </p>
          </div>
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(200,130,100,0.07)',
            border: '1px solid rgba(237,213,200,0.5)',
            overflowX: 'auto',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#2A1810',
              marginBottom: '1.5rem',
            }}
          >
            Perbandingan Lengkap
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0 0 0.75rem', fontSize: '0.8rem', color: '#C4A090', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Fitur</th>
                <th style={{ textAlign: 'center', padding: '0 0 0.75rem', fontSize: '0.8rem', color: '#8B6B61', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', width: 80 }}>Gratis</th>
                <th style={{ textAlign: 'center', padding: '0 0 0.75rem', fontSize: '0.8rem', color: '#E8846A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', width: 90 }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { icon: Shield, title: 'Data 100% Privat', desc: 'Tidak ada iklan. Tidak ada data sharing.' },
            { icon: Heart, title: 'Cancel Kapan Saja', desc: 'Tidak ada kontrak. Tidak ada biaya cancel.' },
            { icon: Sparkles, title: 'Trial 7 Hari', desc: 'Coba semua fitur Premium tanpa kartu kredit.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: 'white',
                borderRadius: '1.25rem',
                padding: '1.25rem',
                textAlign: 'center',
                border: '1px solid rgba(237,213,200,0.5)',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '0.875rem', background: '#FFF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Icon size={20} color="#E8846A" />
              </div>
              <div style={{ fontWeight: 700, color: '#2A1810', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</div>
              <div style={{ fontSize: '0.8rem', color: '#8B6B61', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
        >
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.25rem,3.5vw,1.5rem)',
              fontWeight: 700,
              color: '#2A1810',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            Pertanyaan Umum
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                style={{
                  background: 'white',
                  borderRadius: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid rgba(237,213,200,0.5)',
                }}
              >
                <div style={{ fontWeight: 700, color: '#2A1810', fontSize: '0.9375rem', marginBottom: '0.5rem' }}>{q}</div>
                <div style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.65 }}>{a}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          id="trial"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,245,238,0.9))',
            backdropFilter: 'blur(20px)',
            borderRadius: '2rem',
            padding: 'clamp(2rem,5vw,3rem)',
            border: '1px solid rgba(237,213,200,0.6)',
            boxShadow: '0 16px 48px rgba(200,130,100,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💞</div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.375rem,3vw,1.875rem)', fontWeight: 700, color: '#2A1810', marginBottom: '0.5rem' }}>
            Siap mulai ritual pertamamu?
          </h2>
          <p style={{ color: '#8B6B61', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '2rem' }}>
            7 hari trial gratis. Bisa cancel kapan saja. Setup cuma 3 menit.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              className="btn-primary"
              style={{ textDecoration: 'none', padding: '0.9375rem 2rem', fontSize: '1rem' }}
              onClick={() => analytics.trialStarted('yearly')}
            >
              <Heart size={18} fill="#fff" />
              Mulai 7 Hari Gratis
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9375rem 1.5rem',
                borderRadius: '1rem',
                border: '1.5px solid rgba(139,107,97,0.25)',
                color: '#8B6B61',
                fontWeight: 600,
                fontSize: '0.9375rem',
                background: 'white',
              }}
            >
              Kembali ke Beranda
            </Link>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#C4A090', marginTop: '1.25rem' }}>
            Dengan melanjutkan, kamu setuju dengan{' '}
            <Link href="/privacy" style={{ color: '#E8846A', textDecoration: 'none' }}>
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </p>
        </motion.div>

      </div>
    </div>
  )
}
