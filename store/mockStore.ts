'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// TYPES
// ============================================================

export type MoodEmoji = '😊' | '😄' | '🥰' | '😐' | '😔' | '😤' | '💕' | '😴' | '🌸' | '✨' | '😅' | '😌'
export type MoodTag   = 'work' | 'family' | 'health' | 'intimacy' | 'stress' | 'joy' | 'tired' | 'peaceful' | 'excited'
export type TodoCategory = 'home' | 'errands' | 'social' | 'plans' | 'finances'

export interface MoodEntry {
  id: string
  date: string      // YYYY-MM-DD
  dayLabel: string  // 'Sen', 'Sel', etc.
  emoji: MoodEmoji
  intensity: number // 1-5
  tags: MoodTag[]
  partner: 'A' | 'B'
}

export interface Habit {
  id: string
  label: string
  icon: string
  partner: 'A' | 'B'
  completedDays: string[] // date strings
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
  week: string // 'YYYY-WW'
  partner: 'A' | 'B'
  self: {
    communication: number
    intimacy: number
    support: number
    fun: number
    effort: number
  }
  perceived: {
    communication: number
    intimacy: number
    support: number
    fun: number
    effort: number
  }
}

export interface WeeklyWin {
  id: string
  text: string
  type: 'relationship' | 'individual'
  partner: 'A' | 'B'
}

export type ScoreVector = {
  communication: number
  intimacy: number
  support: number
  fun: number
  effort: number
}

// ============================================================
// HELPERS — generate dates relative to today
// ============================================================

function buildDummyData() {
  const today = new Date()
  const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  function ago(daysAgo: number) {
    const d = new Date(today)
    d.setDate(d.getDate() - daysAgo)
    return { date: d.toISOString().split('T')[0], dayLabel: DAY_LABELS[d.getDay()] }
  }

  // ─── Mood History (7 days × 2 partners) ─────────────────
  const moodHistory: MoodEntry[] = [
    { id: 'm1',  ...ago(6), emoji: '😊',  intensity: 3, tags: ['work'],            partner: 'A' },
    { id: 'm2',  ...ago(6), emoji: '😄',  intensity: 4, tags: ['joy'],             partner: 'B' },
    { id: 'm3',  ...ago(5), emoji: '😔',  intensity: 2, tags: ['stress','work'],   partner: 'A' },
    { id: 'm4',  ...ago(5), emoji: '😐',  intensity: 3, tags: ['tired'],           partner: 'B' },
    { id: 'm5',  ...ago(4), emoji: '😤',  intensity: 2, tags: ['stress'],          partner: 'A' },
    { id: 'm6',  ...ago(4), emoji: '😔',  intensity: 2, tags: ['tired','stress'],  partner: 'B' },
    { id: 'm7',  ...ago(3), emoji: '😐',  intensity: 3, tags: ['work'],            partner: 'A' },
    { id: 'm8',  ...ago(3), emoji: '🥰',  intensity: 4, tags: ['intimacy'],        partner: 'B' },
    { id: 'm9',  ...ago(2), emoji: '🥰',  intensity: 5, tags: ['intimacy','joy'],  partner: 'A' },
    { id: 'm10', ...ago(2), emoji: '🌸',  intensity: 4, tags: ['peaceful'],        partner: 'B' },
    { id: 'm11', ...ago(1), emoji: '😊',  intensity: 4, tags: ['joy'],             partner: 'A' },
    { id: 'm12', ...ago(1), emoji: '💕',  intensity: 5, tags: ['intimacy','joy'],  partner: 'B' },
  ]

  // ─── Habits ─────────────────────────────────────────────
  const habits: Habit[] = [
    { id: 'h1',  label: 'Olahraga',   icon: '🏃',   partner: 'A', completedDays: [ago(5).date, ago(3).date, ago(1).date] },
    { id: 'h2',  label: 'Baca Buku',  icon: '📚',   partner: 'A', completedDays: [ago(6).date, ago(5).date, ago(4).date, ago(2).date] },
    { id: 'h3',  label: 'Meditasi',   icon: '🧘',   partner: 'A', completedDays: [ago(6).date, ago(4).date, ago(2).date, ago(1).date] },
    { id: 'h4',  label: 'Tidur Cukup',icon: '😴',   partner: 'A', completedDays: [ago(6).date, ago(5).date, ago(3).date] },
    { id: 'h5',  label: 'Minum Air',  icon: '💧',   partner: 'A', completedDays: [ago(6).date, ago(5).date, ago(4).date, ago(3).date, ago(2).date] },
    { id: 'h6',  label: 'Yoga',       icon: '🧘‍♀️',  partner: 'B', completedDays: [ago(6).date, ago(5).date, ago(4).date, ago(1).date] },
    { id: 'h7',  label: 'Jurnal',     icon: '📝',   partner: 'B', completedDays: [ago(6).date, ago(4).date, ago(3).date, ago(1).date] },
    { id: 'h8',  label: 'Baca',       icon: '📖',   partner: 'B', completedDays: [ago(5).date, ago(3).date, ago(2).date] },
    { id: 'h9',  label: 'Olahraga',   icon: '🏋️',  partner: 'B', completedDays: [ago(6).date, ago(4).date, ago(2).date] },
    { id: 'h10', label: 'Minum Air',  icon: '💧',   partner: 'B', completedDays: [ago(6).date, ago(5).date, ago(4).date, ago(3).date] },
  ]

  // ─── Shared To-dos ───────────────────────────────────────
  const todos: Todo[] = [
    { id: 't1', text: 'Bayar listrik bulan ini',        completed: false, category: 'finances', createdBy: 'A', createdAt: ago(3).date },
    { id: 't2', text: 'Beli bahan masak weekend',       completed: true,  category: 'home',     createdBy: 'B', createdAt: ago(2).date },
    { id: 't3', text: 'Buat rencana liburan Juni',      completed: false, category: 'plans',    createdBy: 'A', createdAt: ago(1).date },
    { id: 't4', text: 'Dinner sama keluarga Sabtu',     completed: false, category: 'social',   createdBy: 'B', createdAt: ago(1).date },
    { id: 't5', text: 'Servis mobil',                   completed: true,  category: 'errands',  createdBy: 'A', createdAt: ago(5).date },
  ]

  // ─── Emotion Dumps ───────────────────────────────────────
  const emotionDumps: EmotionDump[] = [
    {
      id: 'e1',
      date: ago(4).date,
      rawText: 'Rasanya kamu ga pernah dengerin aku waktu aku cerita soal kerja. Aku udah cerita panjang tapi kayak kamu sibuk sama HP mulu.',
      refinedText: null,
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
  ]

  // ─── 360 Scores ─────────────────────────────────────────
  const scores: Score360[] = [
    {
      id: 's1', week: 'W-prev',
      partner: 'A',
      self:      { communication: 7, intimacy: 8, support: 8, fun: 6, effort: 7 },
      perceived: { communication: 6, intimacy: 7, support: 9, fun: 7, effort: 8 },
    },
    {
      id: 's2', week: 'W-prev',
      partner: 'B',
      self:      { communication: 6, intimacy: 7, support: 7, fun: 8, effort: 8 },
      perceived: { communication: 7, intimacy: 8, support: 8, fun: 6, effort: 7 },
    },
  ]

  // ─── Weekly Wins ─────────────────────────────────────────
  const wins: WeeklyWin[] = [
    { id: 'w1', text: 'Kita masak makan malam bareng 3 hari berturut-turut! 🍳', type: 'relationship', partner: 'A' },
    { id: 'w2', text: 'Aku berhasil olahraga 4x minggu ini!', type: 'individual', partner: 'A' },
    { id: 'w3', text: 'Quality conversation tanpa distraksi HP kemarin 🌙', type: 'relationship', partner: 'B' },
  ]

  return { moodHistory, habits, todos, emotionDumps, scores, wins }
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

  // Weekly
  emotionDumps: EmotionDump[]
  scores: Score360[]
  wins: WeeklyWin[]
  activeWeeklyStep: number
  weeklyCompletions: number
  trialStarted: boolean
  reminderOptIn: boolean
  baseline360: {
    partnerA: ScoreVector
    partnerB: ScoreVector
  } | null

  // ── Actions ──────────────────────────────────────────────
  setPartnerAName: (name: string) => void
  joinAsPartnerB: (name: string) => void

  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void
  toggleHabit: (habitId: string, date: string) => void
  addTodo: (text: string, category: TodoCategory, createdBy: 'A' | 'B') => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void

  addEmotionDump: (text: string, partner: 'A' | 'B') => void
  setRefinedText: (id: string, refinedText: string) => void
  shareEmotionDump: (id: string) => void
  upsertScore: (score: Omit<Score360, 'id'>) => void
  addWin: (text: string, type: WeeklyWin['type'], partner: 'A' | 'B') => void
  setActiveWeeklyStep: (step: number) => void
  incrementWeeklyCompletions: () => void
  startTrial: () => void
  setReminderOptIn: (value: boolean) => void
  setBaseline360: (value: { partnerA: ScoreVector; partnerB: ScoreVector } | null) => void

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
    streak: 5,
    activeWeeklyStep: 0,
    weeklyCompletions: 1,
    trialStarted: false,
    reminderOptIn: false,
    baseline360: null,
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

      addWin: (text, type, partner) =>
        set((s) => ({ wins: [...s.wins, { id: 'w' + Date.now(), text, type, partner }] })),

      setActiveWeeklyStep: (step) => set({ activeWeeklyStep: step }),
      incrementWeeklyCompletions: () => set((s) => ({ weeklyCompletions: s.weeklyCompletions + 1 })),
      startTrial: () => set({ trialStarted: true }),
      setReminderOptIn: (value) => set({ reminderOptIn: value }),
      setBaseline360: (value) => set({ baseline360: value }),

      // ── Reset ──────────────────────────────────────────
      reset: () => set(createInitialState()),
    }),
    {
      name: 'lifebydesign-mock-store',
      version: 3,
      // Prevent SSR from touching localStorage — rehydrate manually client-side
      skipHydration: true,
    }
  )
)
