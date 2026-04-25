'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from 'recharts'
import { useMockStore, simulateAIRefine, generateSelfSuggestion, type Commitment } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import { today, DIMENSION_LABELS, DIMENSIONS, habitCompletionThisWeek } from '@/lib/utils'
import { analytics } from '@/lib/analytics'
import {
  Sparkles, Wand2, Share2, CheckCircle2, Trophy, Heart, ArrowRight,
  ChevronLeft, TrendingUp, Star, Plus, Lightbulb, Target, Check, X,
  Users, User, Lock, Crown, BookOpen,
} from 'lucide-react'
import TemplateLibrary, { getWeeklyPrompts } from '@/components/TemplateLibrary'

// ── Shared spring ─────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

// ── Step indicator dots ───────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Weekly Overview + Review Komitmen + AI Self-Suggestion
// ═══════════════════════════════════════════════════════════════════════════════
function Step1Overview({ onNext }: { onNext: () => void }) {
  const { moodHistory, habits, emotionDumps, streak, partnerA, partnerB, commitments, toggleCommitment } =
    useMockStore(useShallow((s) => ({
      moodHistory:       s.moodHistory,
      habits:            s.habits,
      emotionDumps:      s.emotionDumps,
      streak:            s.streak,
      partnerA:          s.partnerA,
      partnerB:          s.partnerB,
      commitments:       s.commitments,
      toggleCommitment:  s.toggleCommitment,
    })))

  // 7-day window
  const weekDates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    weekDates.push(d.toISOString().split('T')[0])
  }
  const DAY_SHORT = ['M', 'S', 'S', 'R', 'K', 'J', 'S']

  function weekMoods(partner: 'A' | 'B') {
    return weekDates.map((date) =>
      moodHistory.filter((m) => m.date === date && m.partner === partner).at(-1)
    )
  }
  const moodsA = weekMoods('A')
  const moodsB = weekMoods('B')

  // Habit completion
  const habitsA = habits.filter((h) => h.partner === 'A')
  const habitsB = habits.filter((h) => h.partner === 'B')
  const avgA = habitsA.length ? Math.round(habitsA.reduce((s, h) => s + habitCompletionThisWeek(h.completedDays), 0) / habitsA.length) : 0
  const avgB = habitsB.length ? Math.round(habitsB.reduce((s, h) => s + habitCompletionThisWeek(h.completedDays), 0) / habitsB.length) : 0

  // Pending emotion dumps
  const pendingDumps = emotionDumps.filter((e) => !e.shared && !e.refinedText)

  // Commitments dari minggu lalu
  const prevCommitments = commitments.filter((c) => c.week === 'W-prev')
  const donePrev  = prevCommitments.filter((c) => c.done).length
  const totalPrev = prevCommitments.length

  // AI Self-Suggestion
  const suggestionA = generateSelfSuggestion(moodHistory, 'A')
  const suggestionB = generateSelfSuggestion(moodHistory, 'B')

  const [showSuggestionA, setShowSuggestionA] = useState(false)
  const [showSuggestionB, setShowSuggestionB] = useState(false)
  const [showTemplateLib, setShowTemplateLib] = useState(false)

  useEffect(() => {
    if (suggestionA) setTimeout(() => setShowSuggestionA(true), 600)
    if (suggestionB) setTimeout(() => setShowSuggestionB(true), 900)
  }, [])

  function getName(p: 'A' | 'B') {
    return (p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.5rem)', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          Review Minggu Ini 📅
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Data harianmu minggu ini + review komitmen yang kalian buat sebelumnya.
        </p>
      </div>

      {/* ── Streak recap ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(232,132,106,0.1),rgba(244,160,160,0.08))',
        border: '1px solid rgba(232,132,106,0.2)',
        borderRadius: '1rem', padding: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '0.125rem' }}>Streak Bersama</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,5vw,2rem)', fontWeight: 700, color: '#E8846A' }}>{streak}</span>
            <span style={{ fontSize: '0.8rem', color: '#C4A090' }}>hari (buffer 1 hari aktif)</span>
          </div>
        </div>
        <span style={{ fontSize: '2.5rem' }}>🔥</span>
      </div>

      {/* ── Mood sparklines — kedua partner ──────────────── */}
      <div className="card" style={{ padding: '1.25rem', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <TrendingUp size={14} color="#E8846A" /> Mood Minggu Ini
        </h4>
        {([['A', getName('A'), '#E8846A', moodsA], ['B', getName('B'), '#7BAE7F', moodsB]] as const).map(([p, name, color, moods]) => (
          <div key={p}>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61', marginBottom: '0.375rem', fontWeight: 600 }}>{name}</div>
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

      {/* ── Habit completion ─────────────────────────────── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <CheckCircle2 size={14} color="#7BAE7F" /> Habit Completion Minggu Ini
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {([['A', getName('A'), '#E8846A', avgA], ['B', getName('B'), '#7BAE7F', avgB]] as const).map(([p, name, color, pct]) => (
            <div key={p}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#5A3E37', fontWeight: 500 }}>{name}</span>
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

      {/* ── Pending emotion dumps notice ─────────────────── */}
      {pendingDumps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(244,160,160,0.10)',
            border: '1px solid rgba(244,160,160,0.25)',
            borderRadius: '1rem', padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>💌</span>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#C07070' }}>
              {pendingDumps.length} emotion dump menunggu di-refine
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61' }}>
              AI akan bantu haluskan di step berikutnya
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Review Komitmen Minggu Lalu ───────────────────── */}
      {prevCommitments.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Target size={14} color="#E8846A" /> Review Komitmen Lalu
            </h4>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700,
              color: donePrev === totalPrev ? '#3D7A43' : '#C4A090',
              background: donePrev === totalPrev ? 'rgba(123,174,127,0.12)' : 'rgba(237,213,200,0.5)',
              borderRadius: '2rem', padding: '0.2rem 0.625rem',
            }}>
              {donePrev}/{totalPrev} done
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {prevCommitments.map((c) => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCommitment(c.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  background: c.done ? 'rgba(123,174,127,0.08)' : '#FFF8F5',
                  border: `1.5px solid ${c.done ? 'rgba(123,174,127,0.25)' : '#EDD5C8'}`,
                  borderRadius: '0.875rem', padding: '0.75rem 1rem',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <motion.div
                  animate={{ scale: c.done ? 1 : 0.9 }}
                  style={{ marginTop: 1, flexShrink: 0 }}
                >
                  {c.done
                    ? <CheckCircle2 size={16} color="#7BAE7F" />
                    : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #C4A090' }} />
                  }
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.8125rem', fontWeight: 500,
                    color: c.done ? '#8B6B61' : '#2A1810',
                    textDecoration: c.done ? 'line-through' : 'none',
                    lineHeight: 1.5,
                  }}>
                    {c.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    {c.partner === 'both'
                      ? <><Users size={10} color="#C4A090" /><span style={{ fontSize: '0.7rem', color: '#C4A090' }}>Berdua</span></>
                      : <><User size={10} color="#C4A090" /><span style={{ fontSize: '0.7rem', color: '#C4A090' }}>{getName(c.partner as 'A' | 'B')}</span></>
                    }
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {donePrev < totalPrev && (
            <p style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.625rem', lineHeight: 1.5 }}>
              💬 Ada {totalPrev - donePrev} komitmen yang belum selesai — diskusikan bersama, bukan untuk judgement, tapi akuntabilitas gentle.
            </p>
          )}
          {donePrev === totalPrev && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '0.625rem', fontSize: '0.8125rem', color: '#3D7A43', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Sparkles size={13} /> Semua komitmen minggu lalu terpenuhi! Luar biasa 🎉
            </motion.div>
          )}
        </div>
      )}

      {/* ── AI Self-Suggestion ───────────────────────────── */}
      <AnimatePresence>
        {(showSuggestionA || showSuggestionB) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card"
            style={{ padding: '1.25rem' }}
          >
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lightbulb size={14} color="#E8846A" /> AI Self-Insight
              <span style={{ fontSize: '0.7rem', color: '#C4A090', fontWeight: 400 }}>— berdasarkan pola mood minggu ini</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {showSuggestionA && suggestionA && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: 'rgba(232,132,106,0.06)',
                    border: '1px solid rgba(232,132,106,0.2)',
                    borderRadius: '0.875rem', padding: '0.875rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E8846A', marginBottom: '0.375rem' }}>
                    Untuk {getName('A')}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.6 }}>{suggestionA}</p>
                </motion.div>
              )}
              {showSuggestionB && suggestionB && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: 'rgba(123,174,127,0.06)',
                    border: '1px solid rgba(123,174,127,0.2)',
                    borderRadius: '0.875rem', padding: '0.875rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3D7A43', marginBottom: '0.375rem' }}>
                    Untuk {getName('B')}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.6 }}>{suggestionB}</p>
                </motion.div>
              )}
              <p style={{ fontSize: '0.7rem', color: '#C4A090', fontStyle: 'italic' }}>
                ✦ Ini saran untuk diri sendiri, bukan penilaian tentang pasangan. Positive framing only.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rotating Weekly Prompts (PRD §10) ───────────── */}
      {(() => {
        const prompts = getWeeklyPrompts('medium', 3)
        return (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Star size={14} color="#E8846A" fill="#E8846A" /> Prompt Diskusi Minggu Ini
              <span style={{ fontSize: '0.7rem', color: '#C4A090', fontWeight: 400 }}>— bergilir tiap minggu</span>
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '0.875rem', lineHeight: 1.5 }}>
              Pilih 1-2 prompt ini sebagai pembuka diskusi kalian berdua. Tidak perlu semua dijawab.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {prompts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: i * 0.08 }}
                  style={{
                    background: 'rgba(232,132,106,0.05)',
                    border: '1px solid rgba(232,132,106,0.18)',
                    borderRadius: '0.875rem',
                    padding: '0.75rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E8846A', background: 'rgba(232,132,106,0.1)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                      {p.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.6, margin: 0 }}>{p.prompt}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ── Template Library hint ────────────────────────── */}
      <button
        onClick={() => {
          analytics.templateLibraryOpened('Semua')
          setShowTemplateLib(true)
        }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          width: '100%', padding: '0.75rem',
          background: 'rgba(232,132,106,0.06)',
          border: '1.5px dashed rgba(232,132,106,0.35)',
          borderRadius: '0.875rem',
          color: '#E8846A', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
      >
        <BookOpen size={15} />
        Template Library — 32 prompt siap pakai untuk conversation bermakna
      </button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}
      >
        Lanjut ke Emotion Translation <ArrowRight size={16} />
      </motion.button>

      {/* Template Library drawer */}
      <TemplateLibrary
        isOpen={showTemplateLib}
        onClose={() => setShowTemplateLib(false)}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — AI Emotion Translation (Privacy: raw tetap private, partner hanya
//          menerima versi refined setelah user approve)
// ═══════════════════════════════════════════════════════════════════════════════
function Step2EmotionTranslation({ onNext }: { onNext: () => void }) {
  const { emotionDumps, setRefinedText, shareEmotionDump, partnerA, partnerB } = useMockStore(useShallow((s) => ({
    emotionDumps:     s.emotionDumps,
    setRefinedText:   s.setRefinedText,
    shareEmotionDump: s.shareEmotionDump,
    partnerA:         s.partnerA,
    partnerB:         s.partnerB,
  })))
  const [newRaw, setNewRaw]   = useState('')
  const [newPart, setNewPart] = useState<'A' | 'B'>('A')
  const addEmotionDump        = useMockStore((s) => s.addEmotionDump)

  const pendingDumps = emotionDumps.filter((e) => !e.shared)
  const [refiningId, setRefiningId]           = useState<string | null>(null)
  const [showTemplateLib2, setShowTemplateLib2] = useState(false)

  function getName(p: 'A' | 'B') {
    return (p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`
  }

  async function handleRefine(id: string, rawText: string) {
    setRefiningId(id)
    await new Promise((r) => setTimeout(r, 1800))
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
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.5rem)', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          AI Emotion Translation 💌
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Emosi mentah diubah jadi bahasa yang clear, jujur, dan non-accusatory. Kamu review dulu sebelum share ke pasangan.
        </p>
      </div>

      {/* Privacy notice */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(232,132,106,0.06),rgba(244,160,160,0.06))',
        border: '1px solid rgba(232,132,106,0.15)',
        borderRadius: '1rem', padding: '0.875rem 1rem',
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      }}>
        <Wand2 size={16} color="#E8846A" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: '#8B6B61', lineHeight: 1.5 }}>
          AI menjaga tone: <em>honest but kind, specific but not blaming.</em> Raw version <strong>hanya terlihat olehmu</strong>. Partner hanya menerima versi yang sudah di-refine dan kamu approve.
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
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: dump.partner === 'A' ? 'rgba(232,132,106,0.15)' : 'rgba(123,174,127,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    color: dump.partner === 'A' ? '#E8846A' : '#7BAE7F',
                  }}>
                    {getName(dump.partner).charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1810' }}>
                    {getName(dump.partner)}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#C4A090' }}>{dump.date}</span>
              </div>

              {/* Raw text — private label */}
              <div style={{
                background: '#FFF8F5', border: '1px solid #EDD5C8',
                borderRadius: '0.75rem', padding: '0.875rem',
                fontSize: '0.875rem', color: '#5A3E37', lineHeight: 1.6,
                fontStyle: 'italic',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4A090' }} />
                  <span style={{ fontSize: '0.7rem', color: '#C4A090', letterSpacing: '0.05em' }}>RAW — hanya kamu yang bisa lihat ini</span>
                </div>
                &ldquo;{dump.rawText}&rdquo;
              </div>

              {/* Refine / result */}
              {!dump.refinedText ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRefine(dump.id, dump.rawText)}
                  disabled={refiningId === dump.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: refiningId === dump.id ? 'rgba(232,132,106,0.1)' : 'linear-gradient(135deg,#E8846A,#D4705A)',
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
                    <><Wand2 size={15} /> Refine with AI</>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  {/* Refined result */}
                  <div style={{
                    background: 'linear-gradient(135deg,rgba(123,174,127,0.08),rgba(181,212,181,0.08))',
                    border: '1px solid rgba(123,174,127,0.25)',
                    borderRadius: '0.75rem', padding: '0.875rem',
                    fontSize: '0.875rem', color: '#2A1810', lineHeight: 1.7,
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#5A9660', marginBottom: '0.375rem', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={11} /> AI REFINED — siap untuk di-review
                    </div>
                    {dump.refinedText}
                  </div>

                  {/* Review-before-share: approve atau cancel */}
                  {!dump.shared ? (
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => shareEmotionDump(dump.id)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          background: 'rgba(123,174,127,0.12)',
                          border: '1.5px solid rgba(123,174,127,0.3)',
                          borderRadius: '0.75rem', padding: '0.625rem',
                          color: '#3D7A43', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        }}
                      >
                        <Share2 size={14} /> Kirim ke {getName(dump.partner === 'A' ? 'B' : 'A')}
                      </motion.button>
                    </div>
                  ) : (
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

      {/* Add new dump */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.875rem' }}>
          + Tambah Emotion Dump Baru
        </h4>
        <form onSubmit={handleAddNew} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['A', 'B'] as const).map((p) => (
              <button
                key={p} type="button" onClick={() => setNewPart(p)}
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
          <div style={{ position: 'relative' }}>
            <textarea
              className="input-warm"
              placeholder="Tulis perasaan mentah... (akan tetap private sampai kamu approve)"
              value={newRaw}
              onChange={(e) => setNewRaw(e.target.value)}
              rows={3}
              style={{ resize: 'none', paddingBottom: '2.25rem' }}
            />
            <button
              type="button"
              onClick={() => {
                analytics.templateLibraryOpened('Semua')
                setShowTemplateLib2(true)
              }}
              style={{
                position: 'absolute', bottom: '0.5rem', right: '0.625rem',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(232,132,106,0.1)', border: '1px solid rgba(232,132,106,0.25)',
                borderRadius: '0.5rem', padding: '0.25rem 0.625rem',
                fontSize: '0.72rem', color: '#E8846A', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <BookOpen size={11} /> Pakai Template
            </button>
          </div>
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

      {/* Template Library drawer */}
      <TemplateLibrary
        isOpen={showTemplateLib2}
        onClose={() => setShowTemplateLib2(false)}
        onUse={(prompt) => setNewRaw(prompt)}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3 — 360° Scoring
// PRD: each partner scores self-perception + perceived-partner
// Gap = self score vs partner's actual self score (reveals blind spots)
// ═══════════════════════════════════════════════════════════════════════════════
function ScoreSlider({ label, value, onChange, color = '#E8846A' }: {
  label: string; value: number; onChange: (v: number) => void; color?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#5A3E37' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}/10</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: color, height: 4 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#C4A090' }}>
        <span>Perlu Kerja Keras</span><span>Luar Biasa</span>
      </div>
    </div>
  )
}

const DEFAULT_SCORES = { communication: 7, intimacy: 7, support: 7, fun: 7, effort: 7 }

type ScoreSet = typeof DEFAULT_SCORES

function Step3Scoring({ onNext }: { onNext: () => void }) {
  const { scores, upsertScore, partnerA, partnerB } = useMockStore(useShallow((s) => ({
    scores: s.scores, upsertScore: s.upsertScore,
    partnerA: s.partnerA, partnerB: s.partnerB,
  })))

  const WEEK = 'W-current'
  const existingA = scores.find((s) => s.week === WEEK && s.partner === 'A')
  const existingB = scores.find((s) => s.week === WEEK && s.partner === 'B')

  // self = how A/B rates the relationship themselves
  const [selfA, setSelfA]         = useState<ScoreSet>(existingA?.self      ?? { ...DEFAULT_SCORES })
  const [selfB, setSelfB]         = useState<ScoreSet>(existingB?.self      ?? { ...DEFAULT_SCORES })
  // perceived = A's guess of what B self-scores (and vice versa)
  const [perceivedA, setPerceivedA] = useState<ScoreSet>(existingA?.perceived ?? { ...DEFAULT_SCORES })
  const [perceivedB, setPerceivedB] = useState<ScoreSet>(existingB?.perceived ?? { ...DEFAULT_SCORES })

  const [activeTabA, setActiveTabA] = useState<'self' | 'perceived'>('self')
  const [activeTabB, setActiveTabB] = useState<'self' | 'perceived'>('self')
  const [saved, setSaved] = useState(false)

  function getName(p: 'A' | 'B') {
    return (p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`
  }

  function handleSave() {
    upsertScore({ week: WEEK, partner: 'A', self: selfA, perceived: perceivedA })
    upsertScore({ week: WEEK, partner: 'B', self: selfB, perceived: perceivedB })
    setSaved(true)
  }

  // Radar data: compare both self-scores
  const radarData = DIMENSIONS.map((dim) => ({
    dimension: DIMENSION_LABELS[dim],
    [getName('A')]: selfA[dim],
    [getName('B')]: selfB[dim],
  }))

  // Gap analysis (PRD: self vs partner's guess of self = perception accuracy)
  // A.self vs B.perceived[A] → seberapa akurat B menebak perasaan A
  // B.self vs A.perceived[B] → seberapa akurat A menebak perasaan B
  const gapRows = DIMENSIONS.map((dim) => {
    const gapA = selfA[dim] - perceivedB[dim]  // positive = B underestimates A
    const gapB = selfB[dim] - perceivedA[dim]  // positive = A underestimates B
    return { dim, gapA, gapB, absA: Math.abs(gapA), absB: Math.abs(gapB) }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.5rem)', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          360° Scoring 🎯
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Masing-masing kasih 2 skor: penilaian diri sendiri + tebakan tentang pasangan. Gap-nya = insight berharga tentang seberapa dalam kalian saling mengenal.
        </p>
      </div>

      {/* Radar: self scores comparison */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '1rem' }}>
          📊 Perbandingan Self-Score Kalian
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(237,213,200,0.7)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: '#8B6B61', fontFamily: 'var(--font-dm-sans)' }}
            />
            <Radar
              name={getName('A')}
              dataKey={getName('A')}
              stroke="#E8846A" fill="#E8846A" fillOpacity={0.18} strokeWidth={2}
            />
            <Radar
              name={getName('B')}
              dataKey={getName('B')}
              stroke="#7BAE7F" fill="#7BAE7F" fillOpacity={0.18} strokeWidth={2}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
            <Tooltip contentStyle={{ background: 'white', border: '1px solid #EDD5C8', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders: Partner A */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E8846A' }} />
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2A1810' }}>{getName('A')}</h4>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.375rem', background: '#FFF8F5', borderRadius: '0.75rem', padding: '0.25rem' }}>
          {(['self', 'perceived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTabA(tab)}
              style={{
                flex: 1, padding: '0.5rem 0.25rem',
                background: activeTabA === tab ? 'white' : 'transparent',
                border: 'none', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: activeTabA === tab ? 700 : 500,
                color: activeTabA === tab ? '#E8846A' : '#8B6B61',
                cursor: 'pointer',
                boxShadow: activeTabA === tab ? '0 1px 4px rgba(200,130,100,0.15)' : 'none',
              }}
            >
              {tab === 'self' ? '🙋 Penilaian Diri' : `🔍 Tebakanmu ttg ${getName('B')}`}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabA}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {activeTabA === 'self' ? (
              <>
                <p style={{ fontSize: '0.75rem', color: '#C4A090', fontStyle: 'italic' }}>
                  &ldquo;Saya rasa hubungan kita di dimensi ini berapa?&rdquo;
                </p>
                {DIMENSIONS.map((dim) => (
                  <ScoreSlider key={dim} label={DIMENSION_LABELS[dim]} value={selfA[dim]}
                    onChange={(v) => setSelfA((prev) => ({ ...prev, [dim]: v }))} color="#E8846A" />
                ))}
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.75rem', color: '#C4A090', fontStyle: 'italic' }}>
                  &ldquo;Saya pikir {getName('B')} ngerasa dimensi ini berapa?&rdquo;
                </p>
                {DIMENSIONS.map((dim) => (
                  <ScoreSlider key={dim} label={DIMENSION_LABELS[dim]} value={perceivedA[dim]}
                    onChange={(v) => setPerceivedA((prev) => ({ ...prev, [dim]: v }))} color="#C4A090" />
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sliders: Partner B */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7BAE7F' }} />
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2A1810' }}>{getName('B')}</h4>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', background: '#FFF8F5', borderRadius: '0.75rem', padding: '0.25rem' }}>
          {(['self', 'perceived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTabB(tab)}
              style={{
                flex: 1, padding: '0.5rem 0.25rem',
                background: activeTabB === tab ? 'white' : 'transparent',
                border: 'none', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: activeTabB === tab ? 700 : 500,
                color: activeTabB === tab ? '#7BAE7F' : '#8B6B61',
                cursor: 'pointer',
                boxShadow: activeTabB === tab ? '0 1px 4px rgba(90,150,96,0.15)' : 'none',
              }}
            >
              {tab === 'self' ? '🙋 Penilaian Diri' : `🔍 Tebakanmu ttg ${getName('A')}`}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabB}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {activeTabB === 'self' ? (
              <>
                <p style={{ fontSize: '0.75rem', color: '#C4A090', fontStyle: 'italic' }}>
                  &ldquo;Saya rasa hubungan kita di dimensi ini berapa?&rdquo;
                </p>
                {DIMENSIONS.map((dim) => (
                  <ScoreSlider key={dim} label={DIMENSION_LABELS[dim]} value={selfB[dim]}
                    onChange={(v) => setSelfB((prev) => ({ ...prev, [dim]: v }))} color="#7BAE7F" />
                ))}
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.75rem', color: '#C4A090', fontStyle: 'italic' }}>
                  &ldquo;Saya pikir {getName('A')} ngerasa dimensi ini berapa?&rdquo;
                </p>
                {DIMENSIONS.map((dim) => (
                  <ScoreSlider key={dim} label={DIMENSION_LABELS[dim]} value={perceivedB[dim]}
                    onChange={(v) => setPerceivedB((prev) => ({ ...prev, [dim]: v }))} color="#C4A090" />
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gap Analysis — seberapa akurat kalian saling menebak */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Sparkles size={13} color="#E8846A" /> Gap Analysis — Seberapa Dalam Kalian Saling Mengenal?
        </h4>
        <p style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '1rem', lineHeight: 1.5 }}>
          Bar menunjukkan <strong>besar gap</strong> antara skor diri sendiri vs tebakan pasangan. Hijau = akurat, Merah = perlu diskusi.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {gapRows.map(({ dim, gapA, gapB, absA, absB }) => {
            // bar width = gap magnitude out of max 9 (1-10 scale), capped at 100%
            const barPctA = Math.min(100, (absA / 9) * 100)
            const barPctB = Math.min(100, (absB / 9) * 100)
            const colorA  = absA === 0 ? '#7BAE7F' : absA <= 2 ? '#A8C8A8' : absA <= 4 ? '#E8A86A' : '#F4A0A0'
            const colorB  = absB === 0 ? '#7BAE7F' : absB <= 2 ? '#A8C8A8' : absB <= 4 ? '#E8A86A' : '#F4A0A0'
            const labelA  = absA === 0 ? '✓ Tepat' : gapA > 0 ? `+${gapA} (under)` : `${gapA} (over)`
            const labelB  = absB === 0 ? '✓ Tepat' : gapB > 0 ? `+${gapB} (under)` : `${gapB} (over)`
            return (
              <div key={dim}>
                <div style={{ fontSize: '0.8rem', color: '#2A1810', fontWeight: 600, marginBottom: '0.375rem' }}>
                  {DIMENSION_LABELS[dim]}
                </div>
                {/* Row A */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: 48, fontSize: '0.7rem', color: '#E8846A', fontWeight: 700, flexShrink: 0 }}>{getName('A')}</div>
                  <div style={{ flex: 1, height: 8, background: '#EDD5C8', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: barPctA === 0 ? '4%' : `${barPctA}%` }}
                      transition={{ ...SPRING, delay: 0.1 }}
                      style={{ height: '100%', background: colorA, borderRadius: 4 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colorA === '#7BAE7F' || colorA === '#A8C8A8' ? '#3D7A43' : colorA === '#E8A86A' ? '#B86A20' : '#C07070', width: 72, textAlign: 'right', flexShrink: 0 }}>
                    {labelA}
                  </span>
                </div>
                {/* Row B */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 48, fontSize: '0.7rem', color: '#7BAE7F', fontWeight: 700, flexShrink: 0 }}>{getName('B')}</div>
                  <div style={{ flex: 1, height: 8, background: '#EDD5C8', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: barPctB === 0 ? '4%' : `${barPctB}%` }}
                      transition={{ ...SPRING, delay: 0.15 }}
                      style={{ height: '100%', background: colorB, borderRadius: 4 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colorB === '#7BAE7F' || colorB === '#A8C8A8' ? '#3D7A43' : colorB === '#E8A86A' ? '#B86A20' : '#C07070', width: 72, textAlign: 'right', flexShrink: 0 }}>
                    {labelB}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid #EDD5C8' }}>
          {[
            { color: '#7BAE7F',  label: 'Tepat' },
            { color: '#A8C8A8',  label: 'Gap ±1–2 (cukup akurat)' },
            { color: '#E8A86A',  label: 'Gap ±3–4 (worth dicek)' },
            { color: '#F4A0A0',  label: 'Gap ±5+ (diskusi penting!)' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: '0.68rem', color: '#8B6B61' }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: '#C4A090', marginTop: '0.5rem', lineHeight: 1.5 }}>
          <em>under = pasangan underestimate perasaanmu · over = pasangan overestimate</em>
        </p>
      </div>

      {/* Save + Next */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {!saved ? (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
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
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}
        >
          Lanjut ke Wins & Penutup <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Wins Celebration + Set Komitmen Minggu Depan
// PRD: Celebrate wins, set focus/commitments for next week, close ritual
// ═══════════════════════════════════════════════════════════════════════════════
function Step4Wins({ onFinish }: { onFinish: () => void }) {
  const { wins, addWin, addCommitment, partnerA, partnerB, streak,
    incrementWeeklyRitualsCompleted, isPremium,
  } = useMockStore(useShallow((s) => ({
    wins:          s.wins,
    addWin:        s.addWin,
    addCommitment: s.addCommitment,
    partnerA:      s.partnerA,
    partnerB:      s.partnerB,
    streak:        s.streak,
    incrementWeeklyRitualsCompleted: s.incrementWeeklyRitualsCompleted,
    isPremium:     s.isPremium,
  })))

  const [winText, setWinText]       = useState('')
  const [winType, setWinType]       = useState<'relationship' | 'individual'>('relationship')
  const [winPartner, setWinPartner] = useState<'A' | 'B'>('A')
  const [showWinForm, setShowWinForm] = useState(false)

  const [commitText, setCommitText]       = useState('')
  const [commitPartner, setCommitPartner] = useState<Commitment['partner']>('both')
  const [commitBy, setCommitBy]           = useState<'A' | 'B'>('A')
  const [showCommitForm, setShowCommitForm] = useState(false)
  const [newCommitments, setNewCommitments] = useState<{ text: string; partner: Commitment['partner'] }[]>([])
  const [showValueWall, setShowValueWall]   = useState(false)

  function getName(p: 'A' | 'B') {
    return (p === 'A' ? partnerA.name : partnerB.name) || `Partner ${p}`
  }

  function handleAddWin(e: React.FormEvent) {
    e.preventDefault()
    if (!winText.trim()) return
    addWin(winText.trim(), winType, winPartner)
    setWinText(''); setShowWinForm(false)
  }

  function handleAddCommit(e: React.FormEvent) {
    e.preventDefault()
    if (!commitText.trim()) return
    setNewCommitments((prev) => [...prev, { text: commitText.trim(), partner: commitPartner }])
    setCommitText(''); setShowCommitForm(false)
  }

  function handleFinish() {
    // Persist semua komitmen baru ke store
    newCommitments.forEach((c) => {
      addCommitment(c.text, c.partner, commitBy, 'W-current')
    })
    incrementWeeklyRitualsCompleted()
    analytics.weeklyRitualCompleted(1) // actual counter from store not needed here
    if (!isPremium) {
      // Show value wall before going to dashboard
      analytics.valueWallSeen()
      setShowValueWall(true)
    } else {
      onFinish()
    }
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
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.5rem)', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
          Celebrate Wins! ✨
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.6 }}>
          Acknowledge apa yang sudah bagus — hubungan dan personal growth. Lalu set fokus untuk minggu depan.
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
                  background: 'rgba(232,132,106,0.06)', border: '1px solid rgba(232,132,106,0.15)',
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
            <p style={{ color: '#C4A090', fontSize: '0.8125rem', padding: '0.25rem' }}>Belum ada. Tambahkan satu!</p>
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
                  background: 'rgba(123,174,127,0.06)', border: '1px solid rgba(123,174,127,0.15)',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem',
                  fontSize: '0.875rem', color: '#2A1810',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Star size={14} color="#7BAE7F" fill="#7BAE7F" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{win.text}</span>
                </div>
                <span style={{
                  fontSize: '0.7rem', color: win.partner === 'A' ? '#E8846A' : '#7BAE7F',
                  background: win.partner === 'A' ? 'rgba(232,132,106,0.1)' : 'rgba(123,174,127,0.1)',
                  borderRadius: '2rem', padding: '0.125rem 0.5rem', flexShrink: 0, fontWeight: 600,
                }}>
                  {getName(win.partner)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {indWins.length === 0 && (
            <p style={{ color: '#C4A090', fontSize: '0.8125rem', padding: '0.25rem' }}>Belum ada. Rayakan pencapaianmu!</p>
          )}
        </div>
      </div>

      {/* Add win form */}
      <div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowWinForm((v) => !v)}
          style={{
            background: showWinForm ? 'rgba(237,213,200,0.6)' : 'rgba(232,132,106,0.1)',
            border: `1.5px dashed ${showWinForm ? '#C4A090' : 'rgba(232,132,106,0.35)'}`,
            borderRadius: '1rem', padding: '0.75rem',
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            color: showWinForm ? '#8B6B61' : '#E8846A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          {showWinForm ? 'Batal' : 'Tambah Win Baru'}
        </motion.button>
        <AnimatePresence>
          {showWinForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddWin}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['relationship', 'individual'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setWinType(t)} style={{
                    flex: 1, padding: '0.5rem',
                    background: winType === t ? (t === 'relationship' ? 'rgba(232,132,106,0.1)' : 'rgba(123,174,127,0.1)') : '#FFF8F5',
                    border: `1.5px solid ${winType === t ? (t === 'relationship' ? 'rgba(232,132,106,0.4)' : 'rgba(123,174,127,0.4)') : '#EDD5C8'}`,
                    borderRadius: '0.625rem', fontSize: '0.8rem',
                    color: winType === t ? (t === 'relationship' ? '#E8846A' : '#3D7A43') : '#8B6B61',
                    cursor: 'pointer', fontWeight: winType === t ? 700 : 500,
                  }}>
                    {t === 'relationship' ? '❤️ Berdua' : '⭐ Personal'}
                  </button>
                ))}
              </div>
              {winType === 'individual' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['A', 'B'] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setWinPartner(p)} style={{
                      flex: 1, padding: '0.375rem',
                      background: winPartner === p ? (p === 'A' ? 'rgba(232,132,106,0.1)' : 'rgba(123,174,127,0.1)') : 'transparent',
                      border: `1px solid ${winPartner === p ? (p === 'A' ? 'rgba(232,132,106,0.35)' : 'rgba(123,174,127,0.35)') : '#EDD5C8'}`,
                      borderRadius: '0.5rem', fontSize: '0.75rem',
                      color: winPartner === p ? (p === 'A' ? '#E8846A' : '#3D7A43') : '#8B6B61',
                      cursor: 'pointer', fontWeight: winPartner === p ? 600 : 400,
                    }}>
                      {getName(p)}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                className="input-warm"
                placeholder="Ceritakan pencapaiannya..."
                value={winText}
                onChange={(e) => setWinText(e.target.value)}
                rows={2} style={{ resize: 'none' }} autoFocus
              />
              <button type="submit" className="btn-primary" disabled={!winText.trim()} style={{ justifyContent: 'center', padding: '0.625rem' }}>
                Tambahkan Win 🎉
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* ── Set Komitmen untuk Minggu Depan ─────────────────── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Target size={14} color="#7BAE7F" /> Fokus Minggu Depan
        </h4>
        <p style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '0.875rem', lineHeight: 1.5 }}>
          Set 1-3 komitmen kecil yang realistis. Akan di-review di ritual berikutnya.
        </p>

        {/* List komitmen baru */}
        {newCommitments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AnimatePresence>
              {newCommitments.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    background: 'rgba(123,174,127,0.06)', border: '1px solid rgba(123,174,127,0.2)',
                    borderRadius: '0.75rem', padding: '0.625rem 0.875rem',
                  }}
                >
                  <Check size={14} color="#7BAE7F" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', color: '#2A1810', lineHeight: 1.4 }}>{c.text}</p>
                    <span style={{ fontSize: '0.7rem', color: '#C4A090' }}>
                      {c.partner === 'both' ? '👥 Berdua' : `👤 ${getName(c.partner as 'A' | 'B')}`}
                    </span>
                  </div>
                  <button
                    onClick={() => setNewCommitments((prev) => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.5 }}
                  >
                    <X size={12} color="#8B6B61" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add commit button */}
        {!showCommitForm ? (
          <button
            onClick={() => setShowCommitForm(true)}
            style={{
              background: 'rgba(123,174,127,0.08)',
              border: '1.5px dashed rgba(123,174,127,0.35)',
              borderRadius: '0.875rem', padding: '0.625rem',
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              color: '#3D7A43', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Tambah Komitmen
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddCommit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
          >
            <textarea
              className="input-warm"
              placeholder='Contoh: "Date night tanpa HP tiap Jumat"'
              value={commitText}
              onChange={(e) => setCommitText(e.target.value)}
              rows={2} style={{ resize: 'none' }} autoFocus
            />
            {/* Partner selector */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {(['both', 'A', 'B'] as const).map((p) => (
                <button key={p} type="button" onClick={() => setCommitPartner(p)}
                  style={{
                    flex: 1, padding: '0.375rem 0.25rem',
                    background: commitPartner === p ? 'rgba(123,174,127,0.12)' : 'transparent',
                    border: `1px solid ${commitPartner === p ? 'rgba(123,174,127,0.35)' : '#EDD5C8'}`,
                    borderRadius: '0.5rem', fontSize: '0.72rem',
                    color: commitPartner === p ? '#3D7A43' : '#8B6B61',
                    cursor: 'pointer', fontWeight: commitPartner === p ? 600 : 400,
                  }}
                >
                  {p === 'both' ? '👥 Berdua' : `👤 ${getName(p)}`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowCommitForm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>
                Batal
              </button>
              <button type="submit" className="btn-primary" disabled={!commitText.trim()} style={{ flex: 2, justifyContent: 'center', padding: '0.5rem' }}>
                Tambahkan
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Finish ritual */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleFinish}
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
          {newCommitments.length > 0
            ? `${newCommitments.length} komitmen tersimpan untuk minggu depan`
            : 'Sampai weekly ritual berikutnya'}
        </span>
      </motion.button>

      {/* ── Value Wall (post-ritual, non-premium) ──────────────── */}
      <AnimatePresence>
        {showValueWall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(42,24,16,0.6)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
              style={{
                width: '100%', maxWidth: 400,
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '2rem', padding: '2rem',
                boxShadow: '0 32px 80px rgba(42,24,16,0.25)',
                border: '1px solid rgba(237,213,200,0.6)',
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                style={{ fontSize: '3rem', marginBottom: '1rem' }}
              >
                🎉
              </motion.div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
                Ritual selesai! ✨
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#8B6B61', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                Kamu baru saja investasi waktu yang bermakna untuk hubunganmu.
              </p>

              {/* Summary stats */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {[
                  { val: wins.length, label: 'Wins' },
                  { val: newCommitments.length, label: 'Komitmen' },
                  { val: streak, label: 'Day streak' },
                ].map(({ val, label }) => (
                  <div key={label} style={{ background: 'rgba(255,245,238,0.8)', border: '1px solid rgba(237,213,200,0.6)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', textAlign: 'center', minWidth: 70 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E8846A' }}>{val}</div>
                    <div style={{ fontSize: '0.7rem', color: '#C4A090' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Locked insight teaser */}
              <div style={{
                background: 'rgba(107,159,212,0.06)', border: '1px dashed rgba(107,159,212,0.3)',
                borderRadius: '1rem', padding: '0.875rem', marginBottom: '1.25rem', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                  <Lock size={13} color="#6B9FD4" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B9FD4' }}>AI Insight Premium — Terkunci</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#8B6B61', lineHeight: 1.55, filter: 'blur(3px)', userSelect: 'none' }}>
                  Pola komunikasimu minggu ini menunjukkan peningkatan di dimensi Support (+1.2 dari minggu lalu). Gap antara A dan B paling besar ada di...
                </p>
              </div>

              <a
                href="/pricing"
                onClick={() => { analytics.upgradeCtaClicked('post_ritual_value_wall') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
                  color: 'white', border: 'none',
                  borderRadius: '1rem', padding: '0.875rem',
                  fontSize: '0.9375rem', fontWeight: 700,
                  textDecoration: 'none', marginBottom: '0.625rem',
                }}
              >
                <Crown size={16} />
                Unlock Insight — Trial 7 Hari Gratis
              </a>

              <button
                onClick={onFinish}
                style={{
                  width: '100%', background: 'none',
                  border: '1.5px solid rgba(237,213,200,0.8)',
                  borderRadius: '1rem', padding: '0.75rem',
                  fontSize: '0.875rem', color: '#8B6B61', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Lanjut ke Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE SHELL — Weekly Ritual
// ═══════════════════════════════════════════════════════════════════════════════
const TOTAL_STEPS = 4

// ── Freemium Gate Overlay ─────────────────────────────────────────────────────
const PREMIUM_PERKS = [
  { icon: Sparkles, text: 'AI Cooling Off — terjemahkan emosi tanpa drama' },
  { icon: Target,   text: '360° relationship scoring + gap analysis' },
  { icon: Trophy,   text: 'Weekly wins celebration & commitment tracker' },
  { icon: TrendingUp, text: 'Monthly recap dengan trend & milestone badges' },
]

function FreemiumGate({ onDemo }: { onDemo: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(42,24,16,0.55)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '2rem',
          padding: '2rem',
          boxShadow: '0 32px 80px rgba(42,24,16,0.25)',
          border: '1px solid rgba(237,213,200,0.6)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg,#FFF5E8,#FFE5C0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Crown size={28} color="#B8956A" />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.25rem,4vw,1.5rem)',
            fontWeight: 700,
            color: '#2A1810',
            marginBottom: '0.375rem',
          }}
        >
          Weekly Ritual — Premium
        </h2>
        <p style={{ color: '#8B6B61', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
          Ritual mingguan yang penuh adalah fitur premium. Investasi terbaik untuk hubunganmu.
        </p>

        {/* Perks list */}
        <div
          style={{
            background: 'rgba(255,245,238,0.6)',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {PREMIUM_PERKS.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '0.5rem',
                  background: 'rgba(232,132,106,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color="#E8846A" />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#5A3E38', lineHeight: 1.5, paddingTop: 4 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <motion.a
          href="/#harga"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
            color: 'white',
            border: 'none',
            borderRadius: '1rem',
            padding: '0.9375rem',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'none',
            marginBottom: '0.75rem',
          }}
        >
          <Crown size={16} />
          Upgrade ke Premium — Rp 49k/bln
        </motion.a>

        {/* Demo CTA */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDemo}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'transparent',
            color: '#8B6B61',
            border: '1.5px solid rgba(237,213,200,0.8)',
            borderRadius: '1rem',
            padding: '0.875rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Sparkles size={14} color="#C4A090" />
          Coba Demo Premium (testing)
        </motion.button>

        <p style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.875rem' }}>
          Demo mode aktif untuk evaluasi produk. Tidak ada commitment.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function WeeklyRitualPage() {
  const router = useRouter()
  const { partnerA, partnerB, activeWeeklyStep, setActiveWeeklyStep, isPremium, setPremium } = useMockStore(useShallow((s) => ({
    partnerA:            s.partnerA,
    partnerB:            s.partnerB,
    activeWeeklyStep:    s.activeWeeklyStep,
    setActiveWeeklyStep: s.setActiveWeeklyStep,
    isPremium:           s.isPremium,
    setPremium:          s.setPremium,
  })))

  const [step, setStep]     = useState(activeWeeklyStep)
  const [direction, setDir] = useState(1)

  useEffect(() => {
    if (!partnerA.joined || !partnerB.joined) router.replace('/onboarding')
  }, [])

  function goNext() {
    setDir(1)
    const next = Math.min(step + 1, TOTAL_STEPS - 1)
    setStep(next); setActiveWeeklyStep(next)
  }
  function goBack() {
    if (step === 0) { router.push('/dashboard'); return }
    setDir(-1)
    const prev = step - 1
    setStep(prev); setActiveWeeklyStep(prev)
  }
  function finish() {
    setActiveWeeklyStep(0)
    router.push('/dashboard')
  }

  if (!partnerA.joined || !partnerB.joined) return null

  const PAGE_IN  = { opacity: 0, x: direction > 0 ? 40 : -40, scale: 0.97 }
  const PAGE_OUT = { opacity: 0, x: direction > 0 ? -40 : 40,  scale: 0.97 }

  return (
    <div className="bg-spring" style={{ minHeight: '100dvh', padding: '1.5rem 1rem 6rem', position: 'relative' }}>
      {/* Freemium gate — renders on top if not premium */}
      {!isPremium && <FreemiumGate onDemo={() => setPremium(true)} />}
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
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', fontWeight: 700, color: '#2A1810' }}>
            Weekly Ritual ✨
          </div>
          <div style={{ width: 80 }} />
        </motion.div>

        {/* Progress dots */}
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
