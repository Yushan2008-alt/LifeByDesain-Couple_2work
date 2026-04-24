'use client'

import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMockStore } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/utils'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer,
} from 'recharts'
import { Share2, Download, Trophy, Flame, Heart, Target, Star, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 } as const

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ emoji, value, label, color = '#E8846A', delay = 0 }: {
  emoji: string; value: string | number; label: string; color?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay }}
      style={{
        background: 'white', borderRadius: '1.25rem', padding: '1rem',
        border: '1px solid rgba(237,213,200,0.6)',
        boxShadow: '0 4px 16px rgba(200,130,100,0.08)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>{emoji}</div>
      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,5vw,2.25rem)', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
    </motion.div>
  )
}

// ── Highlight reel card ───────────────────────────────────────────────────────
function HighlightCard({ emoji, title, body, color, delay }: {
  emoji: string; title: string; body: string; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      style={{
        background: 'white', borderRadius: '1.125rem', padding: '1rem 1.125rem',
        border: '1px solid rgba(237,213,200,0.5)',
        display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
      }}
    >
      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{emoji}</div>
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.6 }}>{body}</div>
      </div>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function YearlyRecapPage() {
  const {
    moodHistory, streak, wins, achievements, goals,
    weeklyRitualsCompleted, partnerA, partnerB,
    scores, habits, emotionDumps,
  } = useMockStore(
    useShallow((s) => ({
      moodHistory:            s.moodHistory,
      streak:                 s.streak,
      wins:                   s.wins,
      achievements:           s.achievements,
      goals:                  s.goals,
      weeklyRitualsCompleted: s.weeklyRitualsCompleted,
      partnerA:               s.partnerA,
      partnerB:               s.partnerB,
      scores:                 s.scores,
      habits:                 s.habits,
      emotionDumps:           s.emotionDumps,
    }))
  )

  const year = new Date().getFullYear()

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalMoods = moodHistory.length
  const avgMood    = totalMoods
    ? (moodHistory.reduce((s, m) => s + m.intensity, 0) / totalMoods).toFixed(1)
    : '–'

  const topEmoji = useMemo(() => {
    const counts: Record<string, number> = {}
    moodHistory.forEach((m) => { counts[m.emoji] = (counts[m.emoji] ?? 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '🌸'
  }, [moodHistory])

  const sharedDumps  = emotionDumps.filter((e) => e.shared).length
  const goalsCompleted = goals.filter((g) => g.completed).length
  const totalGoals   = goals.length

  // 360 radar — latest scores both partners
  const scoresA = scores.filter((s) => s.partner === 'A').at(-1)
  const scoresB = scores.filter((s) => s.partner === 'B').at(-1)

  const radarData = DIMENSIONS.map((key) => ({
    subject: DIMENSION_LABELS[key],
    A: scoresA?.self?.[key] ?? 7,
    B: scoresB?.self?.[key] ?? 7,
  }))

  const avgScoreA = scoresA ? (Object.values(scoresA.self).reduce((a, b) => a + b, 0) / 5).toFixed(1) : '–'
  const avgScoreB = scoresB ? (Object.values(scoresB.self).reduce((a, b) => a + b, 0) / 5).toFixed(1) : '–'

  // Top mood tag
  const tagCounts: Record<string, number> = {}
  moodHistory.forEach((m) => m.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 1 }))
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'joy'

  const tagEmoji: Record<string, string> = {
    work: '💼', family: '🏡', health: '💪', intimacy: '💕',
    stress: '😤', joy: '🎉', tired: '😴', peaceful: '🌿', excited: '🚀',
  }

  // AI narrative
  const narrative = useMemo(() => {
    const nameA = partnerA.name || 'Partner A'
    const nameB = partnerB.name || 'Partner B'
    const highPoints = wins.filter((w) => w.type === 'relationship').slice(0, 2)
    return `Tahun ${year} adalah perjalanan luar biasa untuk ${nameA} dan ${nameB}. Kalian berhasil konsisten selama ${streak} hari berturut-turut, menyelesaikan ${weeklyRitualsCompleted} weekly ritual bersama, dan merayakan ${wins.length} momen wins yang berarti. ${highPoints.length ? `Salah satu highlight terbesar: "${highPoints[0].text}".` : ''} Dengan rata-rata mood ${avgMood}/5 sepanjang periode ini dan ${sharedDumps} emosi yang berhasil dikomunikasikan lewat AI translation, kalian membuktikan bahwa investasi intentional di hubungan benar-benar membuat perbedaan. Ke depannya, ${goalsCompleted}/${totalGoals} goal telah tercapai — fondasi yang kuat untuk periode berikutnya.`
  }, [partnerA, partnerB, streak, weeklyRitualsCompleted, wins, avgMood, sharedDumps, goalsCompleted, totalGoals, year])

  function handleShare() {
    const text = `✨ ${partnerA.name || 'Kami'} & ${partnerB.name || 'Pasangan'} — LifebyDesign ${year} Recap\n🔥 ${streak} hari streak\n📊 ${weeklyRitualsCompleted} weekly rituals\n🏆 ${goalsCompleted} goals selesai\n⭐ Avg mood ${avgMood}/5\n\nInvestasi intentional untuk hubungan kami 💕`
    if (navigator.share) {
      navigator.share({ title: 'LifebyDesign Yearly Recap', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Teks recap disalin ke clipboard!')
    }
  }

  function handleDownload() {
    const data = {
      period: year,
      partnerA: partnerA.name,
      partnerB: partnerB.name,
      stats: {
        streak, weeklyRitualsCompleted, totalMoods,
        avgMood, sharedDumps, winsCount: wins.length,
        goalsCompleted, totalGoals, achievements: achievements.length,
      },
      narrative,
      generatedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `lifebydesign-recap-${year}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        maxWidth: 600, margin: '0 auto',
        padding: 'clamp(1.5rem,5vw,3rem) clamp(1rem,4vw,1.5rem) 4rem',
        background: 'linear-gradient(180deg,#FFFBF5 0%,#FFF5EE 40%,#F0F7F0 100%)',
        minHeight: '100dvh',
      }}
    >
      {/* Hero */}
      <FadeUp>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            style={{ fontSize: 'clamp(3rem,10vw,5rem)', marginBottom: '1rem', display: 'block' }}
          >
            🌸
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(232,132,106,0.1)', border: '1px solid rgba(232,132,106,0.25)',
              borderRadius: '2rem', padding: '0.375rem 1rem',
              fontSize: '0.8125rem', fontWeight: 600, color: '#E8846A', marginBottom: '1rem',
            }}
          >
            <Sparkles size={13} /> LifebyDesign Wrapped
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }}
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.875rem,6vw,3rem)',
              fontWeight: 700, color: '#2A1810', lineHeight: 1.15,
              marginBottom: '0.5rem',
            }}
          >
            {partnerA.name || 'Kalian'} & {partnerB.name || 'Pasangan'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{ fontSize: 'clamp(1rem,2.5vw,1.125rem)', color: '#8B6B61' }}
          >
            Perjalanan kalian di {year} — dalam angka & cerita
          </motion.p>
        </div>
      </FadeUp>

      {/* Key stats grid */}
      <FadeUp delay={0.1}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#C4A090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '1rem' }}>
            Tahun Kalian dalam Angka
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <StatCard emoji="🔥" value={streak}               label="Hari streak saat ini"  color="#E8846A" delay={0.12} />
            <StatCard emoji="✨" value={weeklyRitualsCompleted} label="Weekly rituals selesai" color="#7BAE7F" delay={0.15} />
            <StatCard emoji={topEmoji} value={`${avgMood}/5`} label="Rata-rata mood"           color="#6B9FD4" delay={0.18} />
            <StatCard emoji="🏆" value={wins.length}           label="Wins tercatat"           color="#B8956A" delay={0.21} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.75rem' }}>
            <StatCard emoji="💌" value={sharedDumps}      label="Emosi dibagikan"    color="#F4A0A0" delay={0.24} />
            <StatCard emoji="🎯" value={`${goalsCompleted}/${totalGoals}`} label="Goals tercapai" color="#5A9660" delay={0.27} />
            <StatCard emoji="🥇" value={achievements.length} label="Badges diraih"   color="#B8956A" delay={0.30} />
          </div>
        </div>
      </FadeUp>

      {/* 360 Evolution */}
      <FadeUp delay={0.2}>
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Target size={16} color="#E8846A" />
            <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: '#2A1810' }}>
              Profil 360° Kalian
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {[
              { name: partnerA.name || 'Partner A', score: avgScoreA, color: '#E8846A' },
              { name: partnerB.name || 'Partner B', score: avgScoreB, color: '#7BAE7F' },
            ].map(({ name, score, color }) => (
              <div key={name} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.25rem,4vw,1.75rem)', fontWeight: 800, color }}>{score}</div>
                <div style={{ fontSize: '0.75rem', color: '#C4A090' }}>{name}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#EDD5C8" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#8B6B61' }} />
              <Radar name={partnerA.name || 'A'} dataKey="A" stroke="#E8846A" fill="#E8846A" fillOpacity={0.25} />
              <Radar name={partnerB.name || 'B'} dataKey="B" stroke="#7BAE7F" fill="#7BAE7F" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </FadeUp>

      {/* Top emotion tag */}
      <FadeUp delay={0.25}>
        <div
          style={{
            background: 'linear-gradient(135deg,rgba(232,132,106,0.1),rgba(244,160,160,0.08))',
            border: '1px solid rgba(232,132,106,0.2)',
            borderRadius: '1.25rem', padding: '1.25rem',
            marginBottom: '1.5rem', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{tagEmoji[topTag] ?? '💛'}</div>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1rem,3vw,1.25rem)', fontWeight: 700, color: '#2A1810', marginBottom: '0.25rem' }}>
            Tag Emosi Dominan Kalian
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#E8846A', textTransform: 'capitalize' }}>{topTag}</div>
          <p style={{ fontSize: '0.8125rem', color: '#8B6B61', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Tema ini muncul paling sering di mood kalian — sebuah cerminan dari apa yang paling dirasakan bersama.
          </p>
        </div>
      </FadeUp>

      {/* Highlight reel */}
      <FadeUp delay={0.3}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Star size={15} color="#B8956A" fill="#B8956A" />
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', fontWeight: 700, color: '#2A1810' }}>
              Highlight Kalian
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {wins.slice(0, 4).map((w, i) => (
              <HighlightCard
                key={w.id}
                emoji={w.type === 'relationship' ? '💑' : '⭐'}
                title={w.type === 'relationship' ? 'Relationship Win' : 'Personal Win'}
                body={w.text}
                color={w.type === 'relationship' ? '#E8846A' : '#B8956A'}
                delay={0.32 + i * 0.05}
              />
            ))}
            {wins.length === 0 && (
              <div style={{ textAlign: 'center', color: '#C4A090', padding: '1rem', fontSize: '0.875rem' }}>
                Mulai catat wins di Weekly Ritual!
              </div>
            )}
          </div>
        </div>
      </FadeUp>

      {/* Goals summary */}
      {goals.length > 0 && (
        <FadeUp delay={0.35}>
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Target size={16} color="#5A9660" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: '#2A1810' }}>
                Goals Recap
              </span>
            </div>
            {goals.map((g) => {
              const pct = g.checkIns.at(-1)?.pct ?? 0
              return (
                <div key={g.id} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span>{g.emoji}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1810' }}>{g.title}</span>
                      {g.completed && <span style={{ fontSize: '0.65rem', background: 'rgba(123,174,127,0.15)', color: '#3D7A43', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pct >= 100 ? '#3D7A43' : '#E8846A' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#EDD5C8', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ...SPRING, delay: 0.4 }}
                      style={{ height: '100%', background: pct >= 100 ? '#7BAE7F' : '#E8846A', borderRadius: 3 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </FadeUp>
      )}

      {/* AI Narrative */}
      <FadeUp delay={0.4}>
        <div
          style={{
            background: 'linear-gradient(135deg,#FFF5EE,#F0F7F0)',
            border: '1px solid rgba(237,213,200,0.6)',
            borderRadius: '1.5rem', padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={16} color="#E8846A" />
            <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: '#2A1810' }}>
              Narasi AI — Perjalanan Kalian
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#5A3E37', lineHeight: 1.8, fontStyle: 'italic' }}>
            &ldquo;{narrative}&rdquo;
          </p>
          <p style={{ fontSize: '0.7rem', color: '#C4A090', marginTop: '0.75rem' }}>
            ✦ Dihasilkan berdasarkan data kalian. Positive framing only.
          </p>
        </div>
      </FadeUp>

      {/* CTA row */}
      <FadeUp delay={0.45}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.875rem' }}
          >
            <Share2 size={16} /> Bagikan Recap
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.875rem' }}
          >
            <Download size={16} /> Download JSON
          </motion.button>
        </div>

        <Link href="/goals" style={{ textDecoration: 'none', display: 'block', marginTop: '0.75rem' }}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: 'rgba(90,150,96,0.08)', border: '1.5px solid rgba(90,150,96,0.25)',
              borderRadius: '1rem', padding: '0.875rem 1.125rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: '#3D7A43',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
              <Target size={15} /> Set Goals untuk Tahun Berikutnya
            </div>
            <ArrowRight size={15} />
          </motion.div>
        </Link>
      </FadeUp>
    </div>
  )
}
