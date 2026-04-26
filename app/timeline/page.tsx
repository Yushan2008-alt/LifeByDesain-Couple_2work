'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMockStore } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import {
  Clock, Filter, Heart, BookOpen, MessageCircle,
  Trophy, Sparkles, Target, ChevronDown,
} from 'lucide-react'

const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

// ── Entry types ───────────────────────────────────────────────────────────────
type EntryType = 'mood' | 'journal' | 'emotion' | 'win' | 'ritual' | 'goal'

interface TimelineEntry {
  id: string
  date: string
  type: EntryType
  partner: 'A' | 'B' | 'both'
  title: string
  body?: string
  emoji?: string
  meta?: string
}

const TYPE_CONFIG: Record<EntryType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  mood:    { label: 'Mood',           icon: <Heart size={13} />,       color: '#E8846A', bg: 'rgba(232,132,106,0.1)' },
  journal: { label: 'Jurnal',         icon: <BookOpen size={13} />,    color: '#6B9FD4', bg: 'rgba(107,159,212,0.1)' },
  emotion: { label: 'Emotion Dump',   icon: <MessageCircle size={13}/>, color: '#F4A0A0', bg: 'rgba(244,160,160,0.1)' },
  win:     { label: 'Win',            icon: <Trophy size={13} />,      color: '#B8956A', bg: 'rgba(184,149,106,0.1)' },
  ritual:  { label: 'Weekly Ritual',  icon: <Sparkles size={13} />,    color: '#7BAE7F', bg: 'rgba(123,174,127,0.1)' },
  goal:    { label: 'Goal Check-in',  icon: <Target size={13} />,      color: '#5A9660', bg: 'rgba(90,150,96,0.1)' },
}

const INTENSITY_EMOJI: Record<number, string> = { 1: '😞', 2: '😔', 3: '😐', 4: '😊', 5: '😄' }

function groupByDate(entries: TimelineEntry[]) {
  const map = new Map<string, TimelineEntry[]>()
  for (const e of entries) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date)!.push(e)
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Hari Ini'
  if (diff === 1) return 'Kemarin'
  if (diff < 7) return `${diff} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Single entry card ─────────────────────────────────────────────────────────
function EntryCard({ entry, partnerAName, partnerBName }: {
  entry: TimelineEntry
  partnerAName: string
  partnerBName: string
}) {
  const cfg = TYPE_CONFIG[entry.type]
  const ownerName = entry.partner === 'A'
    ? (partnerAName || 'Partner A')
    : entry.partner === 'B'
    ? (partnerBName || 'Partner B')
    : 'Berdua'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      style={{
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        paddingLeft: '0.5rem',
      }}
    >
      {/* Timeline dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: cfg.bg, border: `2px solid ${cfg.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color, flexShrink: 0,
        }}>
          {cfg.icon}
        </div>
        <div style={{ width: 2, flex: 1, background: 'rgba(237,213,200,0.5)', minHeight: 16, marginTop: 4 }} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1, background: 'white', borderRadius: '1rem',
          padding: '0.75rem 0.875rem', marginBottom: '0.5rem',
          border: '1px solid rgba(237,213,200,0.5)',
          boxShadow: '0 1px 6px rgba(200,130,100,0.05)',
        }}
      >
        {/* Type chip + owner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
            {cfg.icon} {cfg.label}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#C4A090' }}>{ownerName}</span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {entry.emoji && <span style={{ fontSize: '1rem' }}>{entry.emoji}</span>}
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', lineHeight: 1.35 }}>
            {entry.title}
          </span>
        </div>

        {/* Body */}
        {entry.body && (
          <p style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.6, marginTop: '0.375rem' }}>
            {entry.body.length > 120 ? entry.body.slice(0, 120) + '…' : entry.body}
          </p>
        )}

        {/* Meta */}
        {entry.meta && (
          <p style={{ fontSize: '0.7rem', color: '#C4A090', marginTop: '0.375rem', fontStyle: 'italic' }}>
            {entry.meta}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TimelinePage() {
  const {
    moodHistory, journals, emotionDumps, wins,
    weeklyRitualsCompleted, goals, partnerA, partnerB,
  } = useMockStore(
    useShallow((s) => ({
      moodHistory:             s.moodHistory,
      journals:                s.journals,
      emotionDumps:            s.emotionDumps,
      wins:                    s.wins,
      weeklyRitualsCompleted:  s.weeklyRitualsCompleted,
      goals:                   s.goals,
      partnerA:                s.partnerA,
      partnerB:                s.partnerB,
    }))
  )

  const [filterType, setFilterType]       = useState<EntryType | 'all'>('all')
  const [filterPartner, setFilterPartner] = useState<'all' | 'A' | 'B'>('all')
  const [filterRange, setFilterRange]     = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [showFilter, setShowFilter]       = useState(false)

  const DATE_RANGES: { value: typeof filterRange; label: string }[] = [
    { value: 'all',  label: 'Semua Waktu' },
    { value: '7d',   label: '7 Hari' },
    { value: '30d',  label: '30 Hari' },
    { value: '90d',  label: '3 Bulan' },
  ]

  // Build unified timeline
  const allEntries = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = []

    // Mood entries
    moodHistory.forEach((m) => {
      entries.push({
        id: m.id, date: m.date, type: 'mood', partner: m.partner,
        title: `Mood ${INTENSITY_EMOJI[m.intensity] ?? m.emoji} — intensitas ${m.intensity}/5`,
        emoji: m.emoji,
        meta: m.tags.length ? `Tag: ${m.tags.join(', ')}` : undefined,
      })
    })

    // Journals
    journals.forEach((j) => {
      entries.push({
        id: j.id, date: j.date, type: 'journal', partner: j.partner,
        title: 'Catatan Jurnal Pribadi',
        body: j.text,
      })
    })

    // Shared emotion dumps only
    emotionDumps.filter((e) => e.shared && e.refinedText).forEach((e) => {
      entries.push({
        id: e.id, date: e.date, type: 'emotion', partner: e.partner,
        title: 'Emotion Dump (dibagikan)',
        body: e.refinedText ?? undefined,
        meta: '✓ Sudah di-refine AI & dibagikan ke pasangan',
      })
    })

    // Wins
    wins.forEach((w) => {
      entries.push({
        id: w.id,
        date: new Date().toISOString().split('T')[0], // wins don't have date in model; use today
        type: 'win', partner: w.partner,
        title: w.type === 'relationship' ? '🏆 Relationship Win' : '⭐ Personal Win',
        body: w.text,
      })
    })

    // Goal check-ins
    goals.forEach((g) => {
      g.checkIns.forEach((ci) => {
        entries.push({
          id: ci.id, date: ci.date, type: 'goal', partner: g.partner,
          title: `Goal Update: ${g.title}`,
          emoji: g.emoji,
          body: ci.note,
          meta: `Progress: ${ci.pct}%`,
        })
      })
    })

    return entries
  }, [moodHistory, journals, emotionDumps, wins, goals])

  // Apply filters
  const filtered = useMemo(() => {
    const now = Date.now()
    const rangeDays: Record<typeof filterRange, number> = { all: Infinity, '7d': 7, '30d': 30, '90d': 90 }
    const maxDays = rangeDays[filterRange]
    return allEntries.filter((e) => {
      if (filterType !== 'all' && e.type !== filterType) return false
      if (filterPartner !== 'all') {
        if (e.partner !== filterPartner && e.partner !== 'both') return false
      }
      if (maxDays !== Infinity) {
        const diff = (now - new Date(e.date + 'T00:00:00').getTime()) / 86_400_000
        if (diff > maxDays) return false
      }
      return true
    })
  }, [allEntries, filterType, filterPartner, filterRange])

  const grouped = groupByDate(filtered)

  const totalEntries = allEntries.length
  const uniqueDays   = new Set(allEntries.map((e) => e.date)).size

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem) clamp(1rem,4vw,1.5rem) 6rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.875rem', background: 'rgba(107,159,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="#6B9FD4" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.625rem)', fontWeight: 700, color: '#2A1810', lineHeight: 1.2 }}>
                Memory Timeline
              </h1>
              <p style={{ fontSize: '0.8125rem', color: '#8B6B61' }}>
                {totalEntries} entri · {uniqueDays} hari tercatat
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="btn-sm"
            style={{
              background: showFilter ? 'rgba(232,132,106,0.12)' : 'white',
              border: '1.5px solid #EDD5C8', color: '#8B6B61',
            }}
          >
            <Filter size={13} /> Filter
            {(filterType !== 'all' || filterPartner !== 'all' || filterRange !== 'all') && (
              <span style={{
                background: '#E8846A', color: 'white',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {[filterType !== 'all', filterPartner !== 'all', filterRange !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1rem' }}
          >
            <div style={{ background: 'white', borderRadius: '1rem', padding: '0.875rem', border: '1px solid rgba(237,213,200,0.6)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Type filter */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#C4A090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Tipe</div>
                <div className="chip-row">
                  {(['all', 'mood', 'journal', 'emotion', 'win', 'goal'] as const).map((t) => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className="btn-chip"
                      style={{
                        fontWeight: filterType === t ? 700 : 500,
                        border: filterType === t ? `2px solid ${t === 'all' ? '#E8846A' : TYPE_CONFIG[t as EntryType]?.color ?? '#E8846A'}` : '1.5px solid #EDD5C8',
                        background: filterType === t ? (t === 'all' ? 'rgba(232,132,106,0.1)' : TYPE_CONFIG[t as EntryType]?.bg ?? 'transparent') : 'white',
                        color: filterType === t ? (t === 'all' ? '#E8846A' : TYPE_CONFIG[t as EntryType]?.color ?? '#E8846A') : '#8B6B61',
                      }}
                    >{t === 'all' ? 'Semua' : TYPE_CONFIG[t as EntryType].label}</button>
                  ))}
                </div>
              </div>
              {/* Date range filter */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#C4A090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Rentang Waktu</div>
                <div className="chip-row">
                  {DATE_RANGES.map(({ value, label }) => (
                    <button key={value} onClick={() => setFilterRange(value)}
                      className="btn-chip"
                      style={{
                        fontWeight: filterRange === value ? 700 : 500,
                        border: filterRange === value ? '2px solid #6B9FD4' : '1.5px solid #EDD5C8',
                        background: filterRange === value ? 'rgba(107,159,212,0.1)' : 'white',
                        color: filterRange === value ? '#6B9FD4' : '#8B6B61',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Partner filter */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#C4A090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Partner</div>
                <div className="chip-row">
                  {([['all', 'Semua'], ['A', partnerA.name || 'Partner A'], ['B', partnerB.name || 'Partner B']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setFilterPartner(val as 'all' | 'A' | 'B')}
                      className="btn-chip"
                      style={{
                        fontWeight: filterPartner === val ? 700 : 500,
                        border: filterPartner === val ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                        background: filterPartner === val ? 'rgba(232,132,106,0.1)' : 'white',
                        color: filterPartner === val ? '#E8846A' : '#8B6B61',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats chips */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}
      >
        {(Object.entries(TYPE_CONFIG) as [EntryType, typeof TYPE_CONFIG[EntryType]][]).map(([type, cfg]) => {
          const count = allEntries.filter((e) => e.type === type).length
          if (!count) return null
          return (
            <div key={type}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.color}33`,
                borderRadius: '2rem', padding: '0.25rem 0.625rem',
                fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {cfg.icon} {count} {cfg.label}
            </div>
          )
        })}
      </motion.div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <AnimatePresence>
          {grouped.map(([date, entries]) => (
            <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Date header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <div style={{ height: 1, flex: 1, background: '#EDD5C8' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C4A090', whiteSpace: 'nowrap' }}>
                  {formatDateLabel(date)}
                </span>
                <div style={{ height: 1, flex: 1, background: '#EDD5C8' }} />
              </div>
              {/* Entries for this date */}
              <div>
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    partnerAName={partnerA.name}
                    partnerBName={partnerB.name}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {grouped.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#C4A090' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
            <p style={{ fontSize: '0.875rem' }}>Belum ada entri yang cocok dengan filter ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}
