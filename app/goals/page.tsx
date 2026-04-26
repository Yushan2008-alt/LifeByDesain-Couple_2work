'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMockStore, type Goal, type GoalCategory } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import { analytics } from '@/lib/analytics'
import {
  Target, Plus, Check, Trash2, ChevronDown, ChevronUp,
  Trophy, Flame, TrendingUp, X, Calendar, Users, User,
  ArrowRight, Sparkles, Lock, Crown,
} from 'lucide-react'

const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<GoalCategory, { label: string; emoji: string; color: string; bg: string }> = {
  travel:        { label: 'Perjalanan',     emoji: '✈️',  color: '#6B9FD4', bg: '#EBF4FF' },
  communication: { label: 'Komunikasi',     emoji: '💬',  color: '#E8846A', bg: '#FFF5EE' },
  intimacy:      { label: 'Kedekatan',      emoji: '💕',  color: '#F4A0A0', bg: '#FFF0F0' },
  finances:      { label: 'Keuangan',       emoji: '💰',  color: '#7BAE7F', bg: '#F0F7F0' },
  fun:           { label: 'Quality Time',   emoji: '🎉',  color: '#B8956A', bg: '#FFF5E8' },
  growth:        { label: 'Pertumbuhan',    emoji: '🌱',  color: '#5A9660', bg: '#F0FFF0' },
  health:        { label: 'Kesehatan',      emoji: '🏃',  color: '#7B9FD4', bg: '#EEF4FF' },
  family:        { label: 'Keluarga',       emoji: '🏡',  color: '#C4806A', bg: '#FFF0EA' },
}

const GOAL_EMOJIS = ['🗾','💰','💕','💬','🏃','🎯','🌱','✈️','🏡','🎉','📚','🍳','🎨','🧘','🚀','💪']
const PERIOD_LABELS: Record<Goal['period'], string> = { '6-month': '6 Bulan', 'yearly': '1 Tahun' }

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay }}>
      {children}
    </motion.div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = '#E8846A', height = 8 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ width: '100%', height, background: '#EDD5C8', borderRadius: height / 2, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ ...SPRING, delay: 0.2 }}
        style={{ height: '100%', background: pct >= 100 ? '#7BAE7F' : color, borderRadius: height / 2 }}
      />
    </div>
  )
}

// ── Single Goal Card ──────────────────────────────────────────────────────────
function GoalCard({ goal, partnerAName, partnerBName }: {
  goal: Goal
  partnerAName: string
  partnerBName: string
}) {
  const { addGoalCheckIn, completeGoal, deleteGoal } = useMockStore(
    useShallow((s) => ({
      addGoalCheckIn: s.addGoalCheckIn,
      completeGoal:   s.completeGoal,
      deleteGoal:     s.deleteGoal,
    }))
  )
  const [expanded, setExpanded]   = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [note, setNote]           = useState('')
  const [pct, setPct]             = useState(latestPct())

  function latestPct() {
    if (!goal.checkIns.length) return 0
    return goal.checkIns.at(-1)!.pct
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    addGoalCheckIn(goal.id, pct, note.trim())
    setNote('')
    setShowUpdate(false)
  }

  const cfg = CATEGORY_CONFIG[goal.category]
  const currentPct = latestPct()
  const ownerLabel = goal.partner === 'both'
    ? 'Berdua'
    : goal.partner === 'A' ? (partnerAName || 'Partner A') : (partnerBName || 'Partner B')

  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        border: goal.completed ? '1.5px solid rgba(123,174,127,0.4)' : '1px solid rgba(237,213,200,0.6)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(200,130,100,0.07)',
      }}
    >
      {/* Top strip */}
      <div style={{ height: 4, background: goal.completed ? '#7BAE7F' : cfg.color }} />

      {/* Main content */}
      <div style={{ padding: '1rem 1.125rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: '0.875rem', flexShrink: 0,
              background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.375rem',
            }}
          >
            {goal.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 700, fontSize: 'clamp(0.875rem,2.5vw,0.9375rem)', color: '#2A1810', lineHeight: 1.3 }}>
                {goal.title}
              </span>
              {goal.completed && (
                <span style={{ background: 'rgba(123,174,127,0.15)', color: '#3D7A43', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                  ✓ SELESAI
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', background: cfg.bg, color: cfg.color, padding: '0.1rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                {cfg.emoji} {cfg.label}
              </span>
              <span style={{ fontSize: '0.7rem', background: '#F5EBE0', color: '#8B6B61', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                {PERIOD_LABELS[goal.period]}
              </span>
              <span style={{ fontSize: '0.7rem', background: '#F5EBE0', color: '#8B6B61', padding: '0.1rem 0.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {goal.partner === 'both' ? <Users size={9} /> : <User size={9} />}
                {ownerLabel}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4A090', padding: '0.5rem', minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {!goal.completed && (
              <button
                onClick={() => deleteGoal(goal.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4A090', padding: '0.5rem', minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '0.625rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8B6B61', marginBottom: '0.375rem' }}>
            <span style={{ fontWeight: 600 }}>{currentPct}% selesai</span>
            <span style={{ color: daysLeft < 30 ? '#E8846A' : '#C4A090' }}>
              {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Jatuh tempo!'}
            </span>
          </div>
          <ProgressBar pct={currentPct} color={cfg.color} />
        </div>

        {/* Desc */}
        <p style={{ fontSize: '0.8125rem', color: '#8B6B61', lineHeight: 1.55, marginBottom: '0.75rem' }}>
          {goal.description}
        </p>

        {/* Actions */}
        {!goal.completed && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowUpdate((v) => !v)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                background: showUpdate ? 'rgba(232,132,106,0.12)' : '#FFF5EE',
                border: '1.5px solid rgba(232,132,106,0.3)',
                borderRadius: '0.75rem', padding: '0.5rem',
                color: '#E8846A', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <TrendingUp size={13} /> Update Progress
            </motion.button>
            {currentPct >= 90 && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => completeGoal(goal.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: 'rgba(123,174,127,0.12)', border: '1.5px solid rgba(123,174,127,0.35)',
                  borderRadius: '0.75rem', padding: '0.5rem 0.875rem',
                  color: '#3D7A43', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Trophy size={13} /> Selesai!
              </motion.button>
            )}
          </div>
        )}

        {/* Update form */}
        <AnimatePresence>
          {showUpdate && (
            <motion.form
              onSubmit={handleUpdate}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8B6B61' }}>
                  <span style={{ fontWeight: 600 }}>Progress sekarang</span>
                  <span style={{ fontWeight: 700, color: '#E8846A' }}>{pct}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={pct}
                  onChange={(e) => setPct(+e.target.value)}
                  style={{ width: '100%', accentColor: cfg.color }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input-warm"
                  placeholder="Catatan singkat tentang progress ini..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                />
                <button type="submit" disabled={!note.trim()} className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}>
                  Simpan
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded: check-in history */}
      <AnimatePresence>
        {expanded && goal.checkIns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden',
              borderTop: '1px solid rgba(237,213,200,0.5)',
              background: '#FFFBF5',
              padding: '0.875rem 1.125rem',
              display: 'flex', flexDirection: 'column', gap: '0.625rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#C4A090', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Riwayat Check-in
            </div>
            {[...goal.checkIns].reverse().map((ci) => (
              <div key={ci.id} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: cfg.color }}>
                  {ci.pct}%
                </div>
                <div>
                  <p style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.5 }}>{ci.note}</p>
                  <p style={{ fontSize: '0.7rem', color: '#C4A090' }}>{ci.date}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Add Goal Form (modal-style) ───────────────────────────────────────────────
function AddGoalModal({ onClose }: { onClose: () => void }) {
  const { partnerA, partnerB, addGoal } = useMockStore(
    useShallow((s) => ({ partnerA: s.partnerA, partnerB: s.partnerB, addGoal: s.addGoal }))
  )
  const [title, setTitle]         = useState('')
  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState<GoalCategory>('travel')
  const [period, setPeriod]       = useState<Goal['period']>('yearly')
  const [partner, setPartner]     = useState<Goal['partner']>('both')
  const [emoji, setEmoji]         = useState('🎯')

  // Calculate target date from period
  function getTargetDate() {
    const d = new Date()
    if (period === '6-month') d.setMonth(d.getMonth() + 6)
    else d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addGoal({
      title: title.trim(),
      description: desc.trim(),
      category, period,
      partner,
      createdBy: 'A',
      emoji,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: getTargetDate(),
    })
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(42,24,16,0.4)', backdropFilter: 'blur(6px)', zIndex: 200 }}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          background: '#FFFBF5', borderRadius: '1.5rem 1.5rem 0 0',
          maxHeight: '90dvh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(200,130,100,0.2)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#EDD5C8' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1rem 1.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} color="#E8846A" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                Tambah Goal Baru
              </span>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="#8B6B61" />
            </button>
          </div>

          {/* Emoji picker */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61', fontWeight: 600, marginBottom: '0.5rem' }}>Pilih Ikon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {GOAL_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  style={{
                    width: 36, height: 36, borderRadius: '0.625rem', fontSize: '1.1rem',
                    border: emoji === e ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                    background: emoji === e ? 'rgba(232,132,106,0.1)' : 'white',
                    cursor: 'pointer',
                  }}
                >{e}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#8B6B61', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Judul Goal *
            </label>
            <input
              className="input-warm"
              placeholder="Cth: Liburan ke Bali berdua"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#8B6B61', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Deskripsi (opsional)
            </label>
            <textarea
              className="input-warm"
              placeholder="Ceritakan lebih detail tentang goal ini..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Category */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61', fontWeight: 600, marginBottom: '0.5rem' }}>Kategori</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {(Object.entries(CATEGORY_CONFIG) as [GoalCategory, typeof CATEGORY_CONFIG[GoalCategory]][]).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setCategory(key)}
                  className="btn-chip"
                  style={{
                    fontWeight: category === key ? 700 : 500,
                    border: category === key ? `2px solid ${cfg.color}` : '1.5px solid #EDD5C8',
                    background: category === key ? cfg.bg : 'white',
                    color: category === key ? cfg.color : '#8B6B61',
                  }}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61', fontWeight: 600, marginBottom: '0.5rem' }}>Periode</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['6-month', 'yearly'] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPeriod(p)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: '0.75rem', fontSize: '0.875rem',
                    fontWeight: period === p ? 700 : 500,
                    border: period === p ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                    background: period === p ? 'rgba(232,132,106,0.1)' : 'white',
                    color: period === p ? '#E8846A' : '#8B6B61', cursor: 'pointer',
                  }}
                >{PERIOD_LABELS[p]}</button>
              ))}
            </div>
          </div>

          {/* Owner */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8B6B61', fontWeight: 600, marginBottom: '0.5rem' }}>Goal untuk siapa?</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {([['both', '👫 Berdua'], ['A', partnerA.name || 'Partner A'], ['B', partnerB.name || 'Partner B']] as const).map(([p, label]) => (
                <button key={p} type="button" onClick={() => setPartner(p as Goal['partner'])}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: '0.75rem', fontSize: '0.8rem',
                    fontWeight: partner === p ? 700 : 500,
                    border: partner === p ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                    background: partner === p ? 'rgba(232,132,106,0.1)' : 'white',
                    color: partner === p ? '#E8846A' : '#8B6B61', cursor: 'pointer',
                  }}
                >{label}</button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}
          >
            <Target size={16} /> Simpan Goal
          </button>
        </form>
      </motion.div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const { goals, partnerA, partnerB, isPremium } = useMockStore(
    useShallow((s) => ({
      goals:    s.goals,
      partnerA: s.partnerA,
      partnerB: s.partnerB,
      isPremium: s.isPremium,
    }))
  )

  const [showAdd, setShowAdd]   = useState(false)
  const [filterPeriod, setFilter] = useState<'all' | '6-month' | 'yearly'>('all')

  const active    = goals.filter((g) => !g.completed)
  const completed = goals.filter((g) =>  g.completed)

  const filteredActive = filterPeriod === 'all'
    ? active
    : active.filter((g) => g.period === filterPeriod)

  const allPct = active.length
    ? Math.round(active.reduce((s, g) => s + (g.checkIns.at(-1)?.pct ?? 0), 0) / active.length)
    : 0

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem) clamp(1rem,4vw,1.5rem) 6rem' }}>
      {/* Header */}
      <FadeUp>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.875rem', background: 'rgba(232,132,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color="#E8846A" />
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.625rem)', fontWeight: 700, color: '#2A1810', lineHeight: 1.2 }}>
                  Goals Bersama
                </h1>
                <p style={{ fontSize: '0.8125rem', color: '#8B6B61' }}>Target 6-bulan & tahunan kalian</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="btn-primary"
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', gap: '0.3rem' }}
            >
              <Plus size={15} /> Tambah
            </motion.button>
          </div>
        </div>
      </FadeUp>

      {/* Stats row */}
      <FadeUp delay={0.05}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Goals Aktif',    val: active.length,    icon: '🎯', color: '#E8846A' },
            { label: 'Progress Rata²', val: `${allPct}%`,     icon: '📈', color: '#6B9FD4' },
            { label: 'Selesai',        val: completed.length, icon: '🏆', color: '#7BAE7F' },
          ].map(({ label, val, icon, color }) => (
            <div key={label}
              style={{
                flex: 1, background: 'white', borderRadius: '1rem',
                padding: '0.75rem', textAlign: 'center',
                border: '1px solid rgba(237,213,200,0.6)',
                boxShadow: '0 2px 8px rgba(200,130,100,0.06)',
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.1rem,3vw,1.375rem)', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: '#C4A090', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* Period filter */}
      <FadeUp delay={0.08}>
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
          {([['all', 'Semua'], ['6-month', '6 Bulan'], ['yearly', '1 Tahun']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: '0.35rem 0.875rem', borderRadius: '2rem', fontSize: '0.8rem',
                fontWeight: filterPeriod === key ? 700 : 500,
                border: filterPeriod === key ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                background: filterPeriod === key ? 'rgba(232,132,106,0.1)' : 'white',
                color: filterPeriod === key ? '#E8846A' : '#8B6B61', cursor: 'pointer',
              }}
            >{label}</button>
          ))}
        </div>
      </FadeUp>

      {/* Active goals */}
      <FadeUp delay={0.1}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
          <AnimatePresence>
            {filteredActive.map((goal) => (
              <GoalCard
                key={goal.id} goal={goal}
                partnerAName={partnerA.name} partnerBName={partnerB.name}
              />
            ))}
          </AnimatePresence>
          {filteredActive.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#C4A090' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <p style={{ fontSize: '0.875rem' }}>Belum ada goal aktif. Mulai set target berdua!</p>
            </div>
          )}
        </div>
      </FadeUp>

      {/* Completed goals */}
      {completed.length > 0 && (
        <FadeUp delay={0.15}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Trophy size={14} color="#7BAE7F" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#3D7A43' }}>Goals Selesai ({completed.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {completed.map((goal) => (
                <GoalCard key={goal.id} goal={goal} partnerAName={partnerA.name} partnerBName={partnerB.name} />
              ))}
            </div>
          </div>
        </FadeUp>
      )}

      {/* Add goal modal */}
      <AnimatePresence>
        {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  )
}
