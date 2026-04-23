'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useMockStore } from '@/store/mockStore'
import { useAnalytics } from '@/lib/analytics'
import { MONTHLY_PRICE_IDR, YEARLY_PRICE_IDR } from '@/lib/pricing'

export default function PricingPage() {
  const router = useRouter()
  const startTrial = useMockStore((s) => s.startTrial)
  const coupleId = useMockStore((s) => s.coupleId)
  const { track } = useAnalytics()
  const formatPrice = (value: number) => new Intl.NumberFormat('id-ID').format(value)

  function handleTrial(plan: 'monthly' | 'yearly') {
    startTrial()
    track('trial_started', { source: 'pricing_page', coupleId, plan, value: plan === 'yearly' ? YEARLY_PRICE_IDR : MONTHLY_PRICE_IDR })
    track('subscribe_clicked', { source: 'pricing_page', coupleId, plan, value: plan === 'yearly' ? YEARLY_PRICE_IDR : MONTHLY_PRICE_IDR })
    router.push('/dashboard')
  }

  return (
    <div className="bg-spring-subtle" style={{ minHeight: '100dvh', padding: '2rem 1rem 3rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem,5vw,2.25rem)', fontWeight: 700, color: '#2A1810' }}>
            Pricing yang simpel 💳
          </h1>
          <p style={{ marginTop: '0.4rem', color: '#8B6B61', fontSize: '0.95rem' }}>
            Mulai dengan <strong>Free Trial 7 hari</strong>. Batalkan kapan saja.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ display: 'grid', gap: '0.8rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#C4A090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: '#2A1810', fontWeight: 700 }}>
                Rp {formatPrice(MONTHLY_PRICE_IDR)}
              </span>
              <span style={{ color: '#8B6B61', fontSize: '0.8rem' }}>/ bulan</span>
            </div>
            <ul style={{ display: 'grid', gap: '0.4rem', padding: 0, listStyle: 'none' }}>
              {['Daily + Weekly Ritual penuh', 'AI Emotion Translation', 'Template Library', 'Insight dasar mingguan'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#5A3E37', fontSize: '0.84rem' }}>
                  <CheckCircle2 size={14} color="#7BAE7F" /> {item}
                </li>
              ))}
            </ul>
            <button className="btn-secondary" onClick={() => handleTrial('monthly')} style={{ justifyContent: 'center' }}>
              Mulai Free Trial 7 hari
            </button>
          </div>

          <div className="card" style={{ display: 'grid', gap: '0.8rem', border: '1.5px solid rgba(232,132,106,0.35)', boxShadow: '0 10px 30px rgba(200,130,100,0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#E8846A', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Yearly</div>
              <span style={{ background: 'rgba(232,132,106,0.12)', color: '#E8846A', borderRadius: '999px', padding: '0.2rem 0.55rem', fontSize: '0.7rem', fontWeight: 700 }}>Best Value</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: '#2A1810', fontWeight: 700 }}>
                Rp {formatPrice(YEARLY_PRICE_IDR)}
              </span>
              <span style={{ color: '#8B6B61', fontSize: '0.8rem' }}>/ tahun</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#5A9660', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} /> Lebih hemat dibanding paket bulanan.
            </div>
            <ul style={{ display: 'grid', gap: '0.4rem', padding: 0, listStyle: 'none' }}>
              {['Semua fitur Monthly', 'Progress insight premium mendalam', 'Priority template updates', 'Yearly recap + growth report'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#5A3E37', fontSize: '0.84rem' }}>
                  <CheckCircle2 size={14} color="#7BAE7F" /> {item}
                </li>
              ))}
            </ul>
            <button className="btn-primary" onClick={() => handleTrial('yearly')} style={{ justifyContent: 'center' }}>
              Mulai Free Trial 7 hari
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
