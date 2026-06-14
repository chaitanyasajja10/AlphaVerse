'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Kid { id: string; username: string; display_name: string; avatar_emoji: string; bio: string; points: number; tyf_id: string; birth_year: number }

const AVATARS = ['🦁','🐯','🦊','🐺','🦝','🐸','🦋','🐙','🦄','🐉','🦅','🐬','🦚','🦜','🦩','🦘','🐼','🦔']

export default function ProfilePage() {
  const router = useRouter()
  const [kid, setKid] = useState<Kid | null>(null)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (d.id) { setKid(d); setBio(d.bio || ''); setAvatarEmoji(d.avatar_emoji) }
      else router.push('/login')
    })
    fetch('/api/posts?mine=true').then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : []))
  }, [])

  async function save() {
    setSaving(true); setMsg('')
    const res = await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, avatar_emoji: avatarEmoji }),
    })
    setSaving(false)
    if (res.ok) { setMsg('✅ Profile updated!'); setEditing(false); fetch('/api/users/me').then(r => r.json()).then(setKid) }
    else setMsg('❌ Failed to save')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!kid) return <div style={{ textAlign: 'center', padding: 60 }}>⏳ Loading…</div>

  return (
    <div className="page-wrap">
      <div className="two-col">
        <div>
          {/* Profile card */}
          <div className="profile-hero">
            <div style={{ fontSize: 56, marginBottom: 12, cursor: editing ? 'pointer' : 'default' }}
              onClick={() => editing && setEditing(true)}>{kid.avatar_emoji}</div>
            <div className="profile-name">{kid.display_name}</div>
            <div className="profile-username">@{kid.username}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 20 }}>{kid.points}</div>
                <div style={{ fontSize: 11, opacity: .7, fontWeight: 700 }}>Points</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 20 }}>{posts.length}</div>
                <div style={{ fontSize: 11, opacity: .7, fontWeight: 700 }}>Posts</div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h4>📋 My Info</h4>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', margin: '0 0 4px' }}>TYF ID</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--dark)', margin: '0 0 12px', fontFamily: 'monospace' }}>{kid.tyf_id}</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', margin: '0 0 4px' }}>Username</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--dark)', margin: '0 0 12px' }}>@{kid.username}</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', margin: '0 0 4px' }}>Bio</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{kid.bio || 'No bio yet.'}</p>
          </div>

          {msg && <div className={`alert ${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn blue sm" onClick={() => setEditing(!editing)} style={{ flex: 1 }}>✏️ Edit Profile</button>
            <button className="btn ghost sm" onClick={logout} style={{ flex: 1 }}>👋 Logout</button>
          </div>
        </div>

        <div>
          {editing && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--head)', marginBottom: 16 }}>✏️ Edit Profile</h3>
              <div className="field">
                <label>Choose Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {AVATARS.map(emoji => (
                    <button key={emoji} onClick={() => setAvatarEmoji(emoji)}
                      style={{ fontSize: 24, padding: 6, borderRadius: 10, border: avatarEmoji === emoji ? '2px solid var(--blue)' : '2px solid var(--line)', background: avatarEmoji === emoji ? 'var(--soft)' : '#fff', cursor: 'pointer' }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Bio (max 200 chars)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 200))}
                  placeholder="Tell everyone about yourself! 🌟"
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--line)', borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: 'var(--body)', resize: 'none', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'} />
                <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, margin: '4px 0 0' }}>{bio.length}/200</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn green" onClick={save} disabled={saving}>{saving ? '⏳' : '💾 Save'}</button>
                <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          )}

          <h2 className="sectlab">📝 My Posts</h2>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              <div style={{ fontSize: 32 }}>📝</div>
              <p style={{ fontWeight: 700, marginTop: 8 }}>No posts yet. Share something!</p>
            </div>
          ) : posts.map((p: any) => (
            <div key={p.id} className="post-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                <span className={`tag ${p.status === 'approved' ? '' : p.status === 'rejected' ? '' : ''}`}
                  style={{ color: p.status === 'approved' ? 'var(--green)' : p.status === 'rejected' ? 'var(--red)' : 'var(--orange)' }}>
                  {p.status === 'approved' ? '✅ Live' : p.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.6 }}>{p.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
