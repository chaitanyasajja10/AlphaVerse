'use client'
import { useState, useEffect } from 'react'

interface Kid { id: string; username: string; display_name: string; avatar_emoji: string; points: number; approved: boolean }

export default function ParentActivityPage() {
  const [kids, setKids] = useState<Kid[]>([])

  useEffect(() => {
    fetch('/api/parent/kids').then(r => r.json()).then(d => setKids(Array.isArray(d) ? d : []))
  }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--head)', fontSize: 26, color: '#1a2740', marginBottom: 20 }}>📊 Activity Overview</h1>
      {kids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <p style={{ fontWeight: 700, marginTop: 12 }}>No children to monitor yet.</p>
        </div>
      ) : kids.map(kid => (
        <div key={kid.id} style={{ background: '#fff', borderRadius: 18, padding: 20, marginBottom: 16, border: '2px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="av" style={{ background: 'var(--soft)', width: 48, height: 48, fontSize: 26 }}>{kid.avatar_emoji}</div>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 16 }}>{kid.display_name}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>@{kid.username}</p>
            </div>
            <span className="tag" style={{ marginLeft: 'auto', color: kid.approved ? 'var(--green)' : 'var(--red)' }}>
              {kid.approved ? '✅ Active' : '⏳ Pending'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="stat-card"><div className="stat-num">{kid.points}</div><div className="stat-label">⭐ Points</div></div>
            <div className="stat-card"><div className="stat-num">–</div><div className="stat-label">📝 Posts</div></div>
            <div className="stat-card"><div className="stat-num">–</div><div className="stat-label">👥 Friends</div></div>
          </div>
        </div>
      ))}
    </div>
  )
}
