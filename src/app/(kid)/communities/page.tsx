'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Community { id: string; name: string; emoji: string; description: string; member_count: number; is_member: boolean }

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/communities')
    const data = await res.json()
    setCommunities(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function toggleJoin(id: string, e: React.MouseEvent) {
    e.preventDefault()
    await fetch(`/api/communities/${id}/join`, { method: 'POST' })
    load()
  }

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="sectlab" style={{ margin: 0 }}>🌍 Communities</h1>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search communities…"
          style={{ padding: '9px 16px', border: '2px solid var(--line)', borderRadius: 999, fontSize: 13, fontWeight: 700, outline: 'none', width: 240 }}
          onFocus={e => e.target.style.borderColor = 'var(--blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>⏳ Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48 }}>🌍</div>
          <h3 style={{ fontFamily: 'var(--head)', marginTop: 12 }}>No communities found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(c => (
            <Link href={`/communities/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
              <div className="comm-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                  <span className="comm-emoji">{c.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div className="comm-name">{c.name}</div>
                    <div className="comm-desc">{c.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>👥 {c.member_count?.toLocaleString() || 0} members</span>
                  <button className={`btn sm ${c.is_member ? 'ghost' : 'blue'}`} onClick={e => toggleJoin(c.id, e)}>
                    {c.is_member ? '✓ Joined' : '+ Join'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
