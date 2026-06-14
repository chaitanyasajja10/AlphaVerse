'use client'
import { useState, useEffect } from 'react'

interface Kid { id: string; username: string; display_name: string; avatar_emoji: string; points: number }

export default function FriendsPage() {
  const [friends, setFriends] = useState<Kid[]>([])
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/friends')
    const data = await res.json()
    setFriends(Array.isArray(data) ? data : [])
  }

  async function addFriend() {
    if (!search.trim()) return
    setAdding(true); setMsg('')
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: search.trim() }),
    })
    const data = await res.json()
    setAdding(false)
    if (res.ok) { setMsg('✅ Friend added!'); setSearch(''); load() }
    else setMsg('❌ ' + (data.error || 'Failed'))
  }

  return (
    <div className="page-wrap">
      <h1 className="sectlab">👥 Friends</h1>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'var(--head)', margin: '0 0 12px' }}>Add a Friend</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFriend()}
            placeholder="Enter username (e.g. coolgamer42)"
            style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--line)', borderRadius: 14, fontSize: 14, fontWeight: 700, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--line)'} />
          <button className="btn blue" onClick={addFriend} disabled={adding || !search.trim()}>
            {adding ? '⏳' : '➕ Add'}
          </button>
        </div>
        {msg && <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: msg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{msg}</p>}
      </div>

      {friends.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48 }}>👥</div>
          <h3 style={{ fontFamily: 'var(--head)', color: 'var(--dark)', marginTop: 12 }}>No friends yet!</h3>
          <p style={{ fontWeight: 700 }}>Add a friend using their username above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {friends.map(f => (
            <div key={f.id} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{f.avatar_emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 15, margin: '0 0 4px', color: 'var(--dark)' }}>{f.display_name}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', margin: '0 0 12px' }}>@{f.username}</p>
              <span className="tag">⭐ {f.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
