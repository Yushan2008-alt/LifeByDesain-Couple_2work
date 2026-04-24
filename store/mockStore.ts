'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// TYPES
// ============================================================

export type MoodEmoji = '😊' | '😄' | '🥰' | '😐' | '😔' | '😤' | '💕' | '😴' | '🌸' | '✨' | '😅' | '😌'
export type MoodTag   = 'work' | 'family' | 'health' | 'intimacy' | 'stress' | 'joy' | 'tired' | 'peaceful' | 'excited'
export type TodoCategory = 'home' | 'errands' | 'social' | 'plans' | 'finances'

// ── Relationship Context ──────────────────────────────────────────────────────
export interface RelationshipContext {
  duration: string  // '< 6 bulan' | '6 bulan - 1 tahun' | '1-2 tahun' | '2-5 tahun' | '5+ tahun'
  stage: string     // 'Pacaran' | 'Tunangan' | 'Menikah' | 'LDR'
  focus: string     // first-week focus option
}

export interface MoodEntry {
  id: string
  date: string       // YYYY-MM-DD
  dayLabel: string   // 'Sen', 'Sel', etc.
  emoji: MoodEmoji
  intensity: number  // 1-5
  tags: MoodTag[]
  partner: 'A' | 'B'
}

export interface Habit {
  id: string
  label: string
  icon: string
  partner: 'A' | 'B'
  completedDays: string[]
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  category: TodoCategory
  createdBy: 'A' | 'B'
  createdAt: string
}

export interface EmotionDump {
  id: string
  date: string
  rawText: string
  refinedText: string | null
  shared: boolean
  partner: 'A' | 'B'
}

export interface Score360 {
  id: string
  week: string // 'YYYY-WW' | 'W-prev' | 'W-current'
  partner: 'A' | 'B'
  // Self-perception: "saya rasa hubungan kita di dimensi X berapa"
  self: {
    communication: number
    intimacy: number
    support: number
    fun: number
    effort: number
  }
  // Perceived-partner: "saya pikir pasangan saya ngerasa dimensi X berapa"
  perceived: {
    communication: number
    intimacy: number
    support: number
    fun: number
    effort: number
  }
}

type BaselineScore = Score360['self']

export interface WeeklyWin {
  id: string
  text: string
  type: 'relationship' | 'individual'
  partner: 'A' | 'B'
  week?: string
}

// ── NEW: Private Journal ──────────────────────────────────────────────────────
export interface Journal {
  id: string
  date: string       // YYYY-MM-DD
  text: string
  partner: 'A' | 'B'
}

// ── NEW: Weekly Commitment / Action Items ─────────────────────────────────────
export interface Commitment {
  id: string
  week: string       // 'W-prev' | 'W-current' | etc.
  text: string
  partner: 'A' | 'B' | 'both'
  done: boolean
  createdBy: 'A' | 'B'
}

// ============================================================
// HELPERS — generate dates relative to today
// ============================================================

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}${crypto.randomUUID()}`
  }
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function buildDummyData() {
  const today = new Date()
  const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  function ago(daysAgo: number) {
    const d = new Date(today)
    d.setDate(d.getDate() - daysAgo)
    return { date: d.toISOString().split('T')[0], dayLabel: DAY_LABELS[d.getDay()] }
  }

  // ─── Mood History (14 days × 2 partners, dengan pola low Rabu-Kamis) ──────
  // Partner A: pattern low di tengah minggu (Rabu/Kamis) karena kerja
  // Partner B: lebih stabil, naik di akhir pekan
  const moodHistory: MoodEntry[] = [
    // 2 minggu lalu
    { id: 'm0a', ...ago(13), emoji: '😊',  intensity: 3, tags: ['work'],              partner: 'A' },
    { id: 'm0b', ...ago(13), emoji: '😌',  intensity: 3, tags: ['peaceful'],          partner: 'B' },
    { id: 'm1a', ...ago(12), emoji: '😔',  intensity: 2, tags: ['stress', 'work'],    partner: 'A' },
    { id: 'm1b', ...ago(12), emoji: '😐',  intensity: 3, tags: ['tired'],             partner: 'B' },
    { id: 'm2a', ...ago(11), emoji: '😤',  intensity: 1, tags: ['stress', 'work'],    partner: 'A' }, // Rabu low
    { id: 'm2b', ...ago(11), emoji: '😔',  intensity: 2, tags: ['tired'],             partner: 'B' },
    { id: 'm3a', ...ago(10), emoji: '😔',  intensity: 2, tags: ['stress'],            partner: 'A' }, // Kamis low
    { id: 'm3b', ...ago(10), emoji: '🥰',  intensity: 4, tags: ['intimacy'],          partner: 'B' },
    { id: 'm4a', ...ago(9),  emoji: '😊',  intensity: 4, tags: ['joy'],              partner: 'A' },
    { id: 'm4b', ...ago(9),  emoji: '💕',  intensity: 5, tags: ['intimacy', 'joy'],  partner: 'B' },

    // Minggu ini
    { id: 'm5a', ...ago(6),  emoji: '😊',  intensity: 3, tags: ['work'],              partner: 'A' },
    { id: 'm5b', ...ago(6),  emoji: '😄',  intensity: 4, tags: ['joy'],              partner: 'B' },
    { id: 'm6a', ...ago(5),  emoji: '😔',  intensity: 2, tags: ['stress', 'work'],   partner: 'A' },
    { id: 'm6b', ...ago(5),  emoji: '😐',  intensity: 3, tags: ['tired'],            partner: 'B' },
    { id: 'm7a', ...ago(4),  emoji: '😤',  intensity: 2, tags: ['stress', 'work'],   partner: 'A' }, // Rabu low (lagi)
    { id: 'm7b', ...ago(4),  emoji: '😔',  intensity: 2, tags: ['tired', 'stress'],  partner: 'B' },
    { id: 'm8a', ...ago(3),  emoji: '😐',  intensity: 3, tags: ['work'],             partner: 'A' }, // Kamis mulai recovery
    { id: 'm8b', ...ago(3),  emoji: '🥰',  intensity: 4, tags: ['intimacy'],         partner: 'B' },
    { id: 'm9a', ...ago(2),  emoji: '🥰',  intensity: 5, tags: ['intimacy', 'joy'],  partner: 'A' },
    { id: 'm9b', ...ago(2),  emoji: '🌸',  intensity: 4, tags: ['peaceful'],         partner: 'B' },
    { id: 'm10a',...ago(1),  emoji: '😊',  intensity: 4, tags: ['joy'],              partner: 'A' },
    { id: 'm10b',...ago(1),  emoji: '💕',  intensity: 5, tags: ['intimacy', 'joy'],  partner: 'B' },
  ]

  // ─── Habits ─────────────────────────────────────────────
  const habits: Habit[] = [
    { id: 'h1',  label: 'Olahraga',    icon: '🏃',   partner: 'A', completedDays: [ago(12).date, ago(9).date, ago(5).date, ago(3).date, ago(1).date] },
    { id: 'h2',  label: 'Baca Buku',   icon: '📚',   partner: 'A', completedDays: [ago(13).date, ago(12).date, ago(10).date, ago(6).date, ago(5).date, ago(2).date] },
    { id: 'h3',  label: 'Meditasi',    icon: '🧘',   partner: 'A', completedDays: [ago(13).date, ago(11).date, ago(9).date, ago(6).date, ago(4).date, ago(2).date, ago(1).date] },
    { id: 'h4',  label: 'Tidur Cukup', icon: '😴',   partner: 'A', completedDays: [ago(13).date, ago(12).date, ago(9).date, ago(6).date, ago(3).date] },
    { id: 'h5',  label: 'Minum Air',   icon: '💧',   partner: 'A', completedDays: [ago(13).date, ago(12).date, ago(11).date, ago(9).date, ago(6).date, ago(5).date, ago(4).date, ago(2).date] },
    { id: 'h6',  label: 'Yoga',        icon: '🧘‍♀️', partner: 'B', completedDays: [ago(13).date, ago(12).date, ago(11).date, ago(9).date, ago(6).date, ago(5).date, ago(1).date] },
    { id: 'h7',  label: 'Jurnal',      icon: '📝',   partner: 'B', completedDays: [ago(13).date, ago(11).date, ago(10).date, ago(8).date, ago(6).date, ago(4).date, ago(3).date, ago(1).date] },
    { id: 'h8',  label: 'Baca',        icon: '📖',   partner: 'B', completedDays: [ago(12).date, ago(10).date, ago(8).date, ago(5).date, ago(3).date, ago(2).date] },
    { id: 'h9',  label: 'Olahraga',    icon: '🏋️',  partner: 'B', completedDays: [ago(13).date, ago(11).date, ago(9).date, ago(6).date, ago(4).date, ago(2).date] },
    { id: 'h10', label: 'Minum Air',   icon: '💧',   partner: 'B', completedDays: [ago(13).date, ago(12).date, ago(11).date, ago(10).date, ago(8).date, ago(6).date, ago(5).date, ago(4).date, ago(3).date] },
  ]

  // ─── Shared To-dos ───────────────────────────────────────
  const todos: Todo[] = [
    { id: 't1', text: 'Bayar listrik bulan ini',       completed: false, category: 'finances', createdBy: 'A', createdAt: ago(3).date },
    { id: 't2', text: 'Beli bahan masak weekend',      completed: true,  category: 'home',     createdBy: 'B', createdAt: ago(2).date },
    { id: 't3', text: 'Buat rencana liburan Juni',     completed: false, category: 'plans',    createdBy: 'A', createdAt: ago(1).date },
    { id: 't4', text: 'Dinner sama keluarga Sabtu',    completed: false, category: 'social',   createdBy: 'B', createdAt: ago(1).date },
    { id: 't5', text: 'Servis mobil',                  completed: true,  category: 'errands',  createdBy: 'A', createdAt: ago(5).date },
    { id: 't6', text: 'Beli kado ultah mama',          completed: false, category: 'social',   createdBy: 'B', createdAt: ago(2).date },
  ]

  // ─── Emotion Dumps ───────────────────────────────────────
  // e1: sudah di-refine (menunjukkan full flow di demo)
  // e2: belum di-refine (menunggu di Step 2)
  const emotionDumps: EmotionDump[] = [
    {
      id: 'e1',
      date: ago(4).date,
      rawText: 'Rasanya kamu ga pernah dengerin aku waktu aku cerita soal kerja. Aku udah cerita panjang tapi kayak kamu sibuk sama HP mulu.',
      refinedText: 'Aku merasa sangat ingin didengar saat berbagi cerita tentang hari-hariku. Bagiku, punya waktu fokus bareng tanpa distraksi itu sangat berarti — bisa kita coba prioritasin lebih sering? 💛',
      shared: false,
      partner: 'A',
    },
    {
      id: 'e2',
      date: ago(2).date,
      rawText: 'Aku ngerasa kamu lebih banyak perhatiin temen-temen kamu daripada waktu kita. Tiap weekend pasti ada aja alasan keluar sama mereka.',
      refinedText: null,
      shared: false,
      partner: 'B',
    },
    {
      id: 'e3',
      date: ago(1).date,
      rawText: 'Aku capek banget dan ngerasa sendirian ngurusin semua urusan rumah. Rasanya aku yang selalu inisiatif tapi ga pernah diapresiasi.',
      refinedText: null,
      shared: false,
      partner: 'A',
    },
  ]

  // ─── 360 Scores ─────────────────────────────────────────
  // W-prev: ada gap bermakna untuk di-demonstrasikan
  // self = persepsi diri, perceived = tebakan tentang pasangan
  const scores: Score360[] = [
    {
      id: 's1', week: 'W-prev',
      partner: 'A',
      self:      { communication: 6, intimacy: 8, support: 7, fun: 6, effort: 8 },
      perceived: { communication: 7, intimacy: 7, support: 8, fun: 7, effort: 7 }, // A's guess of B's self-score
    },
    {
      id: 's2', week: 'W-prev',
      partner: 'B',
      self:      { communication: 8, intimacy: 7, support: 8, fun: 7, effort: 7 },
      perceived: { communication: 5, intimacy: 8, support: 6, fun: 6, effort: 8 }, // B's guess of A's self-score
    },
  ]
  // Gap analysis W-prev: A.self.communication=6 vs B.perceived[A]=5 → gap 1 (B lumayan akurat)
  // A.self.support=7 vs B.perceived[A].support=6 → gap 1
  // B.self.communication=8 vs A.perceived[B]=7 → gap 1 (A lumayan akurat)
  // Ini akan terlihat di radar chart sebagai insight: B sedikit underestimate A di komunikasi

  // ─── Weekly Wins ─────────────────────────────────────────
  const wins: WeeklyWin[] = [
    { id: 'w1', text: 'Kita masak makan malam bareng 3 hari berturut-turut! 🍳', type: 'relationship', partner: 'A', week: 'W-prev' },
    { id: 'w2', text: 'Aku berhasil olahraga 4x minggu ini!', type: 'individual', partner: 'A', week: 'W-prev' },
    { id: 'w3', text: 'Quality conversation tanpa distraksi HP kemarin malam 🌙', type: 'relationship', partner: 'B', week: 'W-prev' },
    { id: 'w4', text: 'Aku akhirnya mulai rutin meditasi pagi! 🧘', type: 'individual', partner: 'B', week: 'W-prev' },
  ]

  // ─── NEW: Weekly Commitments (action items dari ritual sebelumnya) ─────────
  const commitments: Commitment[] = [
    {
      id: 'c1', week: 'W-prev',
      text: 'Date night tanpa HP tiap Jumat malam',
      partner: 'both', done: true, createdBy: 'A',
    },
    {
      id: 'c2', week: 'W-prev',
      text: 'Tanya kabar satu sama lain saat pulang kerja, dengarkan dengan penuh perhatian',
      partner: 'both', done: true, createdBy: 'B',
    },
    {
      id: 'c3', week: 'W-prev',
      text: 'Aku akan lebih fokus dan hadir saat kamu cerita tentang kerjaan',
      partner: 'A', done: false, createdBy: 'A',
    },
    {
      id: 'c4', week: 'W-prev',
      text: 'Jadwalkan setidaknya 1 weekend khusus berdua bulan ini',
      partner: 'B', done: false, createdBy: 'B',
    },
  ]

  // ─── NEW: Private Journals ────────────────────────────────
  const journals: Journal[] = [
    {
      id: 'j1',
      date: ago(3).date,
      text: 'Hari ini cukup berat di kantor, tapi waktu pulang dan lihat dia langsung kerasa lega. Syukur punya tempat pulang yang hangat 🌸',
      partner: 'A',
    },
    {
      id: 'j2',
      date: ago(1).date,
      text: 'Kita akhirnya ngobrol panjang semalam. Banyak yang ternyata kita belum paham dari satu sama lain. Tapi justru itu bikin excited buat terus belajar. 💛',
      partner: 'B',
    },
  ]

  return { moodHistory, habits, todos, emotionDumps, scores, wins, commitments, journals }
}

// ============================================================
// AI SIMULATION
// ============================================================

const AI_EXAMPLES: { keywords: string[]; refined: string }[] = [
  {
    keywords: ['dengerin', 'hp', 'cerita'],
    refined: 'Aku merasa sangat ingin didengar saat berbagi cerita tentang hari-hariku. Bagiku, punya waktu fokus bareng tanpa distraksi itu sangat berarti — bisa kita coba prioritasin lebih sering? 💛',
  },
  {
    keywords: ['temen', 'weekend', 'perhatiin'],
    refined: 'Aku rindu waktu kita berdua yang berkualitas, terutama di weekend. Aku ngerasa lebih terhubung kalau kita bisa luangkan waktu just the two of us secara rutin. Bisa kita jadwalkan ini? 🌿',
  },
  {
    keywords: ['capek', 'sendirian', 'inisiatif', 'apresiasi'],
    refined: 'Aku merasa sedikit kewalahan belakangan ini dan rindu diakui untuk hal-hal kecil yang aku lakukan. Bukan butuh validasi besar — kadang cukup "makasih ya udah jaga kita" sudah sangat berarti. 🌸',
  },
  {
    keywords: ['ga pernah', 'tidak', 'gak pernah'],
    refined: 'Aku merasa ada kebutuhan yang belum terpenuhi dan aku ingin banget kita bisa ngobrol soal ini lebih terbuka. Bukan soal salah siapa, tapi gimana kita bisa lebih baik bareng. 💬',
  },
  {
    keywords: ['capek', 'lelah', 'sendiri'],
    refined: 'Minggu ini aku ngerasa butuh sedikit lebih banyak dukungan dan koneksi. Bukan karena kamu kurang — aku cuma lagi butuh lebih banyak kehadiran kamu. Boleh kita luangkan waktu tenang bareng? 🌸',
  },
]

export function simulateAIRefine(rawText: string): string {
  const lower = rawText.toLowerCase()
  for (const example of AI_EXAMPLES) {
    const matched = example.keywords.filter(k => lower.includes(k))
    if (matched.length >= 1) return example.refined
  }
  // Generic fallback transformation
  let result = rawText
    .replace(/\b(kamu|lu)\s+(ga|gak|tidak|nggak)\s+pernah\b/gi, 'aku ingin lebih sering')
    .replace(/\b(kamu|lu)\s+selalu\b/gi, 'aku berharap kita bisa lebih sering')
    .replace(/\b(kamu|lu)\s+gak\b/gi, 'aku merasa kurang')
    .replace(/\bkamu\b/gi, 'kita')
  return (
    result +
    '\n\n— diungkapkan dengan cinta, bukan menyalahkan. Aku sayang kamu. 💛'
  )
}

// ── NEW: Self-Suggestion AI dari pola mood ────────────────────────────────────
export function generateSelfSuggestion(
  moodHistory: MoodEntry[],
  partner: 'A' | 'B',
): string | null {
  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const recent = moodHistory.filter((m) => m.partner === partner).slice(-14)
  if (recent.length < 3) return null

  const lowMoods = recent.filter((m) => m.intensity <= 2)

  // Cek pola hari dengan mood low berulang
  if (lowMoods.length >= 2) {
    const dayCounts: Record<number, number> = {}
    lowMoods.forEach((m) => {
      const dow = new Date(m.date + 'T00:00:00').getDay()
      dayCounts[dow] = (dayCounts[dow] || 0) + 1
    })
    const sorted = Object.entries(dayCounts).sort((a, b) => +b[1] - +a[1])
    if (sorted.length && +sorted[0][1] >= 2) {
      const dayName = DAY_NAMES[+sorted[0][0]]
      return `Mood kamu cenderung lebih rendah di hari ${dayName} — ini muncul ${sorted[0][1]}x dalam 2 minggu terakhir. Mungkin worth check apa yang biasanya terjadi di hari itu dan apakah ada yang bisa disesuaikan? 💛`
    }
  }

  // Cek dominasi tag stres/kerja
  const stressCount = recent.filter((m) =>
    m.tags.some((t) => t === 'stress' || t === 'work')
  ).length
  if (stressCount >= 4) {
    return `Minggu ini kamu sering tag 'kerja' atau 'stres' — terdeteksi ${stressCount}x. Pattern ini worth diperhatikan. Ada yang bisa disesuaikan di rutinitas atau beban kerja minggu ini? 🌿`
  }

  // Rata-rata intensitas rendah
  const avgIntensity = recent.reduce((sum, m) => sum + m.intensity, 0) / recent.length
  if (avgIntensity < 2.8) {
    return `Rata-rata intensitas mood kamu minggu ini cukup rendah (${avgIntensity.toFixed(1)}/5). Yuk luangkan sedikit waktu untuk self-care yang kamu butuhkan. Kamu udah kerja keras! 🌸`
  }

  return null
}

// ============================================================
// STORE INTERFACE
// ============================================================

interface MockStore {
  // Couple
  coupleId: string
  inviteToken: string
  partnerA: { name: string; joined: boolean }
  partnerB: { name: string; joined: boolean }

  // Daily
  moodHistory: MoodEntry[]
  habits: Habit[]
  todos: Todo[]
  streak: number

  // Private
  journals: Journal[]

  // Weekly
  emotionDumps: EmotionDump[]
  scores: Score360[]
  wins: WeeklyWin[]
  commitments: Commitment[]
  activeWeeklyStep: number

  // Premium
  isPremium: boolean
  // Relationship context (set during onboarding)
  relationshipContext: RelationshipContext | null
  // Achievement/milestone IDs
  achievements: string[]
  // Weekly ritual completion counter (for "progress to premium value" nudge)
  weeklyRitualsCompleted: number
  // Reminder opt-in channels
  reminderOptIn: { email: boolean; push: boolean }

  // ── Actions ──────────────────────────────────────────────
  setPartnerAName: (name: string) => void
  joinAsPartnerB: (name: string) => void

  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void
  toggleHabit: (habitId: string, date: string) => void
  addHabit: (label: string, icon: string, partner: 'A' | 'B') => void
  removeHabit: (habitId: string) => void
  addTodo: (text: string, category: TodoCategory, createdBy: 'A' | 'B') => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void

  addJournal: (text: string, partner: 'A' | 'B') => void

  addEmotionDump: (text: string, partner: 'A' | 'B') => void
  setRefinedText: (id: string, refinedText: string) => void
  shareEmotionDump: (id: string) => void
  upsertScore: (score: Omit<Score360, 'id'>) => void
  setBaseline360: (baseline: { partnerA: BaselineScore; partnerB: BaselineScore } | null) => void
  addWin: (text: string, type: WeeklyWin['type'], partner: 'A' | 'B') => void

  addCommitment: (text: string, partner: Commitment['partner'], createdBy: 'A' | 'B', week: string) => void
  toggleCommitment: (id: string) => void

  setActiveWeeklyStep: (step: number) => void

  setPremium: (val: boolean) => void
  setRelationshipContext: (ctx: RelationshipContext) => void
  unlockAchievement: (id: string) => void
  incrementWeeklyRitualsCompleted: () => void
  setReminderOptIn: (channel: 'email' | 'push', val: boolean) => void

  reset: () => void
}

// ============================================================
// INITIAL STATE FACTORY
// ============================================================

function createInitialState() {
  const dummy = buildDummyData()
  return {
    coupleId: 'couple_demo_001',
    inviteToken: 'LBD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    partnerA: { name: '', joined: false },
    partnerB: { name: '', joined: false },
    streak: 12, // 12 hari konsisten — lebih impressive untuk demo
    activeWeeklyStep: 0,
    isPremium: false,
    relationshipContext: null,
    // Pre-unlock beberapa achievements untuk demo yang lebih engaging
    achievements: ['first_mood', 'streak_7', 'first_weekly_ritual'],
    // 2 rituals completed → user is 1 away from "unlock deep trend" (creates urgency)
    weeklyRitualsCompleted: 2,
    reminderOptIn: { email: false, push: false },
    ...dummy,
  }
}

// ============================================================
// ZUSTAND STORE
// ============================================================

export const useMockStore = create<MockStore>()(
  persist(
    (set) => ({
      ...createInitialState(),

      // ── Couple ─────────────────────────────────────────
      setPartnerAName: (name) =>
        set((s) => ({ partnerA: { ...s.partnerA, name, joined: true } })),
      joinAsPartnerB: (name) =>
        set(() => ({ partnerB: { name, joined: true } })),

      // ── Daily ──────────────────────────────────────────
      addMoodEntry: (entry) =>
        set((s) => ({ moodHistory: [...s.moodHistory, { ...entry, id: 'm' + Date.now() }] })),

      toggleHabit: (habitId, date) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h
            const done = h.completedDays.includes(date)
            return {
              ...h,
              completedDays: done
                ? h.completedDays.filter((d) => d !== date)
                : [...h.completedDays, date],
            }
          }),
        })),

      addHabit: (label, icon, partner) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { id: 'h' + Date.now(), label, icon, partner, completedDays: [] },
          ],
        })),

      removeHabit: (habitId) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== habitId) })),

      addTodo: (text, category, createdBy) =>
        set((s) => ({
          todos: [
            ...s.todos,
            { id: 't' + Date.now(), text, completed: false, category, createdBy, createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),

      toggleTodo: (id) =>
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) })),

      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      // ── Private Journal ────────────────────────────────
      addJournal: (text, partner) =>
        set((s) => ({
          journals: [
            ...s.journals,
            { id: 'j' + Date.now(), date: new Date().toISOString().split('T')[0], text, partner },
          ],
        })),

      // ── Weekly ─────────────────────────────────────────
      addEmotionDump: (text, partner) =>
        set((s) => ({
          emotionDumps: [
            ...s.emotionDumps,
            { id: 'e' + Date.now(), date: new Date().toISOString().split('T')[0], rawText: text, refinedText: null, shared: false, partner },
          ],
        })),

      setRefinedText: (id, refinedText) =>
        set((s) => ({ emotionDumps: s.emotionDumps.map((e) => (e.id === id ? { ...e, refinedText } : e)) })),

      shareEmotionDump: (id) =>
        set((s) => ({ emotionDumps: s.emotionDumps.map((e) => (e.id === id ? { ...e, shared: true } : e)) })),

      upsertScore: (score) =>
        set((s) => ({
          scores: [
            ...s.scores.filter((sc) => !(sc.week === score.week && sc.partner === score.partner)),
            { ...score, id: 's' + Date.now() },
          ],
        })),

      setBaseline360: (baseline) =>
        set((s) => {
          const scoresWithoutBaseline = s.scores.filter((sc) => sc.week !== 'W-baseline')
          if (!baseline) return { scores: scoresWithoutBaseline }

          return {
            scores: [
              ...scoresWithoutBaseline,
              {
                id: generateId('s-baseline-a-'),
                week: 'W-baseline',
                partner: 'A',
                self: baseline.partnerA,
                // Baseline capture only asks self-score, so we mirror to perceived as neutral placeholder.
                perceived: baseline.partnerA,
              },
              {
                id: generateId('s-baseline-b-'),
                week: 'W-baseline',
                partner: 'B',
                self: baseline.partnerB,
                // Baseline capture only asks self-score, so we mirror to perceived as neutral placeholder.
                perceived: baseline.partnerB,
              },
            ],
          }
        }),

      addWin: (text, type, partner) =>
        set((s) => ({ wins: [...s.wins, { id: 'w' + Date.now(), text, type, partner, week: 'W-current' }] })),

      addCommitment: (text, partner, createdBy, week) =>
        set((s) => ({
          commitments: [
            ...s.commitments,
            { id: 'c' + Date.now(), week, text, partner, done: false, createdBy },
          ],
        })),

      toggleCommitment: (id) =>
        set((s) => ({
          commitments: s.commitments.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
        })),

      setActiveWeeklyStep: (step) => set({ activeWeeklyStep: step }),

      setPremium: (val) => set({ isPremium: val }),
      setRelationshipContext: (ctx) => set({ relationshipContext: ctx }),
      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.includes(id)
            ? s.achievements
            : [...s.achievements, id],
        })),
      incrementWeeklyRitualsCompleted: () =>
        set((s) => ({ weeklyRitualsCompleted: s.weeklyRitualsCompleted + 1 })),
      setReminderOptIn: (channel, val) =>
        set((s) => ({ reminderOptIn: { ...s.reminderOptIn, [channel]: val } })),

      // ── Reset ──────────────────────────────────────────
      reset: () => set(createInitialState()),
    }),
    {
      name: 'lifebydesign-mock-store',
      version: 2, // bump version agar localStorage lama tidak konflik
      // Prevent SSR from touching localStorage — rehydrate manually client-side
      skipHydration: true,
    }
  )
)
