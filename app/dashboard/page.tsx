'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMockStore, type MoodEmoji, type MoodTag, type TodoCategory, generateSelfSuggestion, type Habit } from '@/store/mockStore'
import { useShallow } from 'zustand/shallow'
import { today, CATEGORY_CONFIG, INTENSITY_LABELS, habitCompletionThisWeek } from '@/lib/utils'
import { analytics } from '@/lib/analytics'
import {
  Flame, Plus, Trash2, CheckCircle2, Circle, CalendarCheck, Heart,
  MessageCircle, ChevronRight, Sparkles, Tag, BookOpen, Lock,
  Crown, ArrowRight, Bell, TrendingUp, AlertTriangle, X, Pencil,
} from 'lucide-react'

// ── Spring variant ────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

// ─────────────────────────────────────────────────────────────────────────────
// 1. STREAK BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StreakBadge() {
  const streak = useMockStore((s) => s.streak)
  const partnerA = useMockStore((s) => s.partnerA)
  const partnerB = useMockStore((s) => s.partnerB)

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      style={{
        background: 'linear-gradient(135deg,#E8846A,#D4705A)',
        borderRadius: '1.5rem',
        padding: '1.25rem 1.5rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(200,130,100,0.35)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* bg decoration */}
      <div style={{ position: 'absolute', right: -20, top: -20, fontSize: '5rem', opacity: 0.12 }}>🔥</div>

      <div>
        <div style={{ fontSize: '0.75rem', opacity: 0.85, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Shared Streak
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem,6vw,2.5rem)', fontWeight: 700, lineHeight: 1 }}>{streak}</span>
          <span style={{ fontSize: '0.875rem', opacity: 0.85 }}>hari berturut-turut</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[partnerA, partnerB].map((p, i) => (
            <div
              key={i}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.3)',
              }}
            >
              {p.name.charAt(0).toUpperCase() || (i === 0 ? 'A' : 'B')}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>keduanya aktif hari ini ✓</div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MOOD TRACKER
// ─────────────────────────────────────────────────────────────────────────────
const MOOD_OPTIONS: { emoji: MoodEmoji; label: string; intensity: number }[] = [
  { emoji: '🥰', label: 'Cinta', intensity: 5 },
  { emoji: '😄', label: 'Senang', intensity: 5 },
  { emoji: '😊', label: 'Baik', intensity: 4 },
  { emoji: '🌸', label: 'Damai', intensity: 4 },
  { emoji: '😌', label: 'Tenang', intensity: 3 },
  { emoji: '😐', label: 'Biasa', intensity: 3 },
  { emoji: '😴', label: 'Capek', intensity: 2 },
  { emoji: '😔', label: 'Sedih', intensity: 2 },
  { emoji: '😤', label: 'Frustrasi', intensity: 2 },
  { emoji: '😅', label: 'Stres', intensity: 2 },
  { emoji: '💕', label: 'Romantis', intensity: 5 },
  { emoji: '✨', label: 'Bersemangat', intensity: 5 },
]

const TAG_OPTIONS: MoodTag[] = ['work', 'family', 'health', 'intimacy', 'stress', 'joy', 'tired', 'peaceful', 'excited']
const TAG_LABELS: Record<MoodTag, string> = {
  work: 'Kerja', family: 'Keluarga', health: 'Kesehatan', intimacy: 'Intimasi',
  stress: 'Stres', joy: 'Kesenangan', tired: 'Capek', peaceful: 'Damai', excited: 'Semangat',
}

function MoodTracker({ activePartner }: { activePartner: 'A' | 'B' }) {
  const moodHistory = useMockStore((s) => s.moodHistory)
  const addMoodEntry = useMockStore((s) => s.addMoodEntry)
  const partnerA = useMockStore((s) => s.partnerA)
  const partnerB = useMockStore((s) => s.partnerB)
  const [selected, setSelected] = useState<MoodEmoji | null>(null)
  const [intensity, setIntensity] = useState(3)
  const [tags, setTags] = useState<MoodTag[]>([])
  const [saved, setSaved] = useState(false)

  const todayEntries = moodHistory.filter((m) => m.date === today() && m.partner === activePartner)
  const latestToday  = todayEntries[todayEntries.length - 1]

  // 7-day history for sparkline
  const days: { date: string; entry: typeof moodHistory[0] | undefined }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ date: dateStr, entry: moodHistory.filter((m) => m.date === dateStr && m.partner === activePartner).at(-1) })
  }

  function toggleTag(tag: MoodTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handleSave() {
    if (!selected) return
    const d = new Date()
    const DAY_LABELS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
    addMoodEntry({ date: today(), dayLabel: DAY_LABELS[d.getDay()], emoji: selected, intensity, tags, partner: activePartner })
    setSaved(true)
    setTimeout(() => { setSaved(false); setSelected(null); setTags([]) }, 2000)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 600, color: '#2A1810' }}>
          Mood Hari Ini
        </h3>
        {latestToday && (
          <span style={{ fontSize: '1.25rem' }}>{latestToday.emoji}</span>
        )}
      </div>

      {/* 7-day sparkline */}
      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {days.map(({ date, entry }, i) => {
          const h = entry ? (entry.intensity / 5) * 36 + 8 : 8
          const isToday = i === 6
          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
              <div style={{ fontSize: '0.7rem' }}>{entry?.emoji || ''}</div>
              <motion.div
                animate={{ height: h }}
                transition={SPRING}
                style={{
                  width: '100%',
                  borderRadius: 4,
                  background: entry
                    ? (isToday ? '#E8846A' : 'rgba(232,132,106,0.35)')
                    : 'rgba(237,213,200,0.4)',
                  minHeight: 8,
                }}
              />
              <div style={{ fontSize: '0.6rem', color: '#C4A090' }}>
                {['M','S','S','R','K','J','S'][new Date(date + 'T00:00:00').getDay()]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Emoji grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.375rem' }}>
        {MOOD_OPTIONS.map(({ emoji, label }) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setSelected(emoji); setIntensity(MOOD_OPTIONS.find(m => m.emoji === emoji)?.intensity ?? 3) }}
            title={label}
            style={{
              background: selected === emoji ? 'rgba(232,132,106,0.15)' : 'transparent',
              border: selected === emoji ? '2px solid rgba(232,132,106,0.5)' : '2px solid transparent',
              borderRadius: '0.625rem',
              padding: '0.5rem',
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Intensity slider */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8B6B61', marginBottom: '0.5rem' }}>
            <span>Intensitas</span>
            <span style={{ fontWeight: 600, color: '#E8846A' }}>{INTENSITY_LABELS[intensity]}</span>
          </div>
          <input
            type="range" min={1} max={5} value={intensity}
            onChange={(e) => setIntensity(+e.target.value)}
            style={{ width: '100%', accentColor: '#E8846A' }}
          />
        </motion.div>
      )}

      {/* Tags */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.05 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
            <Tag size={12} color="#C4A090" />
            <span style={{ fontSize: '0.8rem', color: '#8B6B61' }}>Tag (opsional)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  background: tags.includes(tag) ? 'rgba(232,132,106,0.12)' : '#FFF8F5',
                  border: tags.includes(tag) ? '1.5px solid rgba(232,132,106,0.4)' : '1.5px solid #EDD5C8',
                  borderRadius: '2rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  color: tags.includes(tag) ? '#E8846A' : '#8B6B61',
                  cursor: 'pointer',
                  fontWeight: tags.includes(tag) ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save button */}
      <AnimatePresence>
        {selected && !saved && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Simpan Mood
          </motion.button>
        )}
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(123,174,127,0.12)',
              border: '1px solid rgba(123,174,127,0.3)',
              borderRadius: '0.875rem',
              padding: '0.75rem',
              textAlign: 'center',
              color: '#3D7A43',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            ✓ Mood tersimpan! 🌿
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HABIT CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────
// Predefined emoji options for habit picker
const HABIT_EMOJIS = ['🏃','🧘','📚','💪','🛌','🥗','💧','🎨','🎵','✍️','🌿','🧹','💊','🚶','🐾','🧠']

const MAX_FREE_HABITS = 5

function HabitChecklist({ activePartner }: { activePartner: 'A' | 'B' }) {
  const { habits, toggleHabit, addHabit, removeHabit, isPremium } = useMockStore(
    useShallow((s) => ({
      habits:       s.habits,
      toggleHabit:  s.toggleHabit,
      addHabit:     s.addHabit,
      removeHabit:  s.removeHabit,
      isPremium:    s.isPremium,
    }))
  )
  const myHabits   = habits.filter((h) => h.partner === activePartner)
  const atHabitCap = !isPremium && myHabits.length >= MAX_FREE_HABITS
  const todayStr = today()

  const [editMode, setEditMode]       = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel]       = useState('')
  const [newIcon, setNewIcon]         = useState('🏃')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newLabel.trim()) return
    addHabit(newLabel.trim(), newIcon, activePartner)
    setNewLabel('')
    setNewIcon('🏃')
    setShowAddForm(false)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(0.9375rem,2.5vw,1.0625rem)', fontWeight: 600, color: '#2A1810' }}>
          Habit Harian
        </h3>
        <button
          onClick={() => { setEditMode((v) => !v); setShowAddForm(false) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: editMode ? 'rgba(232,132,106,0.12)' : 'transparent',
            border: editMode ? '1px solid rgba(232,132,106,0.3)' : '1px solid #EDD5C8',
            borderRadius: '0.625rem', padding: '0.3rem 0.625rem',
            fontSize: '0.75rem', color: editMode ? '#E8846A' : '#8B6B61',
            cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <Pencil size={11} />
          {editMode ? 'Selesai' : 'Edit'}
        </button>
      </div>

      {/* Habit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {myHabits.map((habit) => {
            const done = habit.completedDays.includes(todayStr)
            const pct  = habitCompletionThisWeek(habit.completedDays)
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <motion.button
                  whileHover={{ x: editMode ? 0 : 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !editMode && toggleHabit(habit.id, todayStr)}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: done ? 'rgba(123,174,127,0.08)' : '#FFF8F5',
                    border: done ? '1.5px solid rgba(123,174,127,0.25)' : '1.5px solid #EDD5C8',
                    borderRadius: '0.875rem',
                    padding: '0.75rem 1rem',
                    cursor: editMode ? 'default' : 'pointer',
                    textAlign: 'left', transition: 'all 0.2s ease',
                    opacity: editMode ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>{habit.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: done ? 600 : 500, color: done ? '#3D7A43' : '#2A1810' }}>
                      {habit.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                      <div style={{ flex: 1, height: 4, background: '#EDD5C8', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          animate={{ width: `${pct}%` }}
                          transition={SPRING}
                          style={{ height: '100%', background: done ? '#7BAE7F' : '#E8846A', borderRadius: 2 }}
                        />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#C4A090', whiteSpace: 'nowrap' }}>{pct}%</span>
                    </div>
                  </div>
                  {!editMode && (
                    <motion.div animate={{ scale: done ? 1 : 0.8, opacity: done ? 1 : 0.4 }}>
                      {done ? <CheckCircle2 size={18} color="#7BAE7F" /> : <Circle size={18} color="#C4A090" />}
                    </motion.div>
                  )}
                </motion.button>

                {/* Delete button — only in edit mode */}
                {editMode && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => removeHabit(habit.id)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(232,100,100,0.1)', border: '1px solid rgba(232,100,100,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={13} color="#D45050" />
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {myHabits.length === 0 && (
          <p style={{ textAlign: 'center', color: '#C4A090', fontSize: '0.8125rem', padding: '0.75rem' }}>
            Belum ada habit. Tambahkan di bawah! 👇
          </p>
        )}
      </div>

      {/* Add habit form */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {!showAddForm ? (
              atHabitCap ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  background: 'rgba(232,132,106,0.05)', border: '1.5px dashed rgba(237,213,200,0.6)',
                  borderRadius: '0.875rem', padding: '0.75rem',
                  color: '#C4A090', fontSize: '0.8125rem',
                }}>
                  <Crown size={13} color="#B8956A" />
                  <span>Maks {MAX_FREE_HABITS} habit di Free — </span>
                  <Link href="/pricing" style={{ color: '#E8846A', fontWeight: 600, textDecoration: 'none' }}>Upgrade Premium</Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    background: 'rgba(232,132,106,0.07)', border: '1.5px dashed rgba(232,132,106,0.35)',
                    borderRadius: '0.875rem', padding: '0.625rem',
                    color: '#E8846A', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Tambah Habit Baru
                </button>
              )
            ) : (
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {/* Emoji picker */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {HABIT_EMOJIS.map((e) => (
                    <button
                      key={e} type="button" onClick={() => setNewIcon(e)}
                      style={{
                        width: 34, height: 34, borderRadius: '0.5rem', fontSize: '1rem',
                        border: newIcon === e ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                        background: newIcon === e ? 'rgba(232,132,106,0.12)' : 'white',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="input-warm"
                    placeholder="Nama habit (cth: Olahraga 30 menit)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button type="submit" disabled={!newLabel.trim()} className="btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem' }}>
                    Simpan
                  </button>
                  <button type="button" onClick={() => { setShowAddForm(false); setNewLabel('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4A090' }}>
                    <X size={18} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary (only when not in edit mode) */}
      {!editMode && myHabits.length > 0 && (
        <div
          style={{
            background: '#F0F7F0', borderRadius: '0.75rem', padding: '0.75rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.8125rem', color: '#5A9660',
          }}
        >
          <span>
            ✓ {myHabits.filter((h) => h.completedDays.includes(todayStr)).length}/{myHabits.length} selesai hari ini
          </span>
          <Sparkles size={13} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SHARED TO-DO LIST
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<TodoCategory, string> = {
  home: 'Rumah', errands: 'Keluar', social: 'Sosial', plans: 'Rencana', finances: 'Keuangan',
}

function SharedTodoList({ activePartner }: { activePartner: 'A' | 'B' }) {
  const todos = useMockStore((s) => s.todos)
  const addTodo = useMockStore((s) => s.addTodo)
  const toggleTodo = useMockStore((s) => s.toggleTodo)
  const deleteTodo = useMockStore((s) => s.deleteTodo)
  const [text, setText] = useState('')
  const [category, setCategory] = useState<TodoCategory>('home')
  const [showForm, setShowForm] = useState(false)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addTodo(text.trim(), category, activePartner)
    setText('')
    setShowForm(false)
  }

  const pending   = todos.filter((t) => !t.completed)
  const completed = todos.filter((t) =>  t.completed)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 600, color: '#2A1810' }}>
          Shared To-do
        </h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm((v) => !v)}
          style={{
            background: showForm ? 'rgba(237,213,200,0.6)' : '#E8846A',
            color: showForm ? '#8B6B61' : 'white',
            border: 'none', borderRadius: '0.625rem',
            padding: '0.375rem 0.75rem', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <Plus size={13} />{showForm ? 'Batal' : 'Tambah'}
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', overflow: 'hidden' }}
          >
            <input
              className="input-warm"
              placeholder="Tambahkan tugas..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {(Object.keys(CATEGORY_LABELS) as TodoCategory[]).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat]
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      background: category === cat ? cfg.bg : 'transparent',
                      border: `1.5px solid ${category === cat ? cfg.color : '#EDD5C8'}`,
                      borderRadius: '2rem',
                      padding: '0.2rem 0.625rem',
                      fontSize: '0.75rem',
                      color: category === cat ? cfg.color : '#8B6B61',
                      cursor: 'pointer', fontWeight: category === cat ? 600 : 400,
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
              Tambahkan
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Pending todos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {pending.length === 0 && (
          <p style={{ textAlign: 'center', color: '#C4A090', fontSize: '0.875rem', padding: '0.5rem' }}>
            Semuanya beres! 🌿
          </p>
        )}
        <AnimatePresence>
          {pending.map((todo) => {
            const cfg = CATEGORY_CONFIG[todo.category]
            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  background: '#FFF8F5', borderRadius: '0.75rem', padding: '0.625rem 0.875rem',
                  border: '1px solid #EDD5C8',
                }}
              >
                <button onClick={() => toggleTodo(todo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <Circle size={16} color="#C4A090" />
                </button>
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#2A1810' }}>{todo.text}</span>
                <span
                  style={{
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
                    borderRadius: '2rem', padding: '0.125rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                  }}
                >{cfg.label}</span>
                <span style={{ fontSize: '0.7rem', color: '#C4A090' }}>{todo.createdBy}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.5 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}
                >
                  <Trash2 size={13} color="#E87070" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', color: '#C4A090', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            SELESAI ({completed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {completed.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  background: 'rgba(123,174,127,0.06)', borderRadius: '0.75rem',
                  padding: '0.5rem 0.875rem', opacity: 0.7,
                }}
              >
                <button onClick={() => toggleTodo(todo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <CheckCircle2 size={16} color="#7BAE7F" />
                </button>
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#8B6B61', textDecoration: 'line-through' }}>{todo.text}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.4 }}
                >
                  <Trash2 size={12} color="#8B6B61" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PARTNER STATUS
// ─────────────────────────────────────────────────────────────────────────────
function PartnerStatus({ activePartner }: { activePartner: 'A' | 'B' }) {
  const partnerA = useMockStore((s) => s.partnerA)
  const partnerB = useMockStore((s) => s.partnerB)
  const moodHistory = useMockStore((s) => s.moodHistory)
  const habits = useMockStore((s) => s.habits)

  const partnerRole   = activePartner === 'A' ? 'B' : 'A'
  const partnerName   = (partnerRole === 'A' ? partnerA : partnerB).name
  const todayStr      = today()
  const partnerMood   = moodHistory.filter((m) => m.date === todayStr && m.partner === partnerRole).at(-1)
  const partnerHabits = habits.filter((h) => h.partner === partnerRole)
  const doneCount     = partnerHabits.filter((h) => h.completedDays.includes(todayStr)).length

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,#F0F7F0,#E8F5E8)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        border: '1px solid rgba(123,174,127,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7BAE7F,#B5D4B5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.125rem', fontWeight: 700, color: 'white', flexShrink: 0,
        }}
      >
        {partnerName.charAt(0).toUpperCase() || partnerRole}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1810', marginBottom: '0.125rem' }}>
          {partnerName || `Partner ${partnerRole}`}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#5A9660' }}>
          {partnerMood
            ? `Mood hari ini: ${partnerMood.emoji} · ${doneCount}/${partnerHabits.length} habit selesai`
            : `${doneCount}/${partnerHabits.length} habit selesai — belum log mood`
          }
        </div>
      </div>
      {partnerMood && (
        <div style={{ fontSize: '1.75rem' }}>{partnerMood.emoji}</div>
      )}
      {!partnerMood && (
        <div
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#EDD5C8', boxShadow: '0 0 0 3px rgba(237,213,200,0.4)',
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EMOTION DUMP
// ─────────────────────────────────────────────────────────────────────────────
function EmotionDumpWidget({ activePartner }: { activePartner: 'A' | 'B' }) {
  const addEmotionDump = useMockStore((s) => s.addEmotionDump)
  const emotionDumps = useMockStore((s) => s.emotionDumps)
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  const myDumps = emotionDumps.filter((e) => e.partner === activePartner && !e.shared)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addEmotionDump(text.trim(), activePartner)
    setText(''); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: '0.75rem',
            background: 'rgba(244,160,160,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MessageCircle size={16} color="#F4A0A0" />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 600, color: '#2A1810' }}>
            Emotion Dump
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#8B6B61', lineHeight: 1.5, marginTop: '0.125rem' }}>
            Tulis perasaan mentahmu. Private sampai weekly ritual — AI akan bantu haluskan sebelum share ke pasangan.
          </p>
        </div>
      </div>

      {/* Existing dumps count */}
      {myDumps.length > 0 && (
        <div
          style={{
            background: 'rgba(244,160,160,0.1)',
            border: '1px solid rgba(244,160,160,0.2)',
            borderRadius: '0.75rem',
            padding: '0.625rem 0.875rem',
            fontSize: '0.8125rem',
            color: '#C07070',
          }}
        >
          📝 {myDumps.length} catatan menunggu di weekly ritual
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          className="input-warm"
          placeholder="Ceritakan apa yang kamu rasakan... (private sampai weekly review)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={{ resize: 'none' }}
        />
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.button
              key="save"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              type="submit"
              className="btn-secondary"
              disabled={!text.trim()}
              style={{ justifyContent: 'center' }}
            >
              Simpan (Private)
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{
                background: 'rgba(244,160,160,0.12)',
                border: '1px solid rgba(244,160,160,0.3)',
                borderRadius: '0.875rem',
                padding: '0.75rem',
                textAlign: 'center', color: '#C07070', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              Tersimpan 💌 Akan diproses saat weekly ritual
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PRIVATE JOURNAL
// PRD: "Free-form text entry, tagged by date, Private by default, ga share
//       kecuali user explicit mau." — private selamanya, tidak masuk weekly share.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_JOURNAL_CHARS = 1000

function PrivateJournalWidget({ activePartner }: { activePartner: 'A' | 'B' }) {
  const { addJournal, journals } = useMockStore(useShallow((s) => ({
    addJournal: s.addJournal,
    journals:   s.journals,
  })))
  const [text, setText]         = useState('')
  const [saved, setSaved]       = useState(false)
  const [focused, setFocused]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  const myJournals = journals
    .filter((j) => j.partner === activePartner)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const charCount   = text.length
  const charPct     = charCount / MAX_JOURNAL_CHARS
  const charColor   = charPct > 0.9 ? '#E87070' : charPct > 0.7 ? '#E8A86A' : '#7BAE7F'
  const canSave     = text.trim().length > 0

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    addJournal(text.trim(), activePartner)
    setText('')
    setSaved(true)
    setFocused(false)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <motion.div
      layout
      className="card"
      animate={{ boxShadow: focused ? '0 8px 32px rgba(107,159,212,0.18)' : '0 2px 12px rgba(200,130,100,0.07)' }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <motion.div
          animate={{ scale: focused ? 1.1 : 1, background: focused ? 'rgba(107,159,212,0.2)' : 'rgba(107,159,212,0.12)' }}
          transition={{ duration: 0.25 }}
          style={{ width: 36, height: 36, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <BookOpen size={16} color="#6B9FD4" />
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 600, color: '#2A1810' }}>
              Jurnal Pribadi
            </h3>
            <motion.div
              animate={{ opacity: focused ? 1 : 0.7 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(107,159,212,0.1)', borderRadius: '2rem', padding: '0.125rem 0.5rem' }}
            >
              <Lock size={9} color="#6B9FD4" />
              <span style={{ fontSize: '0.65rem', color: '#6B9FD4', fontWeight: 600 }}>PRIVATE</span>
            </motion.div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#8B6B61', lineHeight: 1.5, marginTop: '0.125rem' }}>
            Catatan harianmu. Private selamanya — tidak pernah di-share ke pasangan.
          </p>
        </div>
      </div>

      {/* Past journals */}
      {myJournals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.75rem', color: '#8B6B61', fontWeight: 500,
            }}
          >
            <span>📖 {myJournals.length} catatan terakhir</span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>▾</motion.span>
          </motion.button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                {myJournals.map((j, i) => (
                  <motion.div
                    key={j.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: 'rgba(107,159,212,0.05)',
                      border: '1px solid rgba(107,159,212,0.15)',
                      borderRadius: '0.75rem', padding: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#6B9FD4', marginBottom: '0.25rem', fontWeight: 500 }}>{j.date}</div>
                    <p style={{ fontSize: '0.8125rem', color: '#5A3E37', lineHeight: 1.6, margin: 0 }}>
                      {j.text.length > 120 ? j.text.slice(0, 120) + '…' : j.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Entry form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ opacity: focused ? 1 : 0, scaleY: focused ? 1 : 0 }}
            style={{
              position: 'absolute', inset: -2, borderRadius: '0.875rem',
              background: 'transparent',
              border: '2px solid rgba(107,159,212,0.45)',
              pointerEvents: 'none', zIndex: 1,
              transformOrigin: 'center',
            }}
          />
          <textarea
            className="input-warm"
            placeholder="Tulis apapun yang ada di pikiranmu hari ini… (tidak pernah dibagikan)"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_JOURNAL_CHARS))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={focused ? 4 : 3}
            style={{ resize: 'none', transition: 'rows 0.3s' }}
          />
        </div>

        {/* Char counter — only visible when typing */}
        <AnimatePresence>
          {text.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ height: 3, flex: 1, background: '#EDD5C8', borderRadius: 2, overflow: 'hidden', marginRight: '0.5rem' }}>
                <motion.div
                  animate={{ width: `${charPct * 100}%`, background: charColor }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', borderRadius: 2 }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: charColor, fontWeight: 600, flexShrink: 0 }}>
                {charCount}/{MAX_JOURNAL_CHARS}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.button
              key="save"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              whileHover={canSave ? { scale: 1.02 } : {}}
              whileTap={canSave ? { scale: 0.97 } : {}}
              type="submit"
              disabled={!canSave}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: canSave ? 'rgba(107,159,212,0.12)' : 'rgba(237,213,200,0.4)',
                border: `1.5px solid ${canSave ? 'rgba(107,159,212,0.3)' : '#EDD5C8'}`,
                borderRadius: '0.75rem', padding: '0.625rem',
                color: canSave ? '#4A7FAA' : '#C4A090',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: canSave ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              <Lock size={13} /> Simpan (Private)
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{
                background: 'rgba(107,159,212,0.1)',
                border: '1px solid rgba(107,159,212,0.25)',
                borderRadius: '0.875rem', padding: '0.75rem',
                textAlign: 'center', color: '#4A7FAA', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              📔 Tersimpan — hanya kamu yang bisa baca ini ✨
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. STREAK AT RISK BANNER
// ─────────────────────────────────────────────────────────────────────────────
function StreakAtRiskBanner() {
  const streak      = useMockStore((s) => s.streak)
  const moodHistory = useMockStore((s) => s.moodHistory)
  const [dismissed, setDismissed] = useState(false)

  const todayStr     = today()
  const todayEntries = moodHistory.filter((m) => m.date === todayStr)
  const hasLoggedToday = todayEntries.length > 0

  // Only show if: streak > 0 AND no entry today
  if (hasLoggedToday || streak === 0 || dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={SPRING}
      style={{
        background: 'linear-gradient(135deg,rgba(248,200,80,0.12),rgba(232,132,106,0.10))',
        border: '1.5px solid rgba(248,200,80,0.4)',
        borderRadius: '1rem',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <AlertTriangle size={18} color="#C4860A" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7A5200' }}>
          Streak {streak} hari hampir putus!
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9A7000', lineHeight: 1.4 }}>
          Log mood hari ini untuk menjaga streak kalian berdua 🔥
        </div>
      </div>
      <button
        onClick={() => { setDismissed(true); analytics.streakAtRiskSeen(streak) }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4860A', fontSize: '1.125rem', lineHeight: 1, padding: '0.25rem' }}
      >
        ×
      </button>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. WEEKLY INSIGHT CARD (AI self-suggestion on dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function WeeklyInsightCard({ activePartner }: { activePartner: 'A' | 'B' }) {
  const moodHistory = useMockStore((s) => s.moodHistory)
  const suggestion  = generateSelfSuggestion(moodHistory, activePartner)
  if (!suggestion) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.1 }}
      style={{
        background: 'linear-gradient(135deg,rgba(107,159,212,0.08),rgba(123,174,127,0.06))',
        border: '1px solid rgba(107,159,212,0.2)',
        borderRadius: '1.25rem',
        padding: '1rem 1.125rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: '0.625rem',
          background: 'rgba(107,159,212,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <TrendingUp size={15} color="#6B9FD4" />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B9FD4', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          AI Insight Minggu Ini
        </div>
        <p style={{ fontSize: '0.8375rem', color: '#4A6080', lineHeight: 1.65 }}>
          {suggestion}
        </p>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PREMIUM CTA BAR (sticky bottom, only for non-premium)
// ─────────────────────────────────────────────────────────────────────────────
function PremiumCtaBar({ weeklyRitualsCompleted }: { weeklyRitualsCompleted: number }) {
  const router     = useRouter()
  const isPremium  = useMockStore((s) => s.isPremium)
  const setPremium = useMockStore((s) => s.setPremium)
  const [dismissed, setDismissed] = useState(false)

  if (isPremium || dismissed) return null

  const toNextMilestone = Math.max(0, 3 - weeklyRitualsCompleted)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.6 }}
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 40,
        background: 'rgba(255,251,245,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(232,132,106,0.25)',
        padding: '0.875rem 1.25rem calc(0.875rem + env(safe-area-inset-bottom))',
        boxShadow: '0 -8px 32px rgba(200,130,100,0.12)',
      }}
    >
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Progress to milestone */}
        {toNextMilestone > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(237,213,200,0.5)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(weeklyRitualsCompleted / 3) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                style={{ height: '100%', background: 'linear-gradient(90deg,#E8846A,#F4A0A0)', borderRadius: 999 }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: '#C4A090', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {weeklyRitualsCompleted}/3 ritual → unlock deep trend
            </span>
          </div>
        )}
        {toNextMilestone === 0 && (
          <div style={{ fontSize: '0.75rem', color: '#E8846A', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Sparkles size={12} />
            Kamu sudah selesai 3 ritual! Deep trend siap di-unlock →
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2A1810' }}>Mulai Free Trial 7 Hari</div>
            <div style={{ fontSize: '0.7rem', color: '#8B6B61' }}>Weekly ritual, AI insights, recap lengkap</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              analytics.upgradeCtaClicked('dashboard_bottom_bar')
              router.push('/pricing')
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'linear-gradient(135deg,#E8846A,#F4A0A0)',
              color: 'white', border: 'none',
              borderRadius: '0.875rem', padding: '0.625rem 1.125rem',
              fontSize: '0.8375rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Crown size={14} />
            Upgrade
          </motion.button>
          <button
            onClick={() => setDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4A090', padding: '0.25rem', fontSize: '1.125rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. REMINDER OPT-IN
// ─────────────────────────────────────────────────────────────────────────────
function ReminderOptInCard() {
  const { reminderOptIn, setReminderOptIn } = useMockStore(useShallow((s) => ({
    reminderOptIn:    s.reminderOptIn,
    setReminderOptIn: s.setReminderOptIn,
  })))
  const [dismissed, setDismissed] = useState(false)

  // Hide if both opted in or dismissed
  if ((reminderOptIn.email && reminderOptIn.push) || dismissed) return null

  function handleOptIn(channel: 'email' | 'push') {
    setReminderOptIn(channel, true)
    analytics.reminderOptIn(channel)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.4 }}
      style={{
        background: 'white',
        border: '1px solid rgba(237,213,200,0.6)',
        borderRadius: '1.25rem',
        padding: '1rem 1.125rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'rgba(232,132,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bell size={14} color="#E8846A" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8375rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.125rem' }}>
            Aktifkan reminder ritual
          </div>
          <p style={{ fontSize: '0.775rem', color: '#8B6B61', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Kami kirimin pengingat lembut saat jadwal ritual tiba. Tidak ada spam — cuma 1-2 notif per minggu.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!reminderOptIn.email && (
              <button
                onClick={() => handleOptIn('email')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: 'rgba(232,132,106,0.1)', border: '1.5px solid rgba(232,132,106,0.3)',
                  borderRadius: '0.625rem', padding: '0.375rem 0.75rem',
                  fontSize: '0.775rem', fontWeight: 600, color: '#E8846A', cursor: 'pointer',
                }}
              >
                📧 Email
              </button>
            )}
            {!reminderOptIn.push && (
              <button
                onClick={() => handleOptIn('push')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: 'rgba(107,159,212,0.1)', border: '1.5px solid rgba(107,159,212,0.3)',
                  borderRadius: '0.625rem', padding: '0.375rem 0.75rem',
                  fontSize: '0.775rem', fontWeight: 600, color: '#6B9FD4', cursor: 'pointer',
                }}
              >
                🔔 Push
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#C4A090', cursor: 'pointer', padding: '0.375rem 0.25rem' }}
            >
              Nanti dulu
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const partnerA               = useMockStore((s) => s.partnerA)
  const partnerB               = useMockStore((s) => s.partnerB)
  const isPremium              = useMockStore((s) => s.isPremium)
  const weeklyRitualsCompleted = useMockStore((s) => s.weeklyRitualsCompleted)
  // Global activePartner — synced with Nav Switch Partner toggle
  const activePartner    = useMockStore((s) => s.activePartner)
  const setActivePartner = useMockStore((s) => s.setActivePartner)

  // Redirect if not paired
  useEffect(() => {
    if (!partnerA.joined || !partnerB.joined) {
      router.replace('/onboarding')
    }
  }, [])

  if (!partnerA.joined || !partnerB.joined) return null

  const partnerName  = activePartner === 'A' ? partnerA.name : partnerB.name
  const partnerColor = activePartner === 'A' ? '#E8846A' : '#7BAE7F'

  return (
    <div
      className="bg-spring-subtle"
      style={{ minHeight: '100dvh', padding: '1.5rem 1rem calc(3rem + 80px)' }}
    >
      {/* Sticky premium CTA bottom bar */}
      <PremiumCtaBar weeklyRitualsCompleted={weeklyRitualsCompleted} />

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* — Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          style={{ textAlign: 'center', paddingTop: '0.5rem' }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700, color: '#2A1810',
              marginBottom: '0.25rem',
            }}
          >
            Daily Ritual 🌸
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8B6B61' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        {/* — Partner toggle ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          style={{
            display: 'flex', background: 'white',
            borderRadius: '1rem', padding: '0.25rem',
            boxShadow: '0 2px 8px rgba(200,130,100,0.10)',
            border: '1px solid rgba(237,213,200,0.5)',
          }}
        >
          {(['A', 'B'] as const).map((p) => {
            const name  = p === 'A' ? partnerA.name : partnerB.name
            const color = p === 'A' ? '#E8846A' : '#7BAE7F'
            const bg    = p === 'A' ? 'rgba(232,132,106,0.10)' : 'rgba(123,174,127,0.10)'
            const active = activePartner === p
            return (
              <motion.button
                key={p}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActivePartner(p)}
                style={{
                  flex: 1, padding: '0.625rem 1rem',
                  borderRadius: '0.75rem', border: 'none',
                  background: active ? bg : 'transparent',
                  color: active ? color : '#8B6B61',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                }}
              >
                <span>{p === 'A' ? '🌸' : '🌿'}</span>
                {name || `Partner ${p}`}
              </motion.button>
            )
          })}
        </motion.div>

        {/* — Streak ────────────────────────────────────────────── */}
        <StreakBadge />

        {/* — Streak at risk ───────────────────────────────────── */}
        <StreakAtRiskBanner />

        {/* — AI weekly insight ─────────────────────────────────── */}
        <WeeklyInsightCard activePartner={activePartner} />

        {/* — Partner status ──────────────────────────────────── */}
        <PartnerStatus activePartner={activePartner} />

        {/* — Mood tracker ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }}>
          <MoodTracker activePartner={activePartner} />
        </motion.div>

        {/* — Habit checklist ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }}>
          <HabitChecklist activePartner={activePartner} />
        </motion.div>

        {/* — Shared to-do ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
          <SharedTodoList activePartner={activePartner} />
        </motion.div>

        {/* — Emotion dump ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.25 }}>
          <EmotionDumpWidget activePartner={activePartner} />
        </motion.div>

        {/* — Private journal ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }}>
          <PrivateJournalWidget activePartner={activePartner} />
        </motion.div>

        {/* — Reminder opt-in ───────────────────────────────────── */}
        <ReminderOptInCard />

        {/* — CTA to Weekly Ritual ──────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.35 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/weekly-ritual')}
          style={{
            background: 'linear-gradient(135deg,#7BAE7F,#5A9660)',
            color: 'white', border: 'none',
            borderRadius: '1.25rem', padding: '1.125rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(90,150,96,0.28)',
            width: '100%',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '0.125rem', letterSpacing: '0.05em' }}>MINGGU INI</div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 600 }}>
              Weekly Ritual ✨
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CalendarCheck size={18} />
            <ChevronRight size={16} />
          </div>
        </motion.button>

      </div>
    </div>
  )
}
