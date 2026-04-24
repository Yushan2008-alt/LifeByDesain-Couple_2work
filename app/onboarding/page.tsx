'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMockStore } from '@/store/mockStore'
import { Copy, Check, Heart, Link2, Sparkles, ArrowRight } from 'lucide-react'
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/utils'
import { useAnalytics } from '@/lib/analytics'

// ── Framer Motion variants ────────────────────────────────────────────────────
const PAGE_IN  = { opacity: 0, x: 40, scale: 0.97 }
const PAGE_OUT = { opacity: 0, x: -40, scale: 0.97 }
const PAGE_ANIM = { opacity: 1, x: 0, scale: 1 }
const SPRING   = { type: 'spring', stiffness: 300, damping: 28 } as const

// ── Progress dots ─────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 8, background: i < current ? '#7BAE7F' : i === current ? '#E8846A' : '#EDD5C8' }}
          transition={SPRING}
          style={{ height: 8, borderRadius: 4 }}
        />
      ))}
    </div>
  )
}

// ── Floating petals background ────────────────────────────────────────────────
const PETALS = ['🌸', '🌷', '✿', '🌿', '🍀', '🌼']
function PetalBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${10 + i * 16}%`,
            top: `${5 + ((i * 31) % 80)}%`,
            animationDelay: `${i * 0.8}s`,
            fontSize: `${1 + (i % 3) * 0.4}rem`,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  )
}

// ============================================================
// STEP 1 — Partner A signs up
// ============================================================
function Step1PartnerA({ onNext }: { onNext: () => void }) {
  const setPartnerAName = useMockStore((s) => s.setPartnerAName)
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setPartnerAName(name.trim())
    onNext()
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}
      >
        🌸
      </motion.div>

      <h1
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontWeight: 700,
          color: '#2A1810',
          lineHeight: 1.2,
          marginBottom: '0.75rem',
        }}
      >
        Mulai perjalananmu
      </h1>
      <p style={{ color: '#8B6B61', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Siapa namamu? Pasanganmu akan melihat nama ini.
      </p>
      <p style={{ marginTop: '-1.6rem', marginBottom: '1.4rem', fontSize: '0.78rem', color: '#C4A090' }}>
        ⏱️ {'<'}3 menit sampai terhubung
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          className="input-warm"
          placeholder="Nama kamu..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 500 }}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="btn-primary"
          disabled={!name.trim()}
          style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
        >
          <span>Lanjut</span>
          <ArrowRight size={18} />
        </motion.button>
      </form>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: '#C4A090' }}>
          Gratis · Privat · Dibuat dengan ❤️
        </p>
        <p style={{ fontSize: '0.75rem', color: '#C4A090', fontWeight: 500 }}>
          ⏱ Setup &lt;3 menit — terhubung dengan pasanganmu sekarang
        </p>
      </div>
    </div>
  )
}

// ============================================================
// STEP 2 — Invite Token
// ============================================================
function Step2Invite({ onNext }: { onNext: () => void }) {
  const inviteToken = useMockStore((s) => s.inviteToken)
  const partnerA = useMockStore((s) => s.partnerA)
  const [copied, setCopied] = useState(false)

  const inviteLink = `https://lifebydesign.app/join?token=${inviteToken}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
        style={{ fontSize: '3rem', marginBottom: '1.25rem' }}
      >
        💌
      </motion.div>

      <h2
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700,
          color: '#2A1810',
          marginBottom: '0.625rem',
        }}
      >
        Undang pasanganmu
      </h2>
      <p style={{ color: '#8B6B61', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        Bagikan link ini ke <strong style={{ color: '#2A1810' }}>{partnerA.name}</strong>&apos;s partner.
        Mereka akan langsung terhubung denganmu.
      </p>

      {/* Token card */}
      <div
        style={{
          background: 'linear-gradient(135deg,#FFF5EE,#FFE8D6)',
          border: '1.5px dashed rgba(232,132,106,0.4)',
          borderRadius: '1rem',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Unique Token
        </div>
        <div style={{ fontSize: 'clamp(1.1rem,4vw,1.625rem)', fontWeight: 800, letterSpacing: '0.1em', color: '#E8846A', fontFamily: 'monospace' }}>
          {inviteToken}
        </div>
      </div>

      {/* Copy link */}
      <div
        style={{
          background: '#FFF8F5',
          border: '1.5px solid #EDD5C8',
          borderRadius: '0.875rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <Link2 size={14} color="#C4A090" style={{ flexShrink: 0 }} />
        <span
          style={{
            fontSize: '0.8rem',
            color: '#8B6B61',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {inviteLink}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          style={{
            background: copied ? '#7BAE7F' : '#E8846A',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.375rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Tersalin!' : 'Salin'}
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Partner B sudah bisa bergabung →
      </motion.button>
    </div>
  )
}

// ============================================================
// STEP 3 — Simulate Partner B Joining
// ============================================================
function Step3PartnerB({ onNext }: { onNext: () => void }) {
  const joinAsPartnerB = useMockStore((s) => s.joinAsPartnerB)
  const inviteToken = useMockStore((s) => s.inviteToken)
  const partnerA = useMockStore((s) => s.partnerA)
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Masukkan nama dulu, ya 🌸'); return }
    if (token.trim().toUpperCase() !== inviteToken) {
      setError('Token tidak cocok. Coba tempel token dari Step 2.')
      return
    }
    setError('')
    joinAsPartnerB(name.trim())
    onNext()
  }

  function handleAutoFill() {
    setToken(inviteToken)
    if (!name.trim()) setName('My Love')
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0, rotate: 20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
        style={{ fontSize: '3rem', marginBottom: '1.25rem' }}
      >
        💑
      </motion.div>

      <h2
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700,
          color: '#2A1810',
          marginBottom: '0.5rem',
        }}
      >
        Partner B bergabung
      </h2>
      <p style={{ color: '#8B6B61', fontSize: '0.9375rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
        Simulasi: <strong style={{ color: '#2A1810' }}>{partnerA.name}</strong> sudah mengirim invite.
        Sekarang Partner B masuk.
      </p>

      {/* Shortcut for testing */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleAutoFill}
        style={{
          background: 'rgba(123,174,127,0.12)',
          border: '1px solid rgba(123,174,127,0.3)',
          borderRadius: '0.625rem',
          padding: '0.375rem 0.875rem',
          fontSize: '0.8rem',
          color: '#5A9660',
          cursor: 'pointer',
          marginBottom: '1.75rem',
          fontWeight: 500,
        }}
      >
        ✦ Auto-fill token (testing shortcut)
      </motion.button>

      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <input
          className="input-warm"
          placeholder="Nama Partner B..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ textAlign: 'center' }}
        />
        <input
          className="input-warm"
          placeholder="Paste token invite..."
          value={token}
          onChange={(e) => { setToken(e.target.value); setError('') }}
          style={{ textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.08em' }}
        />
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#E87070', fontSize: '0.8125rem' }}>
            {error}
          </motion.p>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="btn-primary"
          disabled={!name.trim() || !token.trim()}
          style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
        >
          <Heart size={16} />
          Bergabung sebagai Partner B
        </motion.button>
      </form>
    </div>
  )
}

// ============================================================
// STEP 4 — Optional baseline 360
// ============================================================
function BaselineOptionalStep({ onNext }: { onNext: () => void }) {
  const setBaseline360 = useMockStore((s) => s.setBaseline360)
  const [showForm, setShowForm] = useState(false)
  const [scoresA, setScoresA] = useState({ communication: 7, intimacy: 7, support: 7, fun: 7, effort: 7 })
  const [scoresB, setScoresB] = useState({ communication: 7, intimacy: 7, support: 7, fun: 7, effort: 7 })

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>📊</div>
      <h2
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700,
          color: '#2A1810',
          marginBottom: '0.5rem',
        }}
      >
        Baseline 360 (Opsional)
      </h2>
      <p style={{ color: '#8B6B61', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Supaya growth kalian bisa diukur sejak awal, kalian bisa isi baseline score sekarang.
      </p>
      <button className="btn-secondary" onClick={() => setShowForm((v) => !v)} style={{ justifyContent: 'center', width: '100%', marginBottom: '0.8rem' }}>
        {showForm ? 'Sembunyikan form baseline' : 'Isi baseline sekarang'}
      </button>
      {showForm && (
        <div style={{ display: 'grid', gap: '0.65rem', textAlign: 'left', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#E8846A', fontWeight: 700 }}>Partner A</div>
          {DIMENSIONS.map((dim) => (
            <label key={`a-${dim}`} style={{ display: 'grid', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#5A3E37' }}>{DIMENSION_LABELS[dim]}</span>
              <input type="range" min={1} max={10} value={scoresA[dim]} onChange={(e) => setScoresA((prev) => ({ ...prev, [dim]: +e.target.value }))} style={{ width: '100%', accentColor: '#E8846A' }} />
            </label>
          ))}
          <div style={{ fontSize: '0.8rem', color: '#3D7A43', fontWeight: 700, marginTop: '0.35rem' }}>Partner B</div>
          {DIMENSIONS.map((dim) => (
            <label key={`b-${dim}`} style={{ display: 'grid', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#5A3E37' }}>{DIMENSION_LABELS[dim]}</span>
              <input type="range" min={1} max={10} value={scoresB[dim]} onChange={(e) => setScoresB((prev) => ({ ...prev, [dim]: +e.target.value }))} style={{ width: '100%', accentColor: '#7BAE7F' }} />
            </label>
          ))}
          <button
            className="btn-primary"
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
            onClick={() => {
              setBaseline360({ partnerA: scoresA, partnerB: scoresB })
              onNext()
            }}
          >
            Simpan baseline & lanjut
          </button>
        </div>
      )}
      <button className="btn-ghost" onClick={() => { setBaseline360(null); onNext() }} style={{ justifyContent: 'center', width: '100%' }}>
        Lewati dulu (tetap optional)
      </button>
    </div>
  )
}

// ============================================================
// STEP 5 — Connected! 🎉
// ============================================================
function ConnectedStep({ onFinish }: { onFinish: () => void }) {
  const partnerA = useMockStore((s) => s.partnerA)
  const partnerB = useMockStore((s) => s.partnerB)
  const streak = useMockStore((s) => s.streak)

  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.6, times: [0, 0.6, 1] }}
        style={{ fontSize: '4rem', marginBottom: '1.25rem' }}
      >
        💞
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontWeight: 700,
          color: '#2A1810',
          marginBottom: '0.5rem',
        }}
      >
        Kalian terhubung! ✨
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: '#8B6B61', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}
      >
        Selamat datang,{' '}
        <strong style={{ color: '#E8846A' }}>{partnerA.name}</strong> &amp;{' '}
        <strong style={{ color: '#7BAE7F' }}>{partnerB.name}</strong>!
        <br />
        Mulai investasi hubunganmu hari ini.
      </motion.p>

      {/* Connected card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          background: 'linear-gradient(135deg,#FFF5EE,#F0F7F0)',
          border: '1px solid rgba(237,213,200,0.6)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Partner A */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.375rem', marginBottom: '0.375rem',
            }}
          >
            {partnerA.name.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1810' }}>{partnerA.name}</div>
          <div style={{ fontSize: '0.7rem', color: '#8B6B61' }}>Partner A</div>
        </div>

        {/* Heart connector */}
        <div>
          <Heart size={20} color="#E8846A" fill="#E8846A" />
        </div>

        {/* Partner B */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7BAE7F,#B5D4B5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.375rem', marginBottom: '0.375rem',
            }}
          >
            {partnerB.name.charAt(0).toUpperCase() || 'B'}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1810' }}>{partnerB.name}</div>
          <div style={{ fontSize: '0.7rem', color: '#8B6B61' }}>Partner B</div>
        </div>
      </motion.div>

      {/* Streak starter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(123,174,127,0.12)', border: '1px solid rgba(123,174,127,0.25)',
          borderRadius: '2rem', padding: '0.5rem 1rem',
          fontSize: '0.875rem', color: '#3D7A43', fontWeight: 600,
          marginBottom: '2rem',
        }}
      >
        <Sparkles size={14} />
        Streak dimulai: {streak} hari dummy data sudah menunggu!
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onFinish}
        className="btn-primary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
      >
        Satu langkah lagi →
      </motion.button>
    </div>
  )
}

// ============================================================
// PAGE — Onboarding shell
// ============================================================
const STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const partnerA = useMockStore((s) => s.partnerA)
  const partnerB = useMockStore((s) => s.partnerB)
  const coupleId = useMockStore((s) => s.coupleId)
  const { trackOnce } = useAnalytics()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // If already paired, skip straight to dashboard
  useEffect(() => {
    if (partnerA.joined && partnerB.joined) {
      router.replace('/dashboard')
    }
  }, [])

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS - 1))
  }

  function goToDashboard() {
    trackOnce('onboarding_completed', { source: 'onboarding_finish', coupleId })
    router.push('/dashboard')
  }

  return (
    <div
      className="bg-spring"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PetalBg />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 440,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2rem',
          padding: 'clamp(1.75rem, 5vw, 2.5rem)',
          boxShadow: '0 24px 64px rgba(200,130,100,0.18), 0 4px 16px rgba(200,130,100,0.10)',
          border: '1px solid rgba(237,213,200,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Step dots */}
        <div style={{ marginBottom: '2rem' }}>
          <StepDots current={step} total={STEPS} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={direction > 0 ? PAGE_IN : { ...PAGE_IN, x: -40 }}
            animate={PAGE_ANIM}
            exit={direction > 0 ? PAGE_OUT : { ...PAGE_OUT, x: 40 }}
            transition={SPRING}
          >
            {step === 0 && <Step1PartnerA onNext={goNext} />}
            {step === 1 && <Step2Invite onNext={goNext} />}
            {step === 2 && <Step3PartnerB onNext={goNext} />}
            {step === 3 && <BaselineOptionalStep onNext={goNext} />}
            {step === 4 && <ConnectedStep onFinish={goToDashboard} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
