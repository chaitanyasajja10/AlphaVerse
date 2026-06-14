'use client'
import { useState, useEffect, FormEvent } from 'react'

interface Reaction { emoji: string; kid_id: string }
interface Post {
  id: string; content: string; created_at: string; status: string
  author: { id: string; username: string; display_name: string; avatar_emoji: string }
  community?: { id: string; name: string; emoji: string }
  reactions: Reaction[]
}

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '🎉']

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postMsg, setPostMsg] = useState('')
  const [me, setMe] = useState<{ id: string } | null>(null)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => setMe(d))
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function submitPost(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true); setPostMsg('')
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    setPosting(false)
    if (res.ok) { setContent(''); setPostMsg('✅ Post sent to parent for approval!') }
    else setPostMsg('❌ ' + (data.error || 'Failed to post'))
  }

  async function react(postId: string, emoji: string) {
    await fetch(`/api/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
    loadPosts()
  }

  function groupReactions(reactions: Reaction[]) {
    const m: Record<string, number> = {}
    reactions.forEach(r => { m[r.emoji] = (m[r.emoji] || 0) + 1 })
    return m
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="page-wrap">
      <div className="three-col">
        {/* Left sidebar */}
        <div>
          <div className="sidebar-card">
            <h4>🚀 Quick Nav</h4>
            {[['💬', 'Chat', '/chat'], ['🌍', 'Communities', '/communities'], ['⚡', 'Challenges', '/challenges'], ['👥', 'Friends', '/friends']].map(([icon, label, href]) => (
              <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 13, fontWeight: 800, color: 'var(--dark)', borderBottom: '1px solid var(--line)' }}>
                <span>{icon}</span>{label}
              </a>
            ))}
          </div>
          <div className="sidebar-card">
            <h4>🌟 Trending Tags</h4>
            {['#Gaming', '#Art', '#Science', '#Music', '#Sports', '#Memes'].map(tag => (
              <span key={tag} className="tag" style={{ marginRight: 6, marginBottom: 6 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div>
          {/* Create post */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
            <form onSubmit={submitPost}>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind? 🤔 (Parent will approve before it goes live)"
                maxLength={1000}
                style={{ width: '100%', minHeight: 90, border: '2px solid var(--line)', borderRadius: 14, padding: '10px 14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--body)', resize: 'vertical', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
              {postMsg && <p style={{ fontSize: 13, fontWeight: 700, color: postMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)', margin: '8px 0' }}>{postMsg}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{content.length}/1000</span>
                <button className="btn blue sm" disabled={posting || !content.trim()}>
                  {posting ? '⏳ Posting…' : '📤 Post'}
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              <div style={{ fontSize: 32 }}>⏳</div>
              <p style={{ fontWeight: 700, marginTop: 8 }}>Loading feed…</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
              <div style={{ fontSize: 48 }}>🌟</div>
              <h3 style={{ fontFamily: 'var(--head)', color: 'var(--dark)', marginTop: 12 }}>No posts yet!</h3>
              <p style={{ fontWeight: 700, marginTop: 8 }}>Be the first to share something awesome!</p>
            </div>
          ) : posts.map(post => (
            <div key={post.id} className="post-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="av" style={{ background: 'var(--soft)', flexShrink: 0 }}>{post.author.avatar_emoji}</div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--dark)', margin: 0 }}>{post.author.display_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, margin: 0 }}>@{post.author.username} · {timeAgo(post.created_at)}</p>
                </div>
                {post.community && (
                  <span className="tag" style={{ marginLeft: 'auto' }}>{post.community.emoji} {post.community.name}</span>
                )}
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{post.content}</p>
              {/* Reactions */}
              <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                {REACTION_EMOJIS.map(emoji => {
                  const grouped = groupReactions(post.reactions)
                  const count = grouped[emoji] || 0
                  const reacted = post.reactions.some(r => r.kid_id === me?.id && r.emoji === emoji)
                  return (
                    <button key={emoji} onClick={() => react(post.id, emoji)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: 'pointer', border: reacted ? '2px solid var(--blue)' : '2px solid var(--line)', background: reacted ? 'var(--soft)' : '#fff', transition: '.15s' }}>
                      {emoji}{count > 0 && <span style={{ color: 'var(--dark)' }}>{count}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div>
          <div className="sidebar-card">
            <h4>🔥 Hot Communities</h4>
            {[['🎮','Gaming Zone'],['🎨','Art Studio'],['🔬','Science Lab'],['🎵','Music Room']].map(([emoji, name]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>{emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--dark)' }}>{name}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-card">
            <h4>⚡ Active Challenges</h4>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', margin: 0 }}>Complete challenges to earn ⭐ points!</p>
            <a href="/challenges" className="btn blue sm" style={{ display: 'inline-flex', marginTop: 10 }}>View All</a>
          </div>
        </div>
      </div>
    </div>
  )
}
