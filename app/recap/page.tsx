'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid,
} from 'recharts'
import { useMockStore } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import { DIMENSION_LABELS, DIMENSIONS, habitCompletionThisWeek } from '@/lib/utils'
import {
  Trophy, Star, Flame, TrendingUp, Heart, Share2,
  BarChart2, Target, Sparkles, Lock, ArrowRight, Download, ExternalLink,
} from 'lucide-react'

// ── Shared spring ─────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

// ── Achievement config ────────────────────────────────────────────────────────
const ACHIEVEMENT_CONFIG: Record<string, { label: string; emoji: string; desc: string }> = {
  first_mood:          { label: 'Mood Pertama',      emoji: '😊', desc: 'Check-in mood pertama kali' },
  first_360:           { label: 'Refleksi 360°',     emoji: '🎯', desc: 'Menyelesaikan weekly ritual pertama' },
  streak_7:            { label: '7 Hari Berturut',   emoji: '🔥', desc: 'Streak 7 hari konsisten' },
  streak_30:           { label: '30 Hari Legenda',   emoji: '👑', desc: 'Streak 30 hari luar biasa!' },
  first_emotion_shared:{ label: 'Berbagi Perasaan',  emoji: '💌', desc: 'Pertama kali share emotion dump' },
  first_win:           { label: 'Win Pertama',       emoji: '🏆', desc: 'Mencatat weekly win pertama' },
  first_weekly_ritual: { label: 'Ritual Pertama',    emoji: '✨', desc: 'Menyelesaikan weekly ritual' },
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RecapPage() {
  const router = useRouter()

  const {
    partnerA, partnerB,
    moodHistory, habits, scores, wins,
    achievements, isPremium, streak,
    relationshipContext,
  } = useMockStore(useShallow((s) => ({
    partnerA:            s.partnerA,
    partnerB:            s.partnerB,
    moodHistory:         s.moodHistory,
    habits:              s.habits,
    scores:              s.scores,
    wins:                s.wins,
    achievements:        s.achievements,
    isPremium:           s.isPremium,
    streak:              s.streak,
    relationshipContext: s.relationshipContext,
  })))

  useEffect(() => {
    if (!partnerA.joined || !partnerB.joined) router.replace('/onboarding')
  }, [])

  if (!partnerA.joined || !partnerB.joined) return null

  // ── Build mood trend data (last 4 weeks bucketed into 4 groups) ───────────
  const moodA = moodHistory.filter((m) => m.partner === 'A')
  const moodB = moodHistory.filter((m) => m.partner === 'B')

  function weekAvg(entries: typeof moodA, daysAgoStart: number, daysAgoEnd: number) {
    const now = Date.now()
    const slice = entries.filter((m) => {
      const diff = Math.floor((now - new Date(m.date + 'T00:00:00').getTime()) / 86_400_000)
      return diff >= daysAgoEnd && diff < daysAgoStart
    })
    if (!slice.length) return null
    return +(slice.reduce((s, m) => s + m.intensity, 0) / slice.length).toFixed(1)
  }

  const trendData = [
    { week: 'M-3', a: weekAvg(moodA, 28, 21) ?? 3.2, b: weekAvg(moodB, 28, 21) ?? 3.5 },
    { week: 'M-2', a: weekAvg(moodA, 21, 14) ?? 3.0, b: weekAvg(moodB, 21, 14) ?? 3.8 },
    { week: 'M-1', a: weekAvg(moodA, 14, 7)  ?? 3.4, b: weekAvg(moodB, 14, 7)  ?? 3.6 },
    { week: 'Minggu ini', a: weekAvg(moodA, 7, 0) ?? 3.8, b: weekAvg(moodB, 7, 0) ?? 4.1 },
  ]

  // ── Radar data — compare W-prev vs W-current (using W-prev for both, projected W-current) ─
  const wPrevA = scores.find((s) => s.week === 'W-prev' && s.partner === 'A')
  const wPrevB = scores.find((s) => s.week === 'W-prev' && s.partner === 'B')

  // Use W-current scores if available, else fall back to W-prev + small deterministic improvement
  const wCurA = scores.find((s) => s.week === 'W-current' && s.partner === 'A')
  const wCurB = scores.find((s) => s.week === 'W-current' && s.partner === 'B')
  const radarData = DIMENSIONS.map((dim, idx) => {
    const selfA = wPrevA?.self[dim] ?? 0
    const selfB = wPrevB?.self[dim] ?? 0
    // Use actual current week scores if available, else tiny deterministic bump
    const nowA  = wCurA ? wCurA.self[dim] : Math.min(10, selfA + [0, 0.5, 0, 1, 0.5][idx % 5])
    const nowB  = wCurB ? wCurB.self[dim] : Math.min(10, selfB + [0.5, 0, 1, 0, 0.5][idx % 5])
    return {
      dim: DIMENSION_LABELS[dim],
      'A (bulan lalu)': selfA,
      'A (sekarang)':   +nowA.toFixed(1),
      'B (bulan lalu)': selfB,
      'B (sekarang)':   +nowB.toFixed(1),
    }
  })

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalMoodEntries = moodHistory.length
  const avgIntensity = moodHistory.length
    ? +(moodHistory.reduce((s, m) => s + m.intensity, 0) / moodHistory.length).toFixed(1)
    : 0
  const habitCompA = Math.round(
    habits.filter((h) => h.partner === 'A').reduce((s, h) => s + habitCompletionThisWeek(h.completedDays), 0) /
    Math.max(1, habits.filter((h) => h.partner === 'A').length)
  )
  const habitCompB = Math.round(
    habits.filter((h) => h.partner === 'B').reduce((s, h) => s + habitCompletionThisWeek(h.completedDays), 0) /
    Math.max(1, habits.filter((h) => h.partner === 'B').length)
  )
  const winsCount = wins.length

  // ── AI narrative (simulated) ──────────────────────────────────────────────
  const focus = relationshipContext?.focus ?? 'tumbuh bersama'
  const aiNarrative = `Bulan ini, ${partnerA.name} & ${partnerB.name} menunjukkan konsistensi yang luar biasa — ${streak} hari streak! Fokus kalian pada "${focus}" terlihat jelas dari ${totalMoodEntries} mood check-in dan rata-rata intensitas ${avgIntensity}/5. ${winsCount > 0 ? `Ada ${winsCount} weekly wins yang terkumpul — momen-momen kecil yang jadi fondasi hubungan kalian.` : ''} Tren mood ${partnerA.name} menunjukkan improvement di minggu ini dibanding 3 minggu lalu. Terus pertahankan ritualnya! 🌸`

  return (
    <div className="bg-spring" style={{ minHeight: '100dvh', padding: '1.5rem 1rem 6rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <FadeUp>
          <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
                fontWeight: 700,
                color: '#2A1810',
                marginBottom: '0.375rem',
              }}
            >
              Monthly Recap
            </h1>
            <p style={{ color: '#8B6B61', fontSize: '0.9375rem' }}>
              {partnerA.name} &amp; {partnerB.name} · April 2026
            </p>
          </div>
        </FadeUp>

        {/* Stats row */}
        <FadeUp delay={0.08}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.875rem',
            }}
          >
            {[
              { icon: Flame, val: `${streak}`, label: 'Day Streak', color: '#E8846A', bg: '#FFF5EE' },
              { icon: Heart, val: `${totalMoodEntries}`, label: 'Check-ins', color: '#F4A0A0', bg: '#FDDEDE' },
              { icon: Trophy, val: `${winsCount}`, label: 'Weekly Wins', color: '#B8956A', bg: '#FFF5E8' },
              { icon: Star,   val: `${avgIntensity}`, label: 'Avg Mood', color: '#6B9FD4', bg: '#EBF4FF' },
            ].map(({ icon: Icon, val, label, color, bg }) => (
              <div
                key={label}
                style={{
                  background: 'white',
                  borderRadius: '1.25rem',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  border: `1px solid ${color}22`,
                  boxShadow: '0 2px 12px rgba(200,130,100,0.07)',
                }}
              >
                <div
                  style={{
                    width: 40, height: 40,
                    borderRadius: '0.75rem',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.625rem',
                  }}
                >
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontSize: 'clamp(1.25rem,4vw,1.5rem)', fontWeight: 800, color: '#2A1810', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Mood trend */}
        <FadeUp delay={0.12}>
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
              border: '1px solid rgba(237,213,200,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={18} color="#E8846A" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                Tren Mood 4 Minggu
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(237,213,200,0.4)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#C4A090' }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#C4A090' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,251,245,0.96)',
                    border: '1px solid #EDD5C8',
                    borderRadius: '0.75rem',
                    fontSize: '0.8125rem',
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                <Line
                  type="monotone"
                  dataKey="a"
                  name={partnerA.name || 'Partner A'}
                  stroke="#E8846A"
                  strokeWidth={2.5}
                  dot={{ fill: '#E8846A', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="b"
                  name={partnerB.name || 'Partner B'}
                  stroke="#7BAE7F"
                  strokeWidth={2.5}
                  dot={{ fill: '#7BAE7F', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FadeUp>

        {/* 360° Radar evolution */}
        <FadeUp delay={0.16}>
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
              border: '1px solid rgba(237,213,200,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Target size={18} color="#6B9FD4" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                Evolusi 360° Hubungan
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#C4A090', marginBottom: '1.25rem' }}>
              Perbandingan self-score: bulan lalu vs minggu ini
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(237,213,200,0.5)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#8B6B61' }} />
                <Radar name="A (bulan lalu)" dataKey="A (bulan lalu)" stroke="#E8846A" fill="#E8846A" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
                <Radar name="A (sekarang)"   dataKey="A (sekarang)"   stroke="#E8846A" fill="#E8846A" fillOpacity={0.3} strokeWidth={2.5} />
                <Radar name="B (bulan lalu)" dataKey="B (bulan lalu)" stroke="#7BAE7F" fill="#7BAE7F" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
                <Radar name="B (sekarang)"   dataKey="B (sekarang)"   stroke="#7BAE7F" fill="#7BAE7F" fillOpacity={0.3} strokeWidth={2.5} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </FadeUp>

        {/* Habit completion */}
        <FadeUp delay={0.2}>
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
              border: '1px solid rgba(237,213,200,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BarChart2 size={18} color="#7BAE7F" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                Habit Completion Minggu Ini
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: partnerA.name || 'Partner A', pct: habitCompA, color: '#E8846A', bg: '#FFF5EE' },
                { name: partnerB.name || 'Partner B', pct: habitCompB, color: '#7BAE7F', bg: '#F0F7F0' },
              ].map(({ name, pct, color, bg }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810' }}>{name}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      background: '#F5EEE8',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                      style={{ height: '100%', background: color, borderRadius: 999 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Milestone Badges */}
        <FadeUp delay={0.24}>
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
              border: '1px solid rgba(237,213,200,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Trophy size={18} color="#B8956A" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                Milestone Badges
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {Object.entries(ACHIEVEMENT_CONFIG).map(([id, cfg]) => {
                const unlocked = achievements.includes(id)
                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.03 }}
                    style={{
                      background: unlocked
                        ? 'linear-gradient(135deg,#FFF5EE,#FFF0D0)'
                        : 'rgba(245,238,232,0.5)',
                      border: unlocked ? '1.5px solid rgba(184,149,106,0.35)' : '1.5px solid rgba(237,213,200,0.4)',
                      borderRadius: '1rem',
                      padding: '0.875rem 0.75rem',
                      textAlign: 'center',
                      opacity: unlocked ? 1 : 0.5,
                      filter: unlocked ? 'none' : 'grayscale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {!unlocked && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                        }}
                      >
                        <Lock size={10} color="#C4A090" />
                      </div>
                    )}
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>{cfg.emoji}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: unlocked ? '#5A3E38' : '#C4A090', lineHeight: 1.3 }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#C4A090', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {cfg.desc}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </FadeUp>

        {/* Monthly Wins collection */}
        {wins.length > 0 && (
          <FadeUp delay={0.28}>
            <div
              style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(200,130,100,0.08)',
                border: '1px solid rgba(237,213,200,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Star size={18} color="#E8846A" fill="#E8846A" />
                <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                  Koleksi Wins Bulan Ini
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {wins.map((win) => (
                  <div
                    key={win.id}
                    style={{
                      background: win.type === 'relationship' ? 'rgba(244,160,160,0.08)' : 'rgba(123,174,127,0.08)',
                      border: `1px solid ${win.type === 'relationship' ? 'rgba(244,160,160,0.25)' : 'rgba(123,174,127,0.25)'}`,
                      borderRadius: '0.875rem',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.625rem',
                    }}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                      {win.type === 'relationship' ? '💑' : '⭐'}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#2A1810', lineHeight: 1.5 }}>{win.text}</div>
                      <div style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.125rem' }}>
                        Partner {win.partner} · {win.week === 'W-prev' ? 'Minggu lalu' : 'Minggu ini'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}

        {/* AI Narrative */}
        <FadeUp delay={0.32}>
          <div
            style={{
              background: 'linear-gradient(135deg,rgba(107,159,212,0.08),rgba(123,174,127,0.06))',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(107,159,212,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="#6B9FD4" />
              <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                AI Narrative
              </span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(107,159,212,0.15)', color: '#6B9FD4', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                Ringkasan Bulan
              </span>
            </div>
            <p style={{ fontSize: '0.9375rem', color: '#5A3E38', lineHeight: 1.75 }}>
              {aiNarrative}
            </p>
          </div>
        </FadeUp>

        {/* Share card */}
        <FadeUp delay={0.36}>
          <div
            style={{
              background: 'linear-gradient(135deg,#FFF5EE,#F0F7F0)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              border: '1px solid rgba(237,213,200,0.5)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌸</div>
            <h3
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: '#2A1810',
                marginBottom: '0.375rem',
              }}
            >
              Bagikan momen ini
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#8B6B61', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Share kartu recap ini ke story — hanya highlights, tanpa data sensitif.
            </p>

            {/* Share card preview */}
            <div
              style={{
                background: 'white',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                border: '1px solid rgba(237,213,200,0.6)',
                marginBottom: '1rem',
                boxShadow: '0 4px 16px rgba(200,130,100,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🌸</span>
                <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: '#2A1810', fontSize: '0.9375rem' }}>
                  LifebyDesign Couple
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '0.5rem' }}>
                {[
                  { emoji: '🔥', val: streak, label: 'day streak' },
                  { emoji: '💕', val: winsCount, label: 'wins' },
                  { emoji: '⭐', val: avgIntensity, label: 'avg mood' },
                ].map(({ emoji, val, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem' }}>{emoji}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2A1810' }}>{val}</div>
                    <div style={{ fontSize: '0.7rem', color: '#C4A090' }}>{label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#C4A090', marginTop: '0.75rem' }}>
                April 2026 · {partnerA.name} & {partnerB.name}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const text = `🌸 LifebyDesign Couple — April 2026\n🔥 ${streak} day streak\n💕 ${winsCount} wins\n⭐ Avg mood ${avgIntensity}/5\n\n${partnerA.name} & ${partnerB.name} — konsisten intentional! 💛`
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: 'LifebyDesign Monthly Recap', text }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(text).catch(() => {})
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#E8846A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.875rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={15} />
                Bagikan Recap
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const data = {
                    exportedAt: new Date().toISOString(),
                    period: 'April 2026',
                    partners: { A: partnerA.name, B: partnerB.name },
                    streak, totalMoodEntries, avgIntensity, winsCount,
                    achievements, wins,
                    scores: scores.map((s) => ({ week: s.week, partner: s.partner, self: s.self })),
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'lbd-monthly-recap.json'; a.click()
                  URL.revokeObjectURL(url)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  color: '#8B6B61',
                  border: '1.5px solid #EDD5C8',
                  borderRadius: '0.875rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={15} />
                Export JSON
              </motion.button>
            </div>
          </div>
        </FadeUp>

        {/* Link to Yearly Recap */}
        <FadeUp delay={0.38}>
          <div
            style={{
              background: 'linear-gradient(135deg,rgba(107,159,212,0.08),rgba(123,174,127,0.06))',
              borderRadius: '1.5rem',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(107,159,212,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B9FD4', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Yearly Wrapped
              </div>
              <p style={{ fontSize: '0.875rem', color: '#2A1810', fontWeight: 600, margin: 0 }}>
                Lihat ringkasan perjalanan kalian setahun penuh
              </p>
              <p style={{ fontSize: '0.75rem', color: '#8B6B61', marginTop: '0.25rem' }}>
                Visual storytelling dari growth kalian berdua 🌸
              </p>
            </div>
            <button
              onClick={() => router.push('/yearly-recap')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                background: 'rgba(107,159,212,0.15)', color: '#5A90C4',
                border: '1px solid rgba(107,159,212,0.3)',
                borderRadius: '0.875rem', padding: '0.625rem 1rem',
                fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              }}
            >
              Lihat <ExternalLink size={13} />
            </button>
          </div>
        </FadeUp>

        {/* Upsell if not premium */}
        {!isPremium && (
          <FadeUp delay={0.4}>
            <div
              style={{
                background: 'linear-gradient(135deg,#FFF5EE,rgba(232,132,106,0.06))',
                border: '2px solid rgba(232,132,106,0.3)',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <Lock size={24} color="#E8846A" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
                Buka Semua Fitur Recap
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#8B6B61', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Data export, AI insight yang lebih dalam, dan perbandingan 3 bulan terakhir tersedia di Premium.
              </p>
              <button
                onClick={() => router.push('/#harga')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.875rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Lihat Premium
                <ArrowRight size={15} />
              </button>
            </div>
          </FadeUp>
        )}

      </div>
    </div>
  )
}
