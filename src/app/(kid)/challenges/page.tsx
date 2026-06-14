'use client'
import { useState, useEffect } from 'react'

interface Challenge { id: string; title: string; description: string; points: number; deadline?: string; submitted: boolean; submission_status?: string }

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Challenge | null>(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/challenges')
    const data = await res.json()
    setChallenges(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function submit() {
    if (!active || !answer.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: active.id, content: answer }),
    })
    setSubmitting(false)
    if (res.ok) { setMsg('✅ Submitted! Waiting for approval.'); setActive(null); setAnswer(''); load() }
    else setMsg('❌ Submission failed')
  }

  const statusColor = (s?: string) => s === 'approved' ? 'var(--green)' : s === 'rejected' ? 'var(--red)' : 'var(--orange)'
  const statusLabel = (s?: string) => s === 'approved' ? '✅ Approved' : s === 'rejected' ? '❌ Rejected' : '⏳ Pending'

  return (
    <div className="page-wrap">
      <h1 className="sectlab">⚡ Challenges</h1>
      <p style={{ fontWeight: 700, color: 'var(--muted)', marginBottom: 24, marginTop: -8 }}>Complete challenges to earn ⭐ points and unlock badges!</p>

      {msg && <div className="alert info">{msg}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>⏳ Loading challenges…</div>
      ) : challenges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48 }}>⚡</div>
          <h3 style={{ fontFamily: 'var(--head)', marginTop: 12 }}>No challenges yet!</h3>
          <p style={{ fontWeight: 700, color: 'var(--muted)' }}>Check back soon for new challenges.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {challenges.map(c => (
            <div key={c.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="tag" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#92400e' }}>⭐ {c.points} pts</span>
                {c.submitted && <span style={{ fontSize: 12, fontWeight: 800, color: statusColor(c.submission_status) }}>{statusLabel(c.submission_status)}</span>}
              </div>
              <h3 style={{ fontFamily: 'var(--head)', fontSize: 18, margin: '0 0 8px' }}>{c.title}</h3>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>{c.description}</p>
              {c.deadline && <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)', margin: '0 0 12px' }}>⏰ Due: {new Date(c.deadline).toLocaleDateString()}</p>}
              <button className={`btn ${c.submitted ? 'ghost' : 'green'} sm`} style={{ width: '100%' }}
                onClick={() => { if (!c.submitted) { setActive(c); setMsg('') } }} disabled={c.submitted}>
                {c.submitted ? '✓ Submitted' : '🚀 Take Challenge'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submission modal */}
      {active && (
        <div className="modal-overlay" onClick={() => setActive(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActive(null)}>✕</button>
            <h2 style={{ fontFamily: 'var(--head)', marginBottom: 6 }}>⚡ {active.title}</h2>
            <p style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{active.description}</p>
            <div className="field">
              <label>Your Answer / Submission</label>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here…" rows={5}
                style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--line)', borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: 'var(--body)', resize: 'vertical', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'} />
            </div>
            <button className="btn green lg" style={{ width: '100%' }} onClick={submit} disabled={submitting || !answer.trim()}>
              {submitting ? '⏳ Submitting…' : '🚀 Submit for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
