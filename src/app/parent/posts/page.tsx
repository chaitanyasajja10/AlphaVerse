'use client'
import { useState, useEffect } from 'react'

interface Post { id: string; content: string; status: string; created_at: string; author: { display_name: string; avatar_emoji: string; username: string } }

export default function ParentPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/parent/posts')
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function review(id: string, status: string) {
    await fetch('/api/parent/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--head)', fontSize: 26, color: '#1a2740', marginBottom: 20 }}>📝 Post Approvals</h1>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {(['pending','approved','rejected','all'] as const).map(f => (
          <button key={f} className={`tab${filter===f?' active':''}`} onClick={() => setFilter(f)}>
            {f === 'pending' ? `⏳ Pending (${posts.filter(p=>p.status==='pending').length})` :
             f === 'approved' ? '✅ Approved' : f === 'rejected' ? '❌ Rejected' : '📋 All'}
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}>⏳ Loading…</div> :
       filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <p style={{ fontWeight: 700, marginTop: 12 }}>No {filter} posts.</p>
        </div>
       ) : filtered.map(post => (
        <div key={post.id} style={{ background: '#fff', borderRadius: 18, padding: 18, marginBottom: 12, border: '2px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className="av" style={{ background: 'var(--soft)' }}>{post.author.avatar_emoji}</div>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>{post.author.display_name}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{post.author.username} · {new Date(post.created_at).toLocaleDateString()}</p>
            </div>
            <span className="tag" style={{ marginLeft: 'auto', color: post.status==='approved'?'var(--green)':post.status==='rejected'?'var(--red)':'var(--orange)' }}>
              {post.status==='approved'?'✅':post.status==='rejected'?'❌':'⏳'} {post.status}
            </span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.6 }}>{post.content}</p>
          {post.status === 'pending' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn green sm" onClick={() => review(post.id, 'approved')}>✅ Approve</button>
              <button className="btn red sm" onClick={() => review(post.id, 'rejected')}>❌ Reject</button>
            </div>
          )}
        </div>
       ))}
    </div>
  )
}
