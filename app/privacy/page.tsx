'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Trash2, Download, Heart, ArrowLeft } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import { useEffect } from 'react'

const SPRING = { type: 'spring', stiffness: 280, damping: 26 } as const

const SECTIONS = [
  {
    icon: Lock,
    color: '#E8846A',
    bg: '#FFF5EE',
    title: 'Data pribadimu tetap milikmu',
    content: [
      'Semua entri jurnal harian bersifat **private by default** — tidak ada orang lain yang bisa membacanya, termasuk pasanganmu, kecuali kamu memilih untuk berbagi.',
      'Emotion dump (curhat mentah) tetap tersimpan secara private di akunmu. AI membantu menyaring bahasanya, tapi kamu yang memutuskan apakah hasilnya dibagikan ke pasangan — atau tidak.',
      'Mood dan habit tracking ditampilkan ke pasangan sebagai **pola** (pattern), bukan isi detail. Pasanganmu tahu kamu lagi stress minggu ini, tapi tidak tahu isi pikiranmu.',
    ],
  },
  {
    icon: Eye,
    color: '#6B9FD4',
    bg: '#EBF4FF',
    title: 'Kontrol penuh per entri',
    content: [
      '**Jurnal harian** — selalu private, tidak pernah dibagikan.',
      '**Emotion dump** — private sampai kamu aktif memilih "Bagikan ke pasangan" setelah AI refine.',
      '**Mood & tag** — ditampilkan ke pasangan sebagai trend pattern (emoji + intensitas), tanpa catatan tambahan.',
      '**Habit tracking** — visible ke pasangan sebagai motivasi kolaboratif, tanpa judgement UI.',
      '**360° score** — hasil combined ditampilkan ke kedua partner setelah keduanya submit.',
      '**Weekly wins & komitmen** — shared ke pasangan (ini memang dimaksudkan sebagai tools bersama).',
    ],
  },
  {
    icon: Shield,
    color: '#7BAE7F',
    bg: '#F0F7F0',
    title: 'AI tidak digunakan untuk training',
    content: [
      'AI kami membantu menerjemahkan emosi mentah menjadi bahasa yang lebih konstruktif. **Datamu tidak pernah digunakan untuk melatih model AI publik** atau model pihak ketiga manapun.',
      'Proses AI terjadi dalam sesi yang terisolasi. Teks yang kamu masukkan tidak tersimpan di sistem AI — hanya tersimpan di akun pribadimu di server kami.',
      'Kami menggunakan API dari provider AI terpercaya dengan perjanjian data privacy yang ketat (tidak ada training dari data pengguna).',
    ],
  },
  {
    icon: Download,
    color: '#B8956A',
    bg: '#FFF5E8',
    title: 'Export data kapan saja',
    content: [
      'Kamu bisa meng-export semua datamu dalam format JSON atau PDF kapan saja, tanpa syarat apapun.',
      'Data export mencakup: semua mood entries, jurnal, emotion dumps, habit records, 360° scores, dan wins/commitments.',
      'Proses export tersedia di pengaturan akun. File dikirim langsung ke email kamu.',
    ],
  },
  {
    icon: Trash2,
    color: '#F4A0A0',
    bg: '#FDDEDE',
    title: 'Hapus data & disconnect pair',
    content: [
      'Kamu bisa menghapus akun dan semua datamu kapan saja. Penghapusan bersifat permanen dan tidak bisa dibatalkan.',
      'Jika hubungan berakhir, kamu bisa "disconnect" dari pair connection. Data masing-masing partner tetap independen — tidak ada yang kehilangan akses ke catatan pribadinya sendiri.',
      'Pasanganmu tidak mendapat notifikasi tentang konten yang kamu hapus. Privasi tetap terjaga.',
    ],
  },
]

function renderContent(text: string) {
  // Simple bold rendering for **text**
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#2A1810', fontWeight: 700 }}>{part}</strong>
      : <span key={i}>{part}</span>
  )
}

export default function PrivacyPage() {
  useEffect(() => {
    analytics.privacyPageViewed()
  }, [])

  return (
    <div className="bg-spring" style={{ minHeight: '100dvh', padding: '2rem 1rem 5rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: '#8B6B61',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            Kembali
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.06 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '1rem',
                background: 'rgba(232,132,106,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={26} color="#E8846A" />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
                  fontWeight: 700,
                  color: '#2A1810',
                  lineHeight: 1.2,
                }}
              >
                Privasi & Data
              </h1>
              <p style={{ color: '#8B6B61', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Terakhir diperbarui: April 2026
              </p>
            </div>
          </div>

          {/* Plain-language summary */}
          <div
            style={{
              background: 'linear-gradient(135deg,rgba(123,174,127,0.08),rgba(107,159,212,0.06))',
              border: '1px solid rgba(123,174,127,0.2)',
              borderRadius: '1.25rem',
              padding: '1.25rem 1.5rem',
            }}
          >
            <p style={{ fontSize: '0.9375rem', color: '#3D7A43', lineHeight: 1.7, fontWeight: 500 }}>
              🌿 <strong>Ringkasan singkat (bukan bahasa hukum):</strong> Data pribadimu adalah milikmu sepenuhnya. Kami tidak menjual data, tidak memakai untuk training AI, dan tidak berbagi ke pihak ketiga untuk kepentingan komersial. Kamu punya kontrol penuh — share apa yang kamu mau, hapus apa yang kamu mau.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, color, bg, title, content }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING, delay: i * 0.06 }}
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.75rem',
              border: `1px solid ${color}22`,
              boxShadow: '0 4px 16px rgba(200,130,100,0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '0.875rem',
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={color} />
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: '#2A1810',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {content.map((line, j) => (
                <li
                  key={j}
                  style={{
                    fontSize: '0.9rem',
                    color: '#5A3E38',
                    lineHeight: 1.7,
                    paddingLeft: '1rem',
                    borderLeft: `2px solid ${color}33`,
                  }}
                >
                  {renderContent(line)}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Third-party services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            border: '1px solid rgba(237,213,200,0.5)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 700, color: '#2A1810', marginBottom: '1rem' }}>
            Layanan pihak ketiga yang kami gunakan
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'Supabase', purpose: 'Database & autentikasi — EU data residency, SOC 2 Type II certified' },
              { name: 'AI Provider (LLM)', purpose: 'Emotion translation saja — zero data retention, tidak untuk training' },
              { name: 'Midtrans / Xendit', purpose: 'Payment processing — PCI DSS compliant, kami tidak menyimpan data kartu' },
              { name: 'Resend / Email provider', purpose: 'Pengiriman email transaksional & reminder (opt-in)' },
            ].map(({ name, purpose }) => (
              <div key={name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8846A', flexShrink: 0, marginTop: 7 }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#2A1810', fontSize: '0.875rem' }}>{name}</span>
                  <span style={{ color: '#8B6B61', fontSize: '0.875rem' }}> — {purpose}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{
            background: 'linear-gradient(135deg,rgba(255,245,238,0.8),rgba(240,247,240,0.8))',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            border: '1px solid rgba(237,213,200,0.5)',
            textAlign: 'center',
          }}
        >
          <Heart size={24} color="#E8846A" fill="#E8846A" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 700, color: '#2A1810', marginBottom: '0.375rem' }}>
            Ada pertanyaan?
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#8B6B61', lineHeight: 1.65, marginBottom: '1rem' }}>
            Kami terbuka untuk diskusi soal privasi dan data. Hubungi kami kapan saja.
          </p>
          <a
            href="mailto:privacy@lifebydesign.app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: '#E8846A',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            privacy@lifebydesign.app
          </a>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(237,213,200,0.5)', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#8B6B61', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>Beranda</Link>
            <Link href="/pricing" style={{ color: '#8B6B61', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>Harga</Link>
            <Link href="/onboarding" style={{ color: '#E8846A', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>Mulai Gratis →</Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
