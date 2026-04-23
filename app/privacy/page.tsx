export default function PrivacyPage() {
  return (
    <div className="bg-spring-subtle" style={{ minHeight: '100dvh', padding: '2rem 1rem 3rem' }}>
      <div className="card" style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.7rem,4.8vw,2.2rem)', fontWeight: 700, color: '#2A1810' }}>
          Privacy & Data Use
        </h1>
        <p style={{ color: '#5A3E37', lineHeight: 1.7, fontSize: '0.93rem' }}>
          LifebyDesign Couple dibuat untuk journaling pasangan yang aman. Kami sengaja pakai bahasa sederhana supaya kamu cepat paham hak datamu.
        </p>

        <section style={{ display: 'grid', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#2A1810' }}>Private by default</h2>
          <p style={{ color: '#5A3E37', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Daily journal dan emotion dump tetap private sampai kamu secara eksplisit memilih share. Kamu pegang kontrol penuh per entri.
          </p>
        </section>

        <section style={{ display: 'grid', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#2A1810' }}>AI usage policy</h2>
          <p style={{ color: '#5A3E37', lineHeight: 1.7, fontSize: '0.9rem' }}>
            AI dipakai untuk membantu refine tulisan kamu agar lebih clear dan non-accusatory. Data kamu <strong>tidak digunakan untuk training model publik</strong>.
          </p>
        </section>

        <section style={{ display: 'grid', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#2A1810' }}>Export & delete</h2>
          <p style={{ color: '#5A3E37', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Kamu bisa request export data dan penghapusan data kapan saja. Pada skenario putus koneksi pasangan, data tiap akun tetap bisa diatur terpisah.
          </p>
        </section>

        <section style={{ display: 'grid', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#2A1810' }}>Contact</h2>
          <p style={{ color: '#5A3E37', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Pertanyaan terkait data dan privasi: <strong>privacy@lifebydesign.app</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
