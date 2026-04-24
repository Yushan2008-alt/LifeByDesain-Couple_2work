'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

const TEMPLATE_LIBRARY = [
  { category: 'Conflict Recovery', prompt: 'Aku ingin memahami perspektifmu dulu sebelum kita cari solusi. Bisa ceritakan apa yang paling berat buatmu minggu ini?' },
  { category: 'Conflict Recovery', prompt: 'Bagian mana dari percakapan kemarin yang bikin kamu merasa tidak didengar?' },
  { category: 'Planning', prompt: 'Satu prioritas hubungan kita minggu depan apa, dan apa langkah paling kecil untuk mulai?' },
  { category: 'Planning', prompt: 'Weekend ideal versi kamu seperti apa supaya kita sama-sama recharge?' },
  { category: 'Intimacy', prompt: 'Apa hal kecil yang bikin kamu merasa paling dicintai minggu ini?' },
  { category: 'Intimacy', prompt: 'Momen apa minggu ini yang bikin kamu merasa dekat sama aku?' },
  { category: 'Finance', prompt: 'Topik finansial apa yang paling perlu kita luruskan bulan ini tanpa saling menyalahkan?' },
  { category: 'Finance', prompt: 'Keputusan pengeluaran apa yang bisa kita bikin lebih nyaman untuk kita berdua?' },
  { category: 'Communication', prompt: 'Di momen apa kamu berharap aku merespon dengan cara berbeda?' },
  { category: 'Communication', prompt: 'Kalau kamu bisa minta satu perubahan kecil dari cara komunikasiku, apa itu?' },
  { category: 'Life Changes', prompt: 'Perubahan hidup apa yang lagi paling mempengaruhi emosi kamu akhir-akhir ini?' },
  { category: 'Life Changes', prompt: 'Support seperti apa yang paling kamu butuhkan dariku minggu ini?' },
  { category: 'Celebration', prompt: 'Hal apa dari hubungan kita bulan ini yang paling patut dirayakan?' },
  { category: 'Celebration', prompt: 'Kebiasaan baik apa yang sebaiknya kita pertahankan karena terbukti membantu?' },
]

export default function TemplateLibrarySheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(42,24,16,0.35)',
              border: 'none',
              zIndex: 120,
              cursor: 'pointer',
            }}
            aria-label="Tutup template library"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '82dvh',
              background: '#FFFBF5',
              borderTopLeftRadius: '1.5rem',
              borderTopRightRadius: '1.5rem',
              borderTop: '1px solid rgba(237,213,200,0.8)',
              boxShadow: '0 -16px 40px rgba(42,24,16,0.15)',
              zIndex: 130,
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '1rem 1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: '#2A1810', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Sparkles size={16} color="#E8846A" /> Template Library
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#8B6B61', marginTop: '0.125rem' }}>
                    Akses pasif kapan saja untuk bantu ngobrol lebih sehat.
                  </p>
                </div>
                <button onClick={onClose} className="btn-ghost" style={{ padding: '0.45rem' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ maxHeight: '62dvh', overflowY: 'auto', display: 'grid', gap: '0.625rem', paddingRight: '0.25rem' }}>
                {TEMPLATE_LIBRARY.map((item, idx) => (
                  <div
                    key={`${item.category}-${idx}`}
                    style={{
                      background: '#FFF8F5',
                      border: '1px solid #EDD5C8',
                      borderRadius: '0.875rem',
                      padding: '0.75rem 0.875rem',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#C4A090', marginBottom: '0.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {item.category}
                    </div>
                    <div style={{ color: '#2A1810', fontSize: '0.86rem', lineHeight: 1.55 }}>{item.prompt}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
