'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'student' | 'parent' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)

  /* ── Student login ── */
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

  /* ── Parent login ── */
  async function handleParentLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/parent/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password'), pin: fd.get('pin') }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Login failed')
    router.push('/parent/dashboard')
  }

  /* ── Admin login ── */
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

  /* ── Quick demo login ── */
  async function handleDemoLogin() {
    setError(''); setDemoLoading(true)
    const res = await fetch('/api/auth/demo', { method: 'POST' })
    const data = await res.json()
    setDemoLoading(false)
    if (!res.ok) return setError(data.error || 'Demo login failed')
    router.push('/home')
  }

  const RAINBOW = 'linear-gradient(90deg,#e53e3e,#dd6b20,#d69e2e,#38a169,#3182ce,#805ad5)'

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'student', label: 'Student', emoji: '🧑' },
    { key: 'parent',  label: 'Parent',  emoji: '👨‍👩‍👧' },
    { key: 'admin',   label: 'Admin',   emoji: '🛡️' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>

        {/* ── Rainbow top border ── */}
        <div style={{ height: 6, background: RAINBOW }} />

        <div style={{ padding: '28px 28px 24px' }}>

          {/* ── Logo ── */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#e53e3e', fontFamily: 'inherit' }}>Alpha</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#3182ce', fontFamily: 'inherit' }}>Verse</span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#a0aec0', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 8px' }}>
            Powered by TYF Network
          </p>
          <p style={{ fontSize: 14, color: '#4a5568', margin: '0 0 18px', fontWeight: 600 }}>
            A safe space where young minds connect, create &amp; grow 🚀
          </p>

          {/* ── Rainbow divider ── */}
          <div style={{ height: 3, background: RAINBOW, borderRadius: 99, marginBottom: 22 }} />

          {/* ── Tabs ── */}
          <div style={{
            display: 'flex',
            background: '#edf2f7',
            borderRadius: 99,
            padding: 4,
            gap: 4,
            marginBottom: 24,
          }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError('') }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  borderRadius: 99,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  transition: 'all .2s',
                  background: tab === t.key ? '#fff' : 'transparent',
                  color: tab === t.key ? '#2d3748' : '#718096',
                  boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 12,
              padding: '10px 14px', marginBottom: 16, color: '#c53030', fontSize: 13, fontWeight: 700,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ══════════════════════════════════════
              STUDENT TAB
          ══════════════════════════════════════ */}
          {tab === 'student' && (
            <form onSubmit={handleStudentLogin}>
              <Field label="Username / TYF ID / Email" name="identifier" placeholder="e.g. alex_coder · TYF-ABC123 · you@email.com" />
              <Field label="Password" name="password" type="password" placeholder="Your account password" />

              <GreenButton loading={loading}>Sign In →</GreenButton>

              {/* Secondary action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <OutlineButton onClick={() => router.push('/register')}>
                  📋 Request New Account
                </OutlineButton>
                <OutlineButton onClick={() => router.push('/forgot-password')}>
                  🔑 Forgot Password
                </OutlineButton>
              </div>
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <OutlineButton onClick={() => router.push('/forgot-username')}>
                  🪪 Forgot Username
                </OutlineButton>
              </div>

              <Divider />

              <p style={{ textAlign: 'center', fontSize: 12, color: '#a0aec0', fontWeight: 600, marginBottom: 10 }}>
                🖊️ For testing only
              </p>
              <DemoButton loading={demoLoading} onClick={handleDemoLogin} />
            </form>
          )}

          {/* ══════════════════════════════════════
              PARENT TAB
          ══════════════════════════════════════ */}
          {tab === 'parent' && (
            <form onSubmit={handleParentLogin}>
              {/* Portal header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                marginBottom: 20,
              }}>
                <span style={{ fontSize: 28 }}>🏛️</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: '#2d3748', margin: 0 }}>Parent Portal</p>
                  <p style={{ fontSize: 12, color: '#718096', fontWeight: 600, margin: 0 }}>Monitor, guide, and keep your child safe</p>
                </div>
              </div>

              <Field label="Email" name="email" type="email" placeholder="parent@email.com" />
              <Field label="Password" name="password" type="password" placeholder="Your password" />
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  4-Digit PIN{' '}
                  <span style={{ fontWeight: 500, color: '#a0aec0' }}>(optional — only if you created one)</span>
                </label>
                <input
                  name="pin"
                  maxLength={4}
                  placeholder="Leave blank if you did not set a PIN"
                  style={inputStyle}
                />
              </div>

              <BlueButton loading={loading}>Enter Parent Portal →</BlueButton>

              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <OutlineButton onClick={handleDemoLogin}>
                  {demoLoading ? '⏳ Loading…' : '⚡ Quick Demo Login'}
                </OutlineButton>
              </div>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <button type="button" style={{
                  background: 'none', border: 'none', color: '#3182ce',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}>
                  Forgot password or PIN?
                </button>
              </div>

              <Divider />

              <div style={{
                background: '#ebf8ff', borderRadius: 12,
                padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8,
              }}>
                <span style={{ fontSize: 16 }}>ℹ️</span>
                <p style={{ fontSize: 12, color: '#2c5282', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                  Your account is created when your child registers. Use the email and password you set during registration.
                </p>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════
              ADMIN TAB
          ══════════════════════════════════════ */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLogin}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20,
              }}>
                <span style={{ fontSize: 28 }}>🔐</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: '#2d3748', margin: 0 }}>Admin Access</p>
                  <p style={{ fontSize: 12, color: '#718096', fontWeight: 600, margin: 0 }}>Restricted to platform administrators</p>
                </div>
              </div>

              <Field label="Admin Secret Key" name="key" type="password" placeholder="Enter admin secret key" />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: 99,
                  background: loading ? '#a0aec0' : '#553c9a',
                  color: '#fff', fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', marginBottom: 16,
                }}
              >
                {loading ? '⏳ Verifying…' : '🔐 Admin Sign In →'}
              </button>
            </form>
          )}

          {/* ── Footer ── */}
          <p style={{
            textAlign: 'center', fontSize: 11, color: '#a0aec0',
            fontWeight: 600, marginTop: 16, lineHeight: 1.6,
          }}>
            🔒 Safe platform for Grades 4–10 · Parent-approved accounts only · AI-moderated content
          </p>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Sub-components
────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: 13,
  color: '#2d3748',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 14,
  fontSize: 14,
  color: '#2d3748',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#f7fafc',
  transition: 'border-color .2s',
}

function Field({
  label, name, type = 'text', placeholder,
}: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={type !== 'text' || name !== 'pin'} style={inputStyle} />
    </div>
  )
}

function GreenButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', padding: '14px', border: 'none', borderRadius: 99,
        background: loading ? '#a0aec0' : '#38a169',
        color: '#fff', fontWeight: 800, fontSize: 15,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', marginBottom: 6,
        boxShadow: '0 4px 14px rgba(56,161,105,0.35)',
      }}
    >
      {loading ? '⏳ Signing in…' : children}
    </button>
  )
}

function BlueButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', padding: '14px', border: 'none', borderRadius: 99,
        background: loading ? '#a0aec0' : '#3182ce',
        color: '#fff', fontWeight: 800, fontSize: 15,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', marginBottom: 6,
        boxShadow: '0 4px 14px rgba(49,130,206,0.35)',
      }}
    >
      {loading ? '⏳ Signing in…' : children}
    </button>
  )
}

function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: '9px 12px',
        border: '1.5px solid #e2e8f0', borderRadius: 99,
        background: '#fff', color: '#4a5568',
        fontWeight: 700, fontSize: 12,
        cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function DemoButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', padding: '11px',
        border: '2px solid #dd6b20', borderRadius: 99,
        background: '#fff', color: '#dd6b20',
        fontWeight: 800, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {loading ? '⏳ Loading…' : '⚡ Quick Demo Login'}
    </button>
  )
}

function Divider() {
  return (
    <div style={{
      margin: '20px 0',
      borderTop: '1.5px dashed #e2e8f0',
    }} />
  )
}
