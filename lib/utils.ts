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
