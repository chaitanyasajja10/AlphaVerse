'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'student' | 'parent' | 'register' | 'admin'
type ParentMode = 'password' | 'pin'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('student')
  const [parentMode, setParentMode] = useState<ParentMode>('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleStudentLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/kid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: fd.get('identifier'), password: fd.get('password') }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Login failed')
    router.push('/home')
  }

  async function handleParentLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/parent/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password'), pin: fd.get('pin'), mode: parentMode }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Login failed')
    router.push('/parent/dashboard')
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirmPassword'))
      return (setLoading(false), setError('Passwords do not match'))
    const res = await fetch('/api/auth/kid/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: fd.get('displayName'), username: fd.get('username'),
        email: fd.get('email'), password: fd.get('password'),
        birthYear: Number(fd.get('birthYear')),
        parentEmail: fd.get('parentEmail'), parentPassword: fd.get('parentPassword'),
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Registration failed')
    setSuccess('Account created! Waiting for parent approval. Check your parent\'s email.')
    setTab('student')
  }

  async function handleAdminLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: fd.get('key') }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Invalid key')
    router.push('/admin')
  }

  return (
    <div className="screen-login-wrap">
      <div className="login-card">
        <div className="rainbow-bar" style={{ marginBottom: 20 }} />
        <div className="login-brand"><span className="r">Alpha</span><span className="b">Verse</span></div>
        <p className="login-tagline">🌟 The safe, fun social network for kids!</p>

        <div className="login-tabs">
          {(['student','parent','register','admin'] as Tab[]).map(t => (
            <button key={t} className={`login-tab${tab===t?' active':''}`}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}>
              {t === 'student' ? '🎒 Student' : t === 'parent' ? '👨‍👩‍👧 Parent' : t === 'register' ? '✨ Join' : '🔐 Admin'}
            </button>
          ))}
        </div>

        {error && <div className="alert error">⚠️ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        {/* ── Student Login ── */}
        {tab === 'student' && (
          <form onSubmit={handleStudentLogin}>
            <div className="field">
              <label>Username or TYF ID</label>
              <input name="identifier" required placeholder="e.g. coolgamer42" />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" required placeholder="Your secret password" />
            </div>
            <button className="btn blue lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Signing in…' : '🚀 Sign In'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
              No account? <button type="button" onClick={() => setTab('register')} style={{ color: 'var(--blue)', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer' }}>Join AlphaVerse!</button>
            </p>
          </form>
        )}

        {/* ── Parent Login ── */}
        {tab === 'parent' && (
          <form onSubmit={handleParentLogin}>
            <div className="field">
              <label>Email Address</label>
              <input name="email" type="email" required placeholder="parent@email.com" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => setParentMode('password')}
                className={`btn sm${parentMode==='password'?' blue':' ghost'}`} style={{ flex: 1 }}>
                🔑 Password
              </button>
              <button type="button" onClick={() => setParentMode('pin')}
                className={`btn sm${parentMode==='pin'?' blue':' ghost'}`} style={{ flex: 1 }}>
                🔢 PIN
              </button>
            </div>
            {parentMode === 'password' ? (
              <div className="field">
                <label>Password</label>
                <input name="password" type="password" required placeholder="Your password" />
              </div>
            ) : (
              <div className="field">
                <label>4-Digit PIN</label>
                <input name="pin" type="password" maxLength={4} pattern="\d{4}" required
                  placeholder="••••" style={{ letterSpacing: 8, fontSize: 20, textAlign: 'center' }} />
              </div>
            )}
            <button className="btn green lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Signing in…' : '🛡️ Parent Portal'}
            </button>
          </form>
        )}

        {/* ── Register ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 14 }}>
              🎉 Create your kid account! Your parent will approve it.
            </p>
            <div className="field">
              <label>Display Name</label>
              <input name="displayName" required placeholder="SuperStar Alex" />
            </div>
            <div className="field">
              <label>Username (no spaces)</label>
              <input name="username" required placeholder="superstar_alex" pattern="[a-zA-Z0-9_]+" />
            </div>
            <div className="field">
              <label>Email (optional)</label>
              <input name="email" type="email" placeholder="alex@email.com" />
            </div>
            <div className="field">
              <label>Birth Year</label>
              <input name="birthYear" type="number" required min={2006} max={2018} placeholder="e.g. 2012" />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" required minLength={6} placeholder="Min 6 characters" />
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" required placeholder="Repeat password" />
            </div>
            <div style={{ background: 'var(--soft)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>👨‍👩‍👧 Parent / Guardian</p>
              <div className="field" style={{ marginBottom: 8 }}>
                <label>Parent Email</label>
                <input name="parentEmail" type="email" required placeholder="parent@email.com" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Parent sets a password</label>
                <input name="parentPassword" type="password" required minLength={6} placeholder="Parent's portal password" />
              </div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" required style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                I agree to the AlphaVerse Community Guidelines and confirm my parent/guardian has consented to this account.
              </span>
            </label>
            <button className="btn green lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Creating…' : '✨ Create My Account'}
            </button>
          </form>
        )}

        {/* ── Admin ── */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin}>
            <div className="field">
              <label>Admin Secret Key</label>
              <input name="key" type="password" required placeholder="Enter admin key" />
            </div>
            <button className="btn red lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Verifying…' : '🔐 Admin Access'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          AlphaVerse is powered by TYF Network 🌐
        </p>
      </div>
    </div>
  )
}
