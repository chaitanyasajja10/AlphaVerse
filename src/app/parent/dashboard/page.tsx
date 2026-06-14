'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Kid { id: string; username: string; display_name: string; avatar_emoji: string; approved: boolean; points: number }
interface Post { id: string; content: string; status: string; created_at: string; author: { display_name: string; avatar_emoji: string } }

export default function ParentDashboard() {
  const [kids, setKids] = useState<Kid[]>([])
  const [pending, setPending] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [kRes, pRes] = await Promise.all([fetch('/api/parent/kids'), fetch('/api/parent/posts')])
    const [kData, pData] = await Promise.all([kRes.json(), pRes.json()])
    setKids(Array.isArray(kData) ? kData : [])
    setPending(Array.isArray(pData) ? pData.filter((p: Post) => p.status === 'pending') : [])
    setLoading(false)
  }

  async function approveKid(id: string, approved: boolean) {
    await fetch('/api/parent/approve-kid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kid_id: id, approved }),
    })
    loadAll()
  }

  async function reviewPost(id: string, status: string) {
    await fetch('/api/parent/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadAll()
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>⏳ Loading…</div>

  const unapproved = kids.filter(k => !k.approved)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--head)', fontSize: 28, color: '#1a2740', marginBottom: 24 }}>🏠 Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-num">{kids.length}</div>
          <div className="stat-label">👧 Children</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: pending.length > 0 ? 'var(--orange)' : 'var(--green)' }}>{pending.length}</div>
          <div className="stat-label">📝 Pending Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: unapproved.length > 0 ? 'var(--red)' : 'var(--green)' }}>{unapproved.length}</div>
          <div className="stat-label">⚠️ Needs Approval</div>
        </div>
      </div>

      {/* Unapproved kids */}
      {unapproved.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, border: '2px solid #fecaca' }}>
          <h3 style={{ fontFamily: 'var(--head)', color: 'var(--red)', marginBottom: 16 }}>⚠️ New Account Requests</h3>
          {unapproved.map(kid => (
            <div key={kid.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
              <div className="av" style={{ background: 'var(--soft)' }}>{kid.avatar_emoji}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 900, color: 'var(--dark)' }}>{kid.display_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{kid.username}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn green sm" onClick={() => approveKid(kid.id, true)}>✅ Approve</button>
                <button className="btn red sm" onClick={() => approveKid(kid.id, false)}>❌ Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My children */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--head)', marginBottom: 16 }}>👧 My Children</h3>
        {kids.filter(k => k.approved).length === 0 ? (
          <p style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 13 }}>No approved accounts yet.</p>
        ) : kids.filter(k => k.approved).map(kid => (
          <div key={kid.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div className="av" style={{ background: 'var(--soft)', flexShrink: 0 }}>{kid.avatar_emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 900, color: 'var(--dark)' }}>{kid.display_name}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{kid.username} · ⭐ {kid.points} pts</p>
            </div>
            <span className="tag" style={{ color: 'var(--green)' }}>✅ Active</span>
          </div>
        ))}
      </div>

      {/* Pending posts */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--head)', margin: 0 }}>📝 Posts Awaiting Approval</h3>
          <Link href="/parent/posts" style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue)' }}>View All →</Link>
        </div>
        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32 }}>✅</div>
            <p style={{ fontWeight: 700, marginTop: 8 }}>All caught up! No pending posts.</p>
          </div>
        ) : pending.slice(0, 5).map(post => (
          <div key={post.id} style={{ background: 'var(--soft)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="av" style={{ background: '#fff' }}>{post.author.avatar_emoji}</div>
              <span style={{ fontWeight: 900, fontSize: 13 }}>{post.author.display_name}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.5 }}>{post.content}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn green sm" onClick={() => reviewPost(post.id, 'approved')}>✅ Approve</button>
              <button className="btn red sm" onClick={() => reviewPost(post.id, 'rejected')}>❌ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
