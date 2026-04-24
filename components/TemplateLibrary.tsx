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

  // ── Konflik (lanjutan) ────────────────────────────────────────────────────
  {
    id: 't-k5',
    category: 'Konflik',
    emoji: '🌬️',
    title: 'Minta Jeda Sehat',
    prompt: 'Aku merasa percakapan ini mulai panas dan aku tidak mau berkata sesuatu yang nanti aku sesali. Boleh kita pause 20 menit dan kembali dengan kepala lebih dingin? Ini bukan menghindar — aku mau diskusi ini menghasilkan sesuatu yang baik buat kita.',
    context: 'Saat emosi mulai menguasai percakapan dan butuh cooling off sehat.',
  },
  {
    id: 't-k6',
    category: 'Konflik',
    emoji: '🫶',
    title: 'Meminta Maaf dengan Tulus',
    prompt: 'Aku ingin minta maaf — bukan sekadar "sorry" supaya ini selesai, tapi karena aku benar-benar mengerti kenapa tindakanku menyakiti kamu. Yang aku lakukan adalah... dan aku paham itu tidak okay. Aku berkomitmen untuk lebih baik dalam hal ini. Aku masih butuh belajar, dan terima kasih sudah sabar denganku.',
    context: 'Ketika kamu siap meminta maaf dengan genuine setelah refleksi, bukan sekadar defensif.',
  },

  // ── Planning (lanjutan) ───────────────────────────────────────────────────
  {
    id: 't-p4',
    category: 'Planning',
    emoji: '🏡',
    title: 'Desain Rutinitas Ideal Kita',
    prompt: 'Aku mau kita obrolin rutinitas kita sebagai couple — bukan cuma apa yang harus dikerjakan, tapi momen kecil yang membuat kita merasa connected setiap hari. Apa 1-2 hal yang paling bikin kamu merasa dekat denganku? Aku mau kita jadikan itu bagian tetap dari hari-hari kita.',
    context: 'Saat ingin membangun rutinitas couple yang meaningful, bukan hanya fungsional.',
  },
  {
    id: 't-p5',
    category: 'Planning',
    emoji: '💸',
    title: 'Rencana Keuangan Bersama',
    prompt: 'Kita belum pernah duduk bareng dan benar-benar ngomongin keuangan kita dengan santai, bukan karena ada masalah. Aku mau kita mulai dari sini: apa nilai-nilai kita soal uang? Apa yang paling penting untuk ditabung, dan apa yang worth diinvestasikan untuk kebahagiaan kita sekarang?',
    context: 'Untuk memulai financial planning couple yang sehat dan bebas judgment.',
  },
  {
    id: 't-p6',
    category: 'Planning',
    emoji: '🌙',
    title: 'Sepakati Batas Digital Berdua',
    prompt: 'Aku sadari HP dan layar sering mencuri waktu kita yang seharusnya bisa jadi momen connection. Aku tidak mau saling judge — tapi aku mau kita buat "aturan" berdua yang kita sama-sama setuju. Menurutmu, kapan waktu yang sacred untuk kita bebas dari layar?',
    context: 'Untuk membangun digital boundaries yang disepakati berdua, bukan satu pihak menuntut.',
  },

  // ── Intimasi (lanjutan) ───────────────────────────────────────────────────
  {
    id: 't-i4',
    category: 'Intimasi',
    emoji: '🌹',
    title: 'Eksplorasi Love Language',
    prompt: 'Aku mau kita ngobrol soal cara kita masing-masing merasa paling dicintai. Buatku, yang paling terasa adalah... Tapi aku mau dengar versimu — kapan kamu merasa paling loved olehku? Dan apa yang ingin lebih sering kamu rasakan dari hubungan kita?',
    context: 'Untuk memahami love language satu sama lain lebih dalam, tanpa asumsi.',
  },
  {
    id: 't-i5',
    category: 'Intimasi',
    emoji: '💫',
    title: 'Kenangan yang Ingin Kita Ciptakan',
    prompt: 'Ada kalanya kita terlalu sibuk sampai lupa bahwa kita sedang menulis sejarah kita sendiri. Aku mau tanya — dalam 1 tahun ke depan, kenangan seperti apa yang ingin kamu miliki bersama aku? Aku mau kita benar-benar intentional soal ini.',
    context: 'Untuk merencanakan momen bermakna yang sengaja diciptakan, bukan sekadar kebetulan.',
  },

  // ── Komunikasi (lanjutan) ─────────────────────────────────────────────────
  {
    id: 't-kom4',
    category: 'Komunikasi',
    emoji: '🎧',
    title: 'Belajar Mendengar Lebih Baik',
    prompt: 'Aku ingin jujur: aku merasa kadang aku belum sepenuhnya hadir saat kamu bercerita. Bukan karena tidak peduli — tapi karena aku sering sudah menyiapkan respons sebelum kamu selesai bicara. Aku mau belajar mendengar dulu, respond kemudian. Boleh kita coba hari ini?',
    context: 'Ketika kamu sadar kamu perlu meningkatkan active listening dalam hubungan.',
  },
  {
    id: 't-kom5',
    category: 'Komunikasi',
    emoji: '🌤️',
    title: 'Check-in Ringan Harian',
    prompt: 'Sebelum hari kita masing-masing terlalu padat — aku mau tanya sederhana: hari ini kamu perlu apa dari aku? Aku ingin hadir dengan cara yang kamu butuhkan, bukan dengan cara yang aku pikir kamu butuhkan.',
    context: 'Sebagai ritual check-in harian yang singkat tapi meaningful.',
  },
  {
    id: 't-kom6',
    category: 'Komunikasi',
    emoji: '🔑',
    title: 'Ungkapkan Harapan Tersembunyi',
    prompt: 'Ada sesuatu yang aku harapkan dari hubungan kita yang mungkin belum pernah aku ucapkan dengan jelas. Bukan karena malu, tapi karena aku sendiri baru sadar ini penting buatku. Harapan itu adalah... Aku ingin tahu — apakah ada harapan yang kamu simpan sendiri juga?',
    context: 'Untuk membuka ekspektasi tersembunyi yang selama ini tidak diucapkan.',
  },

  // ── Perubahan (lanjutan) ──────────────────────────────────────────────────
  {
    id: 't-per4',
    category: 'Perubahan',
    emoji: '🌱',
    title: 'Tumbuh Bareng, Bukan Terpisah',
    prompt: 'Kita masing-masing tumbuh dan berubah — itu indah. Tapi aku mau pastikan kita tumbuh ke arah yang tetap dekat satu sama lain, bukan terpisah. Siapa kamu sekarang yang mungkin belum aku kenal sepenuhnya? Aku mau terus belajar mengenal kamu.',
    context: 'Ketika salah satu atau keduanya merasakan perubahan personal yang signifikan.',
  },
  {
    id: 't-per5',
    category: 'Perubahan',
    emoji: '🕊️',
    title: 'Setelah Masa Sulit Terlewati',
    prompt: 'Kita baru saja melewati periode yang tidak mudah — dan kita masih di sini. Aku mau sejenak acknowledge itu: kita bertahan, bersama. Apa yang kamu pelajari tentang dirimu dan tentang kita selama periode itu? Aku mau kita bawa lesson ini ke depan.',
    context: 'Setelah melewati masa sulit bersama — illness, grief, transisi besar, atau krisis.',
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
  {
    id: 't-pry3',
    category: 'Perayaan',
    emoji: '💍',
    title: 'Anniversary Reflection',
    prompt: 'Hari ini aku ingin merayakan kita — bukan dengan pesta besar, tapi dengan percakapan yang tulus. Tahun/bulan ini, hal yang paling aku syukuri dari kamu adalah... Dan satu hal yang aku harap bisa kita wujudkan bersama di periode berikutnya adalah... Aku bahagia kita memilih satu sama lain setiap hari.',
    context: 'Untuk anniversary, ulang tahun bersama, atau momen milestone relationship.',
  },
  {
    id: 't-pry4',
    category: 'Perayaan',
    emoji: '🏅',
    title: 'Apresiasi Pertumbuhan Personal',
    prompt: 'Aku melihat kamu tumbuh luar biasa belakangan ini — dan aku ingin kamu tahu aku perhatikan itu. Yang paling bikin aku proud adalah... Pertumbuhan ini bukan hanya bagus untuk kamu, tapi juga membuat kita lebih kuat sebagai pasangan. Terima kasih sudah terus jadi versi terbaik dirimu.',
    context: 'Saat pasangan sedang mengalami pertumbuhan personal yang signifikan dan perlu diakui.',
  },
]

// ── Rotating Weekly Prompts Bank ──────────────────────────────────────────────
// PRD §10: "Weekly Check-in Prompts Bank — rotating prompts biar ga monotonous"
export interface WeeklyPrompt {
  id: string
  depth: 'surface' | 'medium' | 'deep'
  category: string
  prompt: string
}

export const WEEKLY_PROMPTS: WeeklyPrompt[] = [
  // Surface — week recap
  { id: 'wp1', depth: 'surface', category: 'Recap', prompt: 'Satu kata yang paling menggambarkan minggu kamu adalah apa?' },
  { id: 'wp2', depth: 'surface', category: 'Recap', prompt: 'Momen terkecil yang paling bikin kamu senyum minggu ini?' },
  { id: 'wp3', depth: 'surface', category: 'Recap', prompt: 'Kalau minggu ini punya rasa, rasanya seperti apa? Kenapa?' },
  { id: 'wp4', depth: 'surface', category: 'Recap', prompt: 'Apa yang kamu harapkan lebih banyak terjadi minggu depan?' },
  { id: 'wp5', depth: 'surface', category: 'Energi', prompt: 'Skala 1-10, minggu ini kamu punya energi berapa? Apa yang paling banyak menguras energimu?' },
  { id: 'wp6', depth: 'surface', category: 'Hubungan', prompt: 'Momen kita berdua yang paling memorable minggu ini — sekecil apapun?' },
  { id: 'wp7', depth: 'surface', category: 'Syukur', prompt: 'Satu hal tentang diri pasanganmu yang minggu ini paling kamu syukuri?' },

  // Medium — reflection
  { id: 'wp8', depth: 'medium', category: 'Perasaan', prompt: 'Perasaan apa yang paling sering kamu rasakan minggu ini tapi belum sempat kamu ceritakan?' },
  { id: 'wp9', depth: 'medium', category: 'Kebutuhan', prompt: 'Minggu depan, apa satu hal yang paling kamu butuhkan dari pasanganmu?' },
  { id: 'wp10', depth: 'medium', category: 'Pertumbuhan', prompt: 'Sesuatu yang kamu pelajari tentang dirimu sendiri minggu ini?' },
  { id: 'wp11', depth: 'medium', category: 'Hubungan', prompt: 'Ada momen di mana kamu merasa paling terhubung dengan pasanganmu minggu ini? Apa yang bikin momen itu spesial?' },
  { id: 'wp12', depth: 'medium', category: 'Tantangan', prompt: 'Tantangan terbesar kamu minggu ini — dan bagaimana kamu menghadapinya?' },
  { id: 'wp13', depth: 'medium', category: 'Komunikasi', prompt: 'Ada sesuatu yang ingin kamu sampaikan ke pasanganmu tapi belum sempat? Sekarang saatnya.' },
  { id: 'wp14', depth: 'medium', category: 'Support', prompt: 'Apakah kamu merasa cukup di-support minggu ini? Kalau belum, apa yang kamu butuhkan?' },

  // Deep — values discussion
  { id: 'wp15', depth: 'deep', category: 'Nilai', prompt: 'Apa nilai terpenting yang ingin kamu hidupi dalam hubungan ini? Apakah kita sudah hidup sesuai nilai itu minggu ini?' },
  { id: 'wp16', depth: 'deep', category: 'Mimpi', prompt: 'Satu mimpi besar yang belum pernah kamu ceritakan ke pasanganmu — apa itu?' },
  { id: 'wp17', depth: 'deep', category: 'Ketakutan', prompt: 'Apa ketakutan terbesar kamu soal hubungan kita — sesuatu yang jarang diucapkan?' },
  { id: 'wp18', depth: 'deep', category: 'Identitas', prompt: 'Siapa kamu dalam hubungan ini yang mungkin berbeda dari siapa kamu di luar hubungan ini? Apakah kamu nyaman dengan perbedaan itu?' },
  { id: 'wp19', depth: 'deep', category: 'Masa Depan', prompt: 'Bayangkan kita 5 tahun dari sekarang — apa yang paling kamu harapkan sudah kita bangun bersama?' },
  { id: 'wp20', depth: 'deep', category: 'Apresiasi', prompt: 'Apa satu hal yang selalu kamu kagumi dari pasanganmu yang jarang atau belum pernah kamu ucapkan langsung?' },
  { id: 'wp21', depth: 'deep', category: 'Makna', prompt: 'Apa yang membuat hubungan kita unik dan berbeda dari hubungan lain yang kamu lihat? Apa yang kamu paling hargai dari keunikan itu?' },
]

/** Returns a rotating subset of prompts based on current week number */
export function getWeeklyPrompts(depth: 'surface' | 'medium' | 'deep' = 'surface', count = 3): WeeklyPrompt[] {
  const pool = WEEKLY_PROMPTS.filter((p) => p.depth === depth)
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const offset = weekNumber % pool.length
  const result: WeeklyPrompt[] = []
  for (let i = 0; i < count; i++) {
    result.push(pool[(offset + i) % pool.length])
  }
  return result
}

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
                  {TEMPLATES.length} template
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
