'use client'

import { useRouter } from 'next/navigation'
import { Lock, Sparkles } from 'lucide-react'
import { useMockStore } from '@/store/mockStore'
import { useAnalytics } from '@/lib/analytics'
import { PREMIUM_UNLOCK_TARGET } from '@/lib/pricing'

export default function WeeklyCompletePage() {
  const router = useRouter()
  const weeklyCompletions = useMockStore((s) => s.weeklyCompletions)
  const coupleId = useMockStore((s) => s.coupleId)
  const trialStarted = useMockStore((s) => s.trialStarted)
  const startTrial = useMockStore((s) => s.startTrial)
  const { track } = useAnalytics()

  const progressToPremium = Math.min(100, Math.round((weeklyCompletions / PREMIUM_UNLOCK_TARGET) * 100))

  function handleStartTrial() {
    startTrial()
    track('trial_started', { source: 'weekly_complete_value_wall', coupleId, weeklyCompletions })
    router.push('/pricing')
  }

  return (
    <div className="bg-spring" style={{ minHeight: '100dvh', padding: '2rem 1rem 3rem' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <div className="card" style={{ textAlign: 'center', display: 'grid', gap: '0.65rem' }}>
          <div style={{ fontSize: '2.6rem' }}>🎉</div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4.5vw,2rem)', color: '#2A1810', fontWeight: 700 }}>
            Weekly Ritual selesai!
          </h1>
          <p style={{ color: '#8B6B61', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Konsistensi ini bikin hubungan makin kuat. Kamu sudah menyelesaikan <strong>{weeklyCompletions} ritual</strong>.
          </p>
        </div>

        <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', color: '#2A1810', fontWeight: 700 }}>Progress ke Premium Insight</h2>
            <span style={{ fontSize: '0.78rem', color: '#5A9660', fontWeight: 600 }}>{progressToPremium}%</span>
          </div>
          <div style={{ height: 8, background: '#EDD5C8', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${progressToPremium}%`, height: '100%', background: 'linear-gradient(90deg,#7BAE7F,#5A9660)' }} />
          </div>
          <p style={{ color: '#8B6B61', fontSize: '0.82rem' }}>
            Target {PREMIUM_UNLOCK_TARGET} ritual untuk membuka deep trend mingguan otomatis.
          </p>
        </div>

        <div className="card" style={{ display: 'grid', gap: '0.65rem', border: '1px dashed rgba(232,132,106,0.45)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#E8846A', fontWeight: 700 }}>
            <Lock size={14} /> Premium Insight Minggu Ini (Terkunci)
          </div>
          <p style={{ color: '#5A3E37', fontSize: '0.87rem', lineHeight: 1.65 }}>
            Pattern hubungan kamu menunjukkan peluang peningkatan tertinggi di waktu komunikasi pertengahan minggu. Unlock premium untuk melihat rekomendasi spesifik berbasis pola mood + habit.
          </p>
          {!trialStarted ? (
            <button className="btn-primary" onClick={handleStartTrial} style={{ justifyContent: 'center', marginTop: '0.2rem' }}>
              Mulai Free Trial 7 hari
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => router.push('/pricing')} style={{ justifyContent: 'center' }}>
              Lihat paket pricing
            </button>
          )}
          <button className="btn-ghost" onClick={() => router.push('/dashboard')} style={{ justifyContent: 'center' }}>
            Nanti dulu, kembali ke dashboard
          </button>
        </div>

        <div style={{ textAlign: 'center', color: '#8B6B61', fontSize: '0.78rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}>
          <Sparkles size={12} /> Trial aktif tanpa komitmen. Batalkan kapan saja.
        </div>
      </div>
    </div>
  )
}
