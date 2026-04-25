// ── Date helpers ──────────────────────────────────────────────────────────────

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function daysAgoLabel(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr + 'T00:00:00').getTime()) / 86_400_000)
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Kemarin'
  return `${diff} hari lalu`
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function uid(): string {
  return Math.random().toString(36).substring(2, 10)
}

// ── Mood intensity label ──────────────────────────────────────────────────────

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Sangat Rendah',
  2: 'Rendah',
  3: 'Sedang',
  4: 'Tinggi',
  5: 'Sangat Tinggi',
}

// ── Category config ───────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  home:     { label: 'Rumah',    color: '#E8846A', bg: '#FFF5EE' },
  errands:  { label: 'Keluar',   color: '#7BAE7F', bg: '#F0F7F0' },
  social:   { label: 'Sosial',   color: '#F4A0A0', bg: '#FDDEDE' },
  plans:    { label: 'Rencana',  color: '#6B9FD4', bg: '#EBF4FF' },
  finances: { label: 'Keuangan', color: '#B8956A', bg: '#FFF5E8' },
}

// ── Score dimension config ────────────────────────────────────────────────────

export const DIMENSIONS = ['communication', 'intimacy', 'support', 'fun', 'effort'] as const
export type Dimension = (typeof DIMENSIONS)[number]

export const DIMENSION_LABELS: Record<Dimension, string> = {
  communication: 'Komunikasi',
  intimacy:      'Intimasi',
  support:       'Support',
  fun:           'Kesenangan',
  effort:        'Usaha',
}

// ── Habit completion % ────────────────────────────────────────────────────────

export function habitCompletionThisWeek(completedDays: string[]): number {
  const d = new Date()
  const weekDates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(d)
    day.setDate(d.getDate() - i)
    weekDates.push(day.toISOString().split('T')[0])
  }
  const done = weekDates.filter((date) => completedDays.includes(date)).length
  return Math.round((done / 7) * 100)
}

export function weeklyDates() {
  const d = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(d)
    day.setDate(d.getDate() - i)
    dates.push(day.toISOString().split('T')[0])
  }
  return dates
}

export function isPartnerActiveToday(args: {
  partner: 'A' | 'B'
  todayDate: string
  moodHistory: { date: string; partner: 'A' | 'B' }[]
  habits: { partner: 'A' | 'B'; completedDays: string[] }[]
}) {
  const hasMood = args.moodHistory.some((m) => m.partner === args.partner && m.date === args.todayDate)
  const hasHabit = args.habits.some((h) => h.partner === args.partner && h.completedDays.includes(args.todayDate))
  return hasMood || hasHabit
}

/**
 * PRD §5.1 — Streak risk:
 * "at-risk"  → salah satu/kedua belum aktif hari ini
 * "buffer"   → kemarin juga salah satu tidak aktif (streak break besok)
 * "safe"     → keduanya aktif hari ini
 */
export function streakRiskStatus(args: {
  todayDate: string
  moodHistory: { date: string; partner: 'A' | 'B' }[]
  habits: { partner: 'A' | 'B'; completedDays: string[] }[]
}): 'safe' | 'at-risk' | 'buffer' {
  const { todayDate, moodHistory, habits } = args

  // Yesterday
  const yd = new Date(todayDate + 'T00:00:00')
  yd.setDate(yd.getDate() - 1)
  const yesterdayDate = yd.toISOString().split('T')[0]

  const activeA_today     = isPartnerActiveToday({ partner: 'A', todayDate, moodHistory, habits })
  const activeB_today     = isPartnerActiveToday({ partner: 'B', todayDate, moodHistory, habits })
  const activeA_yesterday = isPartnerActiveToday({ partner: 'A', todayDate: yesterdayDate, moodHistory, habits })
  const activeB_yesterday = isPartnerActiveToday({ partner: 'B', todayDate: yesterdayDate, moodHistory, habits })

  if (activeA_today && activeB_today) return 'safe'

  // Both missed yesterday AND one/both not active today → buffer used, streak will break tomorrow
  const missedYesterday = !activeA_yesterday || !activeB_yesterday
  if (missedYesterday) return 'buffer'

  return 'at-risk'
}

/**
 * Checks if streak should be broken based on recent activity.
 * Returns the new streak value.
 * PRD: "Break kalau salah satu ga engage 2 hari berturut-turut (buffer 1 hari)"
 */
export function computeStreakDecrement(args: {
  currentStreak: number
  todayDate: string
  moodHistory: { date: string; partner: 'A' | 'B' }[]
  habits: { partner: 'A' | 'B'; completedDays: string[] }[]
}): number {
  const { currentStreak, todayDate, moodHistory, habits } = args
  if (currentStreak === 0) return 0

  const yd  = new Date(todayDate + 'T00:00:00'); yd.setDate(yd.getDate() - 1)
  const yd2 = new Date(todayDate + 'T00:00:00'); yd2.setDate(yd2.getDate() - 2)
  const yesterday  = yd.toISOString().split('T')[0]
  const dayBefore  = yd2.toISOString().split('T')[0]

  const miss1A = !isPartnerActiveToday({ partner: 'A', todayDate: yesterday, moodHistory, habits })
  const miss1B = !isPartnerActiveToday({ partner: 'B', todayDate: yesterday, moodHistory, habits })
  const miss2A = !isPartnerActiveToday({ partner: 'A', todayDate: dayBefore,  moodHistory, habits })
  const miss2B = !isPartnerActiveToday({ partner: 'B', todayDate: dayBefore,  moodHistory, habits })

  // Streak breaks if one partner missed both yesterday AND day before (2 consecutive days)
  const streakBroken = (miss1A && miss2A) || (miss1B && miss2B)
  return streakBroken ? 0 : currentStreak
}
