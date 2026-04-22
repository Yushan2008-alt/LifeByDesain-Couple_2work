'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from 'recharts'
import { useMockStore, simulateAIRefine } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import { today, DIMENSION_LABELS, DIMENSIONS, habitCompletionThisWeek, type Dimension } from '@/lib/utils'
import {
  Sparkles, Wand2, Share2, CheckCircle2, Trophy, Heart, ArrowRight,
  ChevronLeft, TrendingUp, Star, Plus,
} from 'lucide-react'

// ── Shared ──────────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

function StepDots({ current, total }: { current: number; total: number }) {
  const labels = ['Overview', 'Emosi', '360°', 'Wins']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === current ? 28 : 8,
              background: i < current ? '#7BAE7F' : i === current ? '#E8846A' : '#EDD5C8',
            }}
            transition={SPRING}
            style={{ height: 8, borderRadius: 4 }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: '#C4A090', letterSpacing: '0.05em' }}>
        {labels[current]} · {current + 1}/{total}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — Weekly Overview (Daily Feed → Weekly Review)
// ═══════════════════════════════════════════════════════════════════
function Step1Overview({ onNext }: { onNext: () => void }) {
  const { moodHistory, habits, emotionDumps, streak, partnerA, partnerB } = useMockStore(useShallow((s) => ({
    moodHistory:   s.moodHistory,
    habits:        s.habits,
    emotionDumps:  s.emotionDumps,
    streak:        s.streak,
    partnerA:      s.partnerA,
    partnerB:      s.partnerB,
  })))

  // Build 7-day window
  const weekDates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    weekDates.push(d.toISOString().split('T')[0])
  }
  const DAY_SHORT = ['M', 'S', 'S', 'R', 'K', 'J', 'S']

  // Per-partner mood this week
  function weekMoods(partner: 'A' | 'B') {
    return weekDates.map((date) => moodHistory.filter((m) => m.date === date && m.partner === partner).at(-1))
  }
  const moodsA = weekMoods('A')
  const moodsB = weekMoods('B')

  // Habit completion
  const habitsA = habits.filter((h) => h.partner === 'A')
  const habitsB = habits.filter((h) => h.partner === 'B')
  const avgA    = habitsA.length ? Math.round(habitsA.reduce((s, h) => s + habitCompletionThisWeek(h.completedDays), 0) / habitsA.length) : 0
  const avgB    = habitsB.length ? Math.round(habitsB.reduce((s, h) => s + habitCompletionThisWeek(h.completedDays), 0) / habitsB.length) : 0

  // Pending emotion dumps
  const pendingDumps = emotionDumps.filter((e) => !e.shared && !e.refinedText)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          Minggu ini 📅
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61' }}>
          Review data daily kalian sebelum mulai ritual mingguan.
        </p>
      </div>

      {/* Streak recap */}
      <div
        style={{
          background: 'linear-gradient(135deg,rgba(232,132,106,0.1),rgba(244,160,160,0.08))',
          border: '1px solid rgba(232,132,106,0.2)',
          borderRadius: '1rem', padding: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '0.125rem' }}>Streak Bersama</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: '#E8846A' }}>{streak}</span>
            <span style={{ fontSize: '0.8rem', color: '#C4A090' }}>hari</span>
          </div>
        </div>
        <span style={{ fontSize: '2.5rem' }}>🔥</span>
      </div>

      {/* Mood sparklines — both partners */}
      <div className="card" style={{ padding: '1.25rem', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <TrendingUp size={14} color="#E8846A" /> Mood Minggu Ini
        </h4>

        {([['A', partnerA.name, '#E8846A', moodsA], ['B', partnerB.name, '#7BAE7F', moodsB]] as const).map(([p, name, color, moods]) => (
          <div key={p}>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61', marginBottom: '0.375rem', fontWeight: 600 }}>
              {name || `Partner ${p}`}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end' }}>
              {(moods as (typeof moodsA[0])[]).map((entry, i) => {
                const h = entry ? (entry.intensity / 5) * 32 + 6 : 6
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', lineHeight: 1 }}>{entry?.emoji || '·'}</div>
                    <motion.div
                      animate={{ height: h }}
                      transition={SPRING}
                      style={{
                        width: '100%', borderRadius: 3, minHeight: 6,
                        background: entry ? color : 'rgba(237,213,200,0.4)',
                        opacity: entry ? 1 : 0.4,
                      }}
                    />
                    <div style={{ fontSize: '0.6rem', color: '#C4A090' }}>
                      {DAY_SHORT[new Date(weekDates[i] + 'T00:00:00').getDay()]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Habit completion */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <CheckCircle2 size={14} color="#7BAE7F" /> Habit Completion Minggu Ini
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {([['A', partnerA.name, '#E8846A', avgA], ['B', partnerB.name, '#7BAE7F', avgB]] as const).map(([p, name, color, pct]) => (
            <div key={p}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#5A3E37', fontWeight: 500 }}>{name || `Partner ${p}`}</span>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: '#EDD5C8', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ ...SPRING, delay: 0.2 }}
                  style={{ height: '100%', background: color, borderRadius: 4 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending emotion dumps notice */}
      {pendingDumps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(244,160,160,0.10)',
            border: '1px solid rgba(244,160,160,0.25)',
            borderRadius: '1rem',
            padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>💌</span>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#C07070' }}>
              {pendingDumps.length} emotion dump menunggu
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61' }}>
              AI akan bantu haluskan di step berikutnya
            </div>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}
      >
        Lanjut ke Emotion Translation <ArrowRight size={16} />
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2 — AI Emotion Translation
// ═══════════════════════════════════════════════════════════════════
function Step2EmotionTranslation({ onNext }: { onNext: () => void }) {
  const { emotionDumps, setRefinedText, shareEmotionDump, partnerA, partnerB } = useMockStore((s) => ({
    emotionDumps:    s.emotionDumps,
    setRefinedText:  s.setRefinedText,
    shareEmotionDump: s.shareEmotionDump,
    partnerA:        s.partnerA,
    partnerB:        s.partnerB,
  }))
  const [newRaw, setNewRaw]   = useState('')
  const [newPart, setNewPart] = useState<'A' | 'B'>('A')
  const addEmotionDump        = useMockStore((s) => s.addEmotionDump)

  const pendingDumps = emotionDumps.filter((e) => !e.shared)
  const [refiningId, setRefiningId] = useState<string | null>(null)

  function getName(p: 'A' | 'B') {
    return (p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`
  }

  async function handleRefine(id: string, rawText: string) {
    setRefiningId(id)
    await new Promise((r) => setTimeout(r, 1800)) // simulate API
    const refined = simulateAIRefine(rawText)
    setRefinedText(id, refined)
    setRefiningId(null)
  }

  function handleAddNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newRaw.trim()) return
    addEmotionDump(newRaw.trim(), newPart)
    setNewRaw('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          AI Emotion Translation 💌
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Emosi mentah diubah jadi bahasa yang clear, jujur, dan non-accusatory. Kamu review dulu sebelum share ke pasangan.
        </p>
      </div>

      {/* How it works */}
      <div
        style={{
          background: 'linear-gradient(135deg,rgba(232,132,106,0.06),rgba(244,160,160,0.06))',
          border: '1px solid rgba(232,132,106,0.15)',
          borderRadius: '1rem', padding: '0.875rem 1rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}
      >
        <Wand2 size={16} color="#E8846A" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: '#8B6B61', lineHeight: 1.5 }}>
          AI menjaga tone: <em>honest but kind, specific but not blaming.</em>
          Raw version tetap terlihat oleh kamu. Partner hanya menerima versi yang sudah dihaluskan.
        </p>
      </div>

      {/* Existing dumps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pendingDumps.length === 0 && (
          <p style={{ textAlign: 'center', color: '#C4A090', fontSize: '0.875rem', padding: '1rem' }}>
            Belum ada emotion dump minggu ini. Tulis satu di bawah!
          </p>
        )}

        <AnimatePresence>
          {pendingDumps.map((dump) => (
            <motion.div
              key={dump.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: dump.partner === 'A' ? 'rgba(232,132,106,0.15)' : 'rgba(123,174,127,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                      color: dump.partner === 'A' ? '#E8846A' : '#7BAE7F',
                    }}
                  >
                    {getName(dump.partner).charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1810' }}>
                    {getName(dump.partner)}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#C4A090' }}>
                  {dump.date}
                </span>
              </div>

              {/* Raw text */}
              <div
                style={{
                  background: '#FFF8F5', border: '1px solid #EDD5C8',
                  borderRadius: '0.75rem', padding: '0.875rem',
                  fontSize: '0.875rem', color: '#5A3E37', lineHeight: 1.6,
                  fontStyle: 'italic',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#C4A090', marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
                  RAW (hanya terlihat olehmu)
                </div>
                &ldquo;{dump.rawText}&rdquo;
              </div>

              {/* Refine button or result */}
              {!dump.refinedText ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRefine(dump.id, dump.rawText)}
                  disabled={refiningId === dump.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: refiningId === dump.id
                      ? 'rgba(232,132,106,0.1)'
                      : 'linear-gradient(135deg,#E8846A,#D4705A)',
                    color: refiningId === dump.id ? '#E8846A' : 'white',
                    border: refiningId === dump.id ? '1.5px solid rgba(232,132,106,0.3)' : 'none',
                    borderRadius: '0.75rem', padding: '0.75rem',
                    fontWeight: 600, fontSize: '0.875rem',
                    cursor: refiningId === dump.id ? 'wait' : 'pointer',
                  }}
                >
                  {refiningId === dump.id ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>✦</motion.span>
                      AI sedang memproses...
                    </>
                  ) : (
                    <>
                      <Wand2 size={15} />
                      Refine with AI
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  {/* Refined result */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg,rgba(123,174,127,0.08),rgba(181,212,181,0.08))',
                      border: '1px solid rgba(123,174,127,0.25)',
                      borderRadius: '0.75rem', padding: '0.875rem',
                      fontSize: '0.875rem', color: '#2A1810', lineHeight: 1.7,
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#5A9660', marginBottom: '0.375rem', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={11} /> AI REFINED
                    </div>
                    {dump.refinedText}
                  </div>

                  {/* Share button */}
                  {!dump.shared && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => shareEmotionDump(dump.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        background: 'rgba(123,174,127,0.12)',
                        border: '1.5px solid rgba(123,174,127,0.3)',
                        borderRadius: '0.75rem', padding: '0.625rem',
                        color: '#3D7A43', fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Share2 size={14} />
                      Kirim ke Pasangan
                    </motion.button>
                  )}
                  {dump.shared && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#3D7A43', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} />
                      Sudah dikirim ke {getName(dump.partner === 'A' ? 'B' : 'A')} ✓
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add new dump inline */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem' }}>
          + Tambah Emotion Dump Baru
        </h4>
        <form onSubmit={handleAddNew} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['A', 'B'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setNewPart(p)}
                style={{
                  flex: 1, padding: '0.5rem',
                  background: newPart === p ? (p === 'A' ? 'rgba(232,132,106,0.12)' : 'rgba(123,174,127,0.12)') : '#FFF8F5',
                  border: `1.5px solid ${newPart === p ? (p === 'A' ? 'rgba(232,132,106,0.4)' : 'rgba(123,174,127,0.4)') : '#EDD5C8'}`,
                  borderRadius: '0.625rem', fontSize: '0.8rem',
                  color: newPart === p ? (p === 'A' ? '#E8846A' : '#3D7A43') : '#8B6B61',
                  cursor: 'pointer', fontWeight: newPart === p ? 700 : 500,
                }}
              >
                {(p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`}
              </button>
            ))}
          </div>
          <textarea
            className="input-warm"
            placeholder="Tulis perasaan mentah..."
            value={newRaw}
            onChange={(e) => setNewRaw(e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
          <button type="submit" className="btn-secondary" disabled={!newRaw.trim()} style={{ justifyContent: 'center' }}>
            <Plus size={14} /> Tambahkan
          </button>
        </form>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}
      >
        Lanjut ke 360° Scoring <ArrowRight size={16} />
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3 — 360° Scoring
// ═══════════════════════════════════════════════════════════════════
function ScoreSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#5A3E37' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#E8846A' }}>{value}/10</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: '#E8846A', height: 4 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#C4A090' }}>
        <span>Perlu Kerja Keras</span>
        <span>Luar Biasa</span>
      </div>
    </div>
  )
}

const DEFAULT_SCORES = { communication: 7, intimacy: 7, support: 7, fun: 7, effort: 7 }

function Step3Scoring({ onNext }: { onNext: () => void }) {
  const { scores, upsertScore, partnerA, partnerB } = useMockStore((s) => ({
    scores: s.scores, upsertScore: s.upsertScore,
    partnerA: s.partnerA, partnerB: s.partnerB,
  }))

  const WEEK = 'W-current'

  const existingA = scores.find((s) => s.week === WEEK && s.partner === 'A')
  const existingB = scores.find((s) => s.week === WEEK && s.partner === 'B')

  const [selfA, setSelfA] = useState(existingA?.self ?? { ...DEFAULT_SCORES })
  const [selfB, setSelfB] = useState(existingB?.self ?? { ...DEFAULT_SCORES })
  const [saved, setSaved]  = useState(false)

  function handleSave() {
    upsertScore({ week: WEEK, partner: 'A', self: selfA, perceived: { ...DEFAULT_SCORES } })
    upsertScore({ week: WEEK, partner: 'B', self: selfB, perceived: { ...DEFAULT_SCORES } })
    setSaved(true)
  }

  // Build radar data
  const radarData = DIMENSIONS.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    [partnerA.name || 'Partner A']: selfA[dim],
    [partnerB.name || 'Partner B']: selfB[dim],
    // also include last week for gap analysis
    'Minggu Lalu (A)': scores.find((s) => s.week === 'W-prev' && s.partner === 'A')?.self[dim] ?? 7,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          360° Scoring 🎯
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Masing-masing kasih skor untuk 5 dimensi hubungan. Gap antar skor = insight berharga.
        </p>
      </div>

      {/* Radar chart */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '1rem' }}>
          📊 Perbandingan Visual
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(237,213,200,0.7)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: '#8B6B61', fontFamily: 'var(--font-dm-sans)' }}
            />
            <Radar
              name={partnerA.name || 'Partner A'}
              dataKey={partnerA.name || 'Partner A'}
              stroke="#E8846A"
              fill="#E8846A"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Radar
              name={partnerB.name || 'Partner B'}
              dataKey={partnerB.name || 'Partner B'}
              stroke="#7BAE7F"
              fill="#7BAE7F"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
            />
            <Tooltip
              contentStyle={{
                background: 'white', border: '1px solid #EDD5C8',
                borderRadius: '0.75rem', fontSize: '0.8rem',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders — Partner A */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8846A' }} />
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2A1810' }}>
            {partnerA.name || 'Partner A'} — Penilaianku
          </h4>
        </div>
        {DIMENSIONS.map((dim) => (
          <ScoreSlider
            key={dim}
            label={DIMENSION_LABELS[dim]}
            value={selfA[dim]}
            onChange={(v) => setSelfA((prev) => ({ ...prev, [dim]: v }))}
          />
        ))}
      </div>

      {/* Sliders — Partner B */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7BAE7F' }} />
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2A1810' }}>
            {partnerB.name || 'Partner B'} — Penilaianku
          </h4>
        </div>
        {DIMENSIONS.map((dim) => (
          <ScoreSlider
            key={dim}
            label={DIMENSION_LABELS[dim]}
            value={selfB[dim]}
            onChange={(v) => setSelfB((prev) => ({ ...prev, [dim]: v }))}
          />
        ))}
      </div>

      {/* Gap analysis */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Sparkles size={13} color="#E8846A" /> Gap Analysis
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DIMENSIONS.map((dim) => {
            const gap  = Math.abs(selfA[dim] - selfB[dim])
            const max  = Math.max(selfA[dim], selfB[dim])
            const who  = selfA[dim] > selfB[dim] ? partnerA.name || 'A' : partnerB.name || 'B'
            return (
              <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#5A3E37', width: 90, flexShrink: 0 }}>{DIMENSION_LABELS[dim]}</span>
                <div style={{ flex: 1, height: 6, background: '#EDD5C8', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${(max / 10) * 100}%` }}
                    transition={SPRING}
                    style={{ height: '100%', background: gap > 2 ? '#F4A0A0' : '#7BAE7F', borderRadius: 3 }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.7rem', fontWeight: 700, width: 30, textAlign: 'right', flexShrink: 0,
                    color: gap > 2 ? '#C07070' : '#3D7A43',
                  }}
                >
                  {gap > 0 ? `±${gap}` : '✓'}
                </span>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.75rem' }}>
          ±0–1 = aligned ✓ &nbsp;|&nbsp; ±2+ = worth discussing 💬
        </p>
      </div>

      {/* Save + Next */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {!saved ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Simpan Skor Minggu Ini
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(123,174,127,0.12)', border: '1px solid rgba(123,174,127,0.3)',
              borderRadius: '0.875rem', padding: '0.75rem',
              textAlign: 'center', color: '#3D7A43', fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            ✓ Skor tersimpan! 🌿
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}
        >
          Lanjut ke Wins & Perayaan <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4 — Wins Celebration
// ═══════════════════════════════════════════════════════════════════
function Step4Wins({ onFinish }: { onFinish: () => void }) {
  const { wins, addWin, partnerA, partnerB, streak } = useMockStore((s) => ({
    wins: s.wins, addWin: s.addWin,
    partnerA: s.partnerA, partnerB: s.partnerB, streak: s.streak,
  }))
  const [text, setText]         = useState('')
  const [type, setType]         = useState<'relationship' | 'individual'>('relationship')
  const [partner, setPartner]   = useState<'A' | 'B'>('A')
  const [showForm, setShowForm] = useState(false)

  function getName(p: 'A' | 'B') {
    return (p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addWin(text.trim(), type, partner)
    setText(''); setShowForm(false)
  }

  const relWins = wins.filter((w) => w.type === 'relationship')
  const indWins = wins.filter((w) => w.type === 'individual')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          style={{ fontSize: '3rem', marginBottom: '0.75rem' }}
        >
          🏆
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          Celebrate Wins! ✨
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Acknowledge apa yang sudah bagus minggu ini — hubungan dan personal growth.
        </p>
      </div>

      {/* Streak badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg,#E8846A,#D4705A)',
          borderRadius: '1.25rem', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          color: 'white', boxShadow: '0 6px 20px rgba(200,130,100,0.3)',
        }}
      >
        <span style={{ fontSize: '2rem' }}>🔥</span>
        <div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85, letterSpacing: '0.05em' }}>STREAK ACHIEVEMENT</div>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700 }}>
            {streak} Hari Berturut-turut!
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{getName('A')} & {getName('B')} sama-sama konsisten 💪</div>
        </div>
      </motion.div>

      {/* Relationship wins */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Heart size={14} color="#E8846A" fill="#E8846A" /> Relationship Wins
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
            {relWins.map((win, i) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'rgba(232,132,106,0.06)',
                  border: '1px solid rgba(232,132,106,0.15)',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem',
                  fontSize: '0.875rem', color: '#2A1810',
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                }}
              >
                <Star size={14} color="#E8846A" fill="#E8846A" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{win.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {relWins.length === 0 && (
            <p style={{ color: '#C4A090', fontSize: '0.8125rem', padding: '0.25rem' }}>
              Belum ada. Tambahkan satu!
            </p>
          )}
        </div>
      </div>

      {/* Individual wins */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Trophy size={14} color="#7BAE7F" /> Individual Wins
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
            {indWins.map((win, i) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'rgba(123,174,127,0.06)',
                  border: '1px solid rgba(123,174,127,0.15)',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem',
                  fontSize: '0.875rem', color: '#2A1810',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Star size={14} color="#7BAE7F" fill="#7BAE7F" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{win.text}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem', color: win.partner === 'A' ? '#E8846A' : '#7BAE7F',
                    background: win.partner === 'A' ? 'rgba(232,132,106,0.1)' : 'rgba(123,174,127,0.1)',
                    borderRadius: '2rem', padding: '0.125rem 0.5rem', flexShrink: 0, fontWeight: 600,
                  }}
                >
                  {getName(win.partner)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {indWins.length === 0 && (
            <p style={{ color: '#C4A090', fontSize: '0.8125rem', padding: '0.25rem' }}>
              Belum ada. Rayakan pencapaianmu!
            </p>
          )}
        </div>
      </div>

      {/* Add win */}
      <div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm((v) => !v)}
          style={{
            background: showForm ? 'rgba(237,213,200,0.6)' : 'rgba(232,132,106,0.1)',
            border: `1.5px dashed ${showForm ? '#C4A090' : 'rgba(232,132,106,0.35)'}`,
            borderRadius: '1rem', padding: '0.75rem',
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            color: showForm ? '#8B6B61' : '#E8846A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          {showForm ? 'Batal' : 'Tambah Win Baru'}
        </motion.button>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', overflow: 'hidden' }}
            >
              {/* Type toggle */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['relationship', 'individual'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      flex: 1, padding: '0.5rem',
                      background: type === t ? (t === 'relationship' ? 'rgba(232,132,106,0.1)' : 'rgba(123,174,127,0.1)') : '#FFF8F5',
                      border: `1.5px solid ${type === t ? (t === 'relationship' ? 'rgba(232,132,106,0.4)' : 'rgba(123,174,127,0.4)') : '#EDD5C8'}`,
                      borderRadius: '0.625rem', fontSize: '0.8rem',
                      color: type === t ? (t === 'relationship' ? '#E8846A' : '#3D7A43') : '#8B6B61',
                      cursor: 'pointer', fontWeight: type === t ? 700 : 500,
                    }}
                  >
                    {t === 'relationship' ? '❤️ Berdua' : '⭐ Personal'}
                  </button>
                ))}
              </div>

              {/* Partner (only for individual) */}
              {type === 'individual' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['A', 'B'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPartner(p)}
                      style={{
                        flex: 1, padding: '0.375rem',
                        background: partner === p ? (p === 'A' ? 'rgba(232,132,106,0.1)' : 'rgba(123,174,127,0.1)') : 'transparent',
                        border: `1px solid ${partner === p ? (p === 'A' ? 'rgba(232,132,106,0.35)' : 'rgba(123,174,127,0.35)') : '#EDD5C8'}`,
                        borderRadius: '0.5rem', fontSize: '0.75rem',
                        color: partner === p ? (p === 'A' ? '#E8846A' : '#3D7A43') : '#8B6B61',
                        cursor: 'pointer', fontWeight: partner === p ? 600 : 400,
                      }}
                    >
                      {getName(p)}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="input-warm"
                placeholder="Describe the win..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                style={{ resize: 'none' }}
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!text.trim()}
                style={{ justifyContent: 'center', padding: '0.625rem' }}
              >
                Tambahkan Win 🎉
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Finish ritual */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onFinish}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'linear-gradient(135deg,#E8846A,#D4705A)',
          color: 'white', border: 'none',
          borderRadius: '1.25rem', padding: '1.25rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(200,130,100,0.35)',
          width: '100%',
        }}
      >
        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700 }}>
          Ritual Selesai! 🌸
        </span>
        <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
          Sampai weekly ritual berikutnya
        </span>
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE — Weekly Ritual shell
// ═══════════════════════════════════════════════════════════════════
const TOTAL_STEPS = 4

export default function WeeklyRitualPage() {
  const router = useRouter()
  const { partnerA, partnerB, activeWeeklyStep, setActiveWeeklyStep } = useMockStore((s) => ({
    partnerA: s.partnerA, partnerB: s.partnerB,
    activeWeeklyStep: s.activeWeeklyStep, setActiveWeeklyStep: s.setActiveWeeklyStep,
  }))

  const [step, setStep]       = useState(activeWeeklyStep)
  const [direction, setDir]   = useState(1)

  useEffect(() => {
    if (!partnerA.joined || !partnerB.joined) router.replace('/onboarding')
  }, [])

  function goNext() {
    setDir(1); const next = Math.min(step + 1, TOTAL_STEPS - 1)
    setStep(next); setActiveWeeklyStep(next)
  }

  function goBack() {
    if (step === 0) { router.push('/dashboard'); return }
    setDir(-1); const prev = step - 1
    setStep(prev); setActiveWeeklyStep(prev)
  }

  function finish() {
    setActiveWeeklyStep(0)
    router.push('/dashboard')
  }

  if (!partnerA.joined || !partnerB.joined) return null

  const PAGE_IN  = { opacity: 0, x: direction > 0 ? 40 : -40, scale: 0.97 }
  const PAGE_OUT = { opacity: 0, x: direction > 0 ? -40 : 40, scale: 0.97 }

  return (
    <div
      className="bg-spring"
      style={{ minHeight: '100dvh', padding: '1.5rem 1rem 3rem' }}
    >
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <button onClick={goBack} className="btn-ghost" style={{ padding: '0.5rem 0.75rem' }}>
            <ChevronLeft size={16} /> {step === 0 ? 'Kembali' : 'Sebelumnya'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1rem', fontWeight: 700, color: '#2A1810',
              }}
            >
              Weekly Ritual ✨
            </div>
          </div>
          <div style={{ width: 80 }} />
        </motion.div>

        {/* Progress */}
        <StepDots current={step} total={TOTAL_STEPS} />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={PAGE_IN}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={PAGE_OUT}
            transition={SPRING}
          >
            {step === 0 && <Step1Overview onNext={goNext} />}
            {step === 1 && <Step2EmotionTranslation onNext={goNext} />}
            {step === 2 && <Step3Scoring onNext={goNext} />}
            {step === 3 && <Step4Wins onFinish={finish} />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
