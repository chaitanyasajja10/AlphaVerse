'use client'
import { useState, useEffect, use } from 'react'

interface Post { id: string; content: string; created_at: string; author: { display_name: string; avatar_emoji: string; username: string }; reactions: any[] }
interface Community { id: string; name: string; emoji: string; description: string; member_count: number; is_member: boolean }

export default function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetch('/api/communities').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCommunity(data.find(c => c.id === id) || null)
    })
    fetch(`/api/posts?community=${id}`).then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : []))
  }, [id])

  async function post() {
    if (!content.trim()) return
    setPosting(true)
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, community_id: id }),
    })
    setContent(''); setPosting(false)
    fetch(`/api/posts?community=${id}`).then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : []))
  }

  async function toggleJoin() {
    await fetch(`/api/communities/${id}/join`, { method: 'POST' })
    fetch('/api/communities').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCommunity(data.find(c => c.id === id) || null)
    })
  }

  if (!community) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>⏳ Loading…</div>

  return (
    <div className="page-wrap">
      <div className="card" style={{ padding: 28, marginBottom: 24, background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 48 }}>{community.emoji}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--head)', fontSize: 28, margin: 0, color: '#fff' }}>{community.name}</h1>
            <p style={{ margin: '6px 0 0', opacity: .85, fontWeight: 700 }}>{community.description}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: .7, fontWeight: 700 }}>👥 {community.member_count} members</p>
          </div>
          <button className={`btn ${community.is_member ? 'ghost' : 'green'}`} onClick={toggleJoin}>
            {community.is_member ? '✓ Joined' : '+ Join'}
          </button>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="sidebar-card">
            <h4>ℹ️ About</h4>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: 0 }}>{community.description}</p>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder={`Share something with ${community.name}…`}
              style={{ width: '100%', minHeight: 80, border: '2px solid var(--line)', borderRadius: 14, padding: '10px 14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--body)', resize: 'none', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'} />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button className="btn blue sm" onClick={post} disabled={posting || !content.trim()}>
                {posting ? '⏳' : '📤 Post'}
              </button>
            </div>
          </div>
          {posts.map(p => (
            <div key={p.id} className="post-card">
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div className="av" style={{ background: 'var(--soft)' }}>{p.author.avatar_emoji}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 13 }}>{p.author.display_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{p.author.username}</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{p.content}</p>
            </div>
          ))}
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              <div style={{ fontSize: 32 }}>💭</div>
              <p style={{ fontWeight: 700, marginTop: 8 }}>No posts yet. Be first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
