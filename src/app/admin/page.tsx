'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type AdminTab = 'overview' | 'posts' | 'users' | 'challenges'

interface Post { id: string; content: string; status: string; created_at: string; author: { display_name: string; avatar_emoji: string; username: string } }
interface Kid { id: string; username: string; display_name: string; avatar_emoji: string; approved: boolean; points: number; created_at: string }
interface Challenge { id: string; title: string; description: string; points: number; active: boolean }

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<Kid[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', points: 100 })
  const [msg, setMsg] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [pRes, uRes, cRes] = await Promise.all([
      fetch('/api/admin/posts'), fetch('/api/admin/users'), fetch('/api/admin/challenges')
    ])
    const [p, u, c] = await Promise.all([pRes.json(), uRes.json(), cRes.json()])
    setPosts(Array.isArray(p) ? p : []); setUsers(Array.isArray(u) ? u : []); setChallenges(Array.isArray(c) ? c : [])
    setLoading(false)
  }

  async function reviewPost(id: string, status: string) {
    await fetch('/api/admin/posts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    loadAll()
  }

  async function createChallenge() {
    if (!newChallenge.title || !newChallenge.description) return
    const res = await fetch('/api/admin/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newChallenge) })
    if (res.ok) { setMsg('✅ Challenge created!'); setNewChallenge({ title: '', description: '', points: 100 }); loadAll() }
    else setMsg('❌ Failed')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const pending = posts.filter(p => p.status === 'pending')
  const approved = posts.filter(p => p.status === 'approved')

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Admin topbar */}
      <div style={{ background: '#1a2740', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
        <span style={{ fontFamily: 'var(--head)', fontSize: 18, color: '#fff' }}>🔐 AlphaVerse Admin</span>
        <div style={{ flex: 1 }} />
        <button onClick={logout} style={{ fontSize: 13, fontWeight: 800, color: '#E53935', background: 'none', border: 'none', cursor: 'pointer' }}>👋 Logout</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 28 }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {(['overview','posts','users','challenges'] as AdminTab[]).map(t => (
            <button key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
              {t==='overview'?'📊 Overview':t==='posts'?`📝 Posts (${pending.length} pending)`:t==='users'?`👥 Users (${users.length})`:t==='challenges'?'⚡ Challenges':''}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 60 }}>⏳ Loading…</div> : <>

          {tab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                <div className="stat-card"><div className="stat-num">{users.length}</div><div className="stat-label">Total Users</div></div>
                <div className="stat-card"><div className="stat-num" style={{ color: 'var(--orange)' }}>{pending.length}</div><div className="stat-label">Pending Posts</div></div>
                <div className="stat-card"><div className="stat-num" style={{ color: 'var(--green)' }}>{approved.length}</div><div className="stat-label">Live Posts</div></div>
                <div className="stat-card"><div className="stat-num">{challenges.length}</div><div className="stat-label">Challenges</div></div>
              </div>
              <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--head)', marginBottom: 16 }}>⏳ Recent Pending Posts</h3>
                {pending.slice(0, 5).map(p => (
                  <div key={p.id} style={{ background: 'var(--soft)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <div className="av" style={{ background: '#fff' }}>{p.author.avatar_emoji}</div>
                      <span style={{ fontWeight: 900, fontSize: 13 }}>{p.author.display_name} (@{p.author.username})</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{p.content}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn green sm" onClick={() => reviewPost(p.id, 'approved')}>✅ Approve</button>
                      <button className="btn red sm" onClick={() => reviewPost(p.id, 'rejected')}>❌ Reject</button>
                    </div>
                  </div>
                ))}
                {pending.length === 0 && <p style={{ fontWeight: 700, color: 'var(--muted)', textAlign: 'center' }}>✅ All clear!</p>}
              </div>
            </div>
          )}

          {tab === 'posts' && (
            <div>
              {posts.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, border: '2px solid var(--line)' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div className="av" style={{ background: 'var(--soft)' }}>{p.author.avatar_emoji}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 900, fontSize: 13 }}>{p.author.display_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginLeft: 8 }}>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="tag" style={{ color: p.status==='approved'?'var(--green)':p.status==='rejected'?'var(--red)':'var(--orange)' }}>{p.status}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{p.content}</p>
                  {p.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn green sm" onClick={() => reviewPost(p.id, 'approved')}>✅ Approve</button>
                      <button className="btn red sm" onClick={() => reviewPost(p.id, 'rejected')}>❌ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'var(--soft)' }}>
                  {['Avatar','Name','Username','Points','Status','Joined'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontSize: 22 }}>{u.avatar_emoji}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 900, fontSize: 13 }}>{u.display_name}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{u.username}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 800 }}>⭐ {u.points}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className="tag" style={{ color: u.approved ? 'var(--green)' : 'var(--red)' }}>{u.approved ? '✅ Active' : '⏳ Pending'}</span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {tab === 'challenges' && (
            <div>
              {msg && <div className={`alert ${msg.startsWith('✅')?'success':'error'}`}>{msg}</div>}
              <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--head)', marginBottom: 16 }}>➕ Create New Challenge</h3>
                <div className="field"><label>Title</label><input value={newChallenge.title} onChange={e => setNewChallenge(n => ({ ...n, title: e.target.value }))} placeholder="Challenge title" /></div>
                <div className="field"><label>Description</label><textarea value={newChallenge.description} onChange={e => setNewChallenge(n => ({ ...n, description: e.target.value }))} placeholder="What should kids do?" rows={3} style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--line)', borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: 'var(--body)', outline: 'none' }} /></div>
                <div className="field"><label>Points Reward</label><input type="number" value={newChallenge.points} onChange={e => setNewChallenge(n => ({ ...n, points: Number(e.target.value) }))} min={10} max={1000} /></div>
                <button className="btn green" onClick={createChallenge} disabled={!newChallenge.title || !newChallenge.description}>⚡ Create Challenge</button>
              </div>
              {challenges.map(c => (
                <div key={c.id} style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, border: '2px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ fontFamily: 'var(--head)', margin: 0 }}>{c.title}</h4>
                    <span className="tag">⭐ {c.points} pts</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: '6px 0 0' }}>{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </>}
      </div>
    </div>
  )
}
