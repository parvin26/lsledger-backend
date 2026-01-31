'use client'

import { NavBar } from '@/app/components/NavBar'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <NavBar />

      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
        }}
      >
        <h1 className="heading" style={{ marginBottom: '0.5rem' }}>
          About Lighthouse Ledger
        </h1>
        <p className="helper" style={{ marginBottom: '1rem' }}>
          Why this system exists and who it is for.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          For this early test version, you can explore the full flow as a guest. Sign‑in will be added later.
        </p>

        <div style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text)' }}>
          <p style={{ marginBottom: '1.25rem' }}>
            Lighthouse Ledger was created for people whose most important learning does not happen in classrooms.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            Founders, MSME owners, youth, and self‑taught builders learn through work, experiments, short courses, GitHub commits, AI sessions, and community projects. Their capability is real, but it rarely appears on formal transcripts. Traditional credentials are slow, expensive, and often out of reach; yet existing digital badges mostly track attendance, not understanding.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            Lighthouse Ledger exists to change that quietly and carefully. It is a learning record and review system that listens to your evidence first, then asks structured, practitioner‑level questions to test how you think, what you understood, and how you would apply it. The output is a transparent capability record with a clear confidence band—an honest signal, not a certificate or academic credit.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            Over time, these records form a personal ledger of learning: small, verified steps that can be shared with employers, collaborators, or future educators when you choose. The long‑term ambition is to prove that non‑traditional learners can be assessed with the same seriousness as formal students, and to lay the groundwork for stackable, verifiable micro‑credentials that one day plug into wider education, employment, and digital public infrastructure.
          </p>
          <p style={{ marginBottom: 0 }}>
            For this early version, the focus is narrow on purpose. Lighthouse Ledger does not replace universities or training providers, and it does not make hiring or admissions decisions. It provides a calm, honest space where real learning from real work can be recorded, reviewed, and made visible—without exaggeration and without gatekeeping.
          </p>
        </div>
      </main>
    </div>
  )
}
