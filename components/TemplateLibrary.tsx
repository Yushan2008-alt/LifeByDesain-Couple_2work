'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Copy, Check } from 'lucide-react'
import { analytics } from '@/lib/analytics'

// ── Template data ─────────────────────────────────────────────────────────────
export interface Template {
  id: string
  title: string
  category: string
  emoji: string
  prompt: string
  context: string  // kapan pakai ini
}

const CATEGORIES = ['Semua', 'Konflik', 'Planning', 'Intimasi', 'Komunikasi', 'Perubahan', 'Perayaan']

export const TEMPLATES: Template[] = [
  // ── Konflik ───────────────────────────────────────────────────────────────
  {
    id: 't-k1',
    category: 'Konflik',
    emoji: '🤝',
    title: 'Rekonsiliasi Setelah Pertengkaran',
    prompt: 'Aku merasa hubungan kita masih ada "sisa" dari pertengkaran kemarin. Aku ingin kita clear — bukan mengulangi argumennya, tapi saling memahami apa yang masing-masing dari kita butuhkan. Boleh kita mulai dengan: apa yang paling kamu butuhkan dariku saat kita tidak setuju tentang sesuatu?',
    context: 'Gunakan 1-2 hari setelah pertengkaran, saat suasana sudah lebih tenang.',
  },
  {
    id: 't-k2',
    category: 'Konflik',
    emoji: '🔁',
    title: 'Masalah yang Sama Berulang',
    prompt: 'Ada pola yang aku perhatikan — kita sering berargumen soal hal yang sama berulang kali. Aku tidak ingin terus dalam lingkaran itu. Aku ingin kita jujur: apakah ada kebutuhan yang belum terpenuhi di balik argumen ini? Aku siap mendengar tanpa defensif.',
    context: 'Ketika kamu sadar ada isu yang terus berulang meski sudah dibahas.',
  },
  {
    id: 't-k3',
    category: 'Konflik',
    emoji: '💸',
    title: 'Tidak Sepakat soal Keuangan',
    prompt: 'Uang adalah topik yang sering sensitif buat pasangan mana pun. Aku ingin kita ngobrol soal ini dengan lebih terbuka — bukan soal siapa yang salah, tapi tentang apa yang masing-masing dari kita prioritaskan dan bagaimana kita bisa align tanpa ada yang merasa dikontrol atau dihakimi.',
    context: 'Ketika ada perbedaan pandangan soal pengeluaran, tabungan, atau gaya hidup.',
  },
  {
    id: 't-k4',
    category: 'Konflik',
    emoji: '🌫️',
    title: 'Klarifikasi Kesalahpahaman',
    prompt: 'Aku rasa kita salah paham satu sama lain kemarin. Apa yang aku maksud adalah... dan aku ingin tahu — apa yang kamu tangkap dari yang aku katakan? Aku ingin kita menyamakan perspektif sebelum ini jadi lebih besar dari yang seharusnya.',
    context: 'Setelah ada miscommunication yang masih mengganjal.',
  },

  // ── Planning ──────────────────────────────────────────────────────────────
  {
    id: 't-p1',
    category: 'Planning',
    emoji: '🗓️',
    title: 'Rencana 3 Bulan ke Depan',
    prompt: 'Ayo kita luangkan waktu untuk ngomongin 3 bulan ke depan — bukan cuma agenda, tapi apa yang masing-masing dari kita inginkan dari periode ini. Ada mimpi kecil yang belum sempat kita wujudkan? Ada hal yang ingin kita prioritaskan sebagai pasangan? Aku excited banget untuk dengar pikiranmu.',
    context: 'Ideal dilakukan di awal kuartal atau saat ada transisi besar.',
  },
  {
    id: 't-p2',
    category: 'Planning',
    emoji: '🔑',
    title: 'Keputusan Besar Bersama',
    prompt: 'Kita sedang menghadapi keputusan yang cukup besar, dan aku ingin pastikan kita benar-benar align sebelum maju. Bukan soal siapa yang lebih "benar", tapi apa yang paling penting buat kita berdua. Bagiku yang terpenting adalah... Bagaimana denganmu?',
    context: 'Untuk keputusan pindah, perubahan karir, investasi besar, atau milestone relationship.',
  },
  {
    id: 't-p3',
    category: 'Planning',
    emoji: '🌴',
    title: 'Rencanakan Quality Time',
    prompt: 'Aku kangen waktu kita berdua yang berkualitas. Bukan sekedar di tempat yang sama, tapi benar-benar present dan menikmati satu sama lain. Minggu ini, bisa kita block waktu untuk sesuatu yang kita berdua suka? Aku mau dengar dulu — kamu lagi pengen ngapain bareng aku?',
    context: 'Ketika rutinitas mulai terasa monoton atau disconnected.',
  },

  // ── Intimasi ──────────────────────────────────────────────────────────────
  {
    id: 't-i1',
    category: 'Intimasi',
    emoji: '🌙',
    title: 'Reconnect Setelah Minggu Padat',
    prompt: 'Minggu ini kita berdua super sibuk, dan aku merasa kita sedikit disconnected. Aku kangen versi kita yang santai dan dekat. Tidak ada yang salah — cuma aku ingin evening ini kita benar-benar hadir satu sama lain. Ada sesuatu yang mau kamu ceritakan dari minggu ini yang belum sempat kamu share?',
    context: 'Ketika jadwal padat membuat kalian merasa "bersama tapi terpisah".',
  },
  {
    id: 't-i2',
    category: 'Intimasi',
    emoji: '💬',
    title: 'Mengungkapkan Kebutuhan',
    prompt: 'Ada sesuatu yang ingin aku share — bukan keluhan, tapi sebuah kebutuhan yang aku sadari belakangan ini. Aku butuh lebih banyak [waktu bersama / pelukan / support verbal / ruang pribadi]. Ini bukan tentang kamu kurang, ini tentang aku belajar memahami diriku sendiri lebih baik. Aku ingin kita bisa saling tahu kebutuhan ini.',
    context: 'Ketika kamu menyadari ada kebutuhan emosional atau fisik yang belum terpenuhi.',
  },
  {
    id: 't-i3',
    category: 'Intimasi',
    emoji: '💛',
    title: 'Apresiasi yang Tulus',
    prompt: 'Aku ingin bilang sesuatu yang mungkin jarang aku ucapkan cukup sering: terima kasih. Bukan untuk hal besar — tapi untuk hal-hal kecil yang kamu lakukan setiap hari yang membuat hidupku lebih baik. Kamu mungkin tidak sadar betapa berartinya itu untukku. Yang paling aku syukuri adalah...',
    context: 'Kapan saja — terutama saat rutinitas membuat kita lupa mengapresiasi.',
  },

  // ── Komunikasi ────────────────────────────────────────────────────────────
  {
    id: 't-kom1',
    category: 'Komunikasi',
    emoji: '💭',
    title: 'Memulai Conversation yang Sulit',
    prompt: 'Ada sesuatu yang ingin aku bicarakan dan aku akui ini sedikit bikin aku nervous. Bukan karena aku marah atau kecewa — tapi karena ini penting buatku dan aku ingin kamu benar-benar mendengar. Boleh aku cerita, dan boleh kamu dengar dulu sebelum merespons?',
    context: 'Sebelum memulai topik yang terasa "berat" atau sensitif.',
  },
  {
    id: 't-kom2',
    category: 'Komunikasi',
    emoji: '🫂',
    title: 'Berbagi Perasaan Rentan',
    prompt: 'Aku ingin jujur tentang sesuatu yang jarang aku akui, bahkan ke diriku sendiri. Belakangan ini aku merasa... [takut / tidak cukup / kesepian / overwhelmed]. Aku tidak butuh solusi sekarang — aku cuma butuh kamu tahu dan hadir.',
    context: 'Ketika kamu merasa butuh lebih didengar dan dipahami tanpa langsung dinasihati.',
  },
  {
    id: 't-kom3',
    category: 'Komunikasi',
    emoji: '🌱',
    title: 'Feedback dengan Cinta',
    prompt: 'Ada sesuatu yang ingin aku sampaikan bukan karena aku mau mengkritik, tapi karena aku peduli dan ingin kita tumbuh. Dari cintaku untukmu, aku perhatikan bahwa... Dan aku percaya kamu bisa [tumbuh/berubah/mencoba]. Aku di sini untuk support kamu, bukan judge kamu.',
    context: 'Ketika ada perilaku pasangan yang perlu dibahas dengan cara yang membangun.',
  },

  // ── Perubahan ─────────────────────────────────────────────────────────────
  {
    id: 't-per1',
    category: 'Perubahan',
    emoji: '🏠',
    title: 'Navigasi Perubahan Besar',
    prompt: 'Kita sedang melewati perubahan yang cukup signifikan, dan aku ingin kita tidak melewatinya sendirian-sendiri. Bagaimana perasaanmu tentang semua ini? Apa yang paling membuatmu cemas atau excited? Aku ingin kita hadapi ini sebagai tim.',
    context: 'Pindah kota, perubahan karir, renovasi, atau transisi hidup besar lainnya.',
  },
  {
    id: 't-per2',
    category: 'Perubahan',
    emoji: '🌊',
    title: 'Support di Saat Stres Tinggi',
    prompt: 'Aku tau periode ini berat buat kita berdua. Aku ingin kita saling support tanpa harus punya semua jawaban. Yang bisa aku tawarkan sekarang adalah... Apa yang paling kamu butuhkan dariku hari-hari ini?',
    context: 'Ketika keduanya atau salah satu sedang dalam periode stres tinggi.',
  },
  {
    id: 't-per3',
    category: 'Perubahan',
    emoji: '⏰',
    title: 'Menyesuaikan Rutinitas Baru',
    prompt: 'Rutinitas kita berubah belakangan ini, dan aku merasa kita belum sempat menyesuaikan diri bersama-sama. Apa yang terasa tidak pas untukmu? Aku ingin kita redesign rutinitas kita agar bisa bekerja untuk kita berdua — bukan hanya salah satu.',
    context: 'Setelah ada perubahan jadwal signifikan — bayi baru, kerja remote, shift berbeda, dll.',
  },

  // ── Perayaan ──────────────────────────────────────────────────────────────
  {
    id: 't-pry1',
    category: 'Perayaan',
    emoji: '🎉',
    title: 'Rayakan Progress Kita',
    prompt: 'Aku ingin sejenak pause dan appreciate seberapa jauh kita sudah datang. Kita tidak sempurna, tapi kita terus tumbuh. Aku bangga dengan kita. Momen favorit kita bersama bulan ini adalah... Dan yang aku excited untuk kita capai bersama selanjutnya adalah...',
    context: 'Akhir bulan atau setiap kali ada milestone kecil maupun besar.',
  },
  {
    id: 't-pry2',
    category: 'Perayaan',
    emoji: '🌟',
    title: 'Monthly Check-in Positif',
    prompt: 'Sebelum kita masuk ke diskusi mingguan, aku ingin mulai dengan hal-hal yang berhasil kita lakukan dengan baik bulan ini. Aku perhatikan bahwa kita lebih baik di... dan itu terasa sangat berbeda dibanding sebelumnya. Apa yang menurutmu jadi highlight bulan ini buat kita sebagai pasangan?',
    context: 'Opening ritual bulanan — mulai dengan energi positif.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────

interface TemplateLibraryProps {
  isOpen: boolean
  onClose: () => void
  onUse?: (prompt: string) => void
}

export default function TemplateLibrary({ isOpen, onClose, onUse }: TemplateLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [copied, setCopied]                 = useState<string | null>(null)

  const filtered = activeCategory === 'Semua'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory)

  function handleCopy(template: Template) {
    navigator.clipboard.writeText(template.prompt).catch(() => {})
    setCopied(template.id)
    analytics.templateSelected(template.title, template.category)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleUse(template: Template) {
    analytics.templateSelected(template.title, template.category)
    onUse?.(template.prompt)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(42,24,16,0.45)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
              background: 'rgba(255,251,245,0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1.5rem 1.5rem 0 0',
              maxHeight: '85dvh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -8px 40px rgba(200,130,100,0.2)',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#EDD5C8' }} />
            </div>

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem 0.75rem',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <BookOpen size={18} color="#E8846A" />
                <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.0625rem', color: '#2A1810' }}>
                  Template Library
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(232,132,106,0.12)',
                    color: '#E8846A',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '1rem',
                    fontWeight: 700,
                  }}
                >
                  {TEMPLATES.length} prompts
                </span>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem' }}
              >
                <X size={18} color="#8B6B61" />
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#8B6B61', padding: '0 1.25rem 0.875rem', lineHeight: 1.55, flexShrink: 0 }}>
              Prompt siap pakai untuk memulai conversation yang bermakna. Salin atau langsung gunakan sebagai emotion dump.
            </p>

            {/* Category filter */}
            <div
              style={{
                display: 'flex',
                gap: '0.375rem',
                padding: '0 1.25rem 0.75rem',
                overflowX: 'auto',
                flexShrink: 0,
                scrollbarWidth: 'none',
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    if (cat !== 'Semua') analytics.templateLibraryOpened(cat)
                  }}
                  style={{
                    padding: '0.3125rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: activeCategory === cat ? 700 : 500,
                    border: activeCategory === cat ? '2px solid #E8846A' : '1.5px solid #EDD5C8',
                    background: activeCategory === cat ? 'rgba(232,132,106,0.10)' : 'white',
                    color: activeCategory === cat ? '#E8846A' : '#8B6B61',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template list */}
            <div
              style={{
                overflowY: 'auto',
                padding: '0 1.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              {filtered.map((template) => (
                <div
                  key={template.id}
                  style={{
                    background: 'white',
                    borderRadius: '1.25rem',
                    padding: '1.125rem',
                    border: '1px solid rgba(237,213,200,0.6)',
                    boxShadow: '0 2px 8px rgba(200,130,100,0.06)',
                  }}
                >
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.125rem' }}>{template.emoji}</span>
                    <span style={{ fontWeight: 700, color: '#2A1810', fontSize: '0.9rem', flex: 1 }}>{template.title}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#C4A090',
                        background: 'rgba(237,213,200,0.4)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {template.category}
                    </span>
                  </div>

                  {/* Prompt preview */}
                  <p
                    style={{
                      fontSize: '0.8375rem',
                      color: '#5A3E38',
                      lineHeight: 1.65,
                      marginBottom: '0.625rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    }}
                  >
                    {template.prompt}
                  </p>

                  {/* Context */}
                  <p style={{ fontSize: '0.75rem', color: '#C4A090', lineHeight: 1.5, marginBottom: '0.875rem', fontStyle: 'italic' }}>
                    💡 {template.context}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCopy(template)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem',
                        borderRadius: '0.625rem',
                        border: '1.5px solid #EDD5C8',
                        background: copied === template.id ? 'rgba(123,174,127,0.1)' : 'transparent',
                        color: copied === template.id ? '#3D7A43' : '#8B6B61',
                        borderColor: copied === template.id ? 'rgba(123,174,127,0.3)' : '#EDD5C8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {copied === template.id ? <Check size={13} /> : <Copy size={13} />}
                      {copied === template.id ? 'Tersalin!' : 'Salin'}
                    </button>
                    {onUse && (
                      <button
                        onClick={() => handleUse(template)}
                        style={{
                          flex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          padding: '0.5rem',
                          borderRadius: '0.625rem',
                          border: 'none',
                          background: 'rgba(232,132,106,0.1)',
                          color: '#E8846A',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Gunakan sebagai Emotion Dump →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
