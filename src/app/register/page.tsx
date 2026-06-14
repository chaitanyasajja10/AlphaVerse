'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const RAINBOW = 'linear-gradient(90deg,#e53e3e,#dd6b20,#d69e2e,#38a169,#3182ce,#805ad5)'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 14,
  fontSize: 14,
  color: '#2d3748',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#f7fafc',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: 13,
  color: '#2d3748',
  marginBottom: 6,
}

function Field({ label, name, type = 'text', placeholder, required = true }:
  { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}{!required && <span style={{ color: '#a0aec0', fontWeight: 500 }}> (optional)</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)

    const payload = {
      displayName: fd.get('displayName'),
      username: fd.get('username'),
      email: fd.get('email') || undefined,
      password: fd.get('password'),
      birthYear: Number(fd.get('birthYear')),
      parentEmail: fd.get('parentEmail'),
      parentPassword: fd.get('parentPassword'),
    }

    if (payload.password !== fd.get('confirmPassword')) {
      setLoading(false)
      return setError('Passwords do not match')
    }

    const res = await fetch('/api/auth/kid/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) return setError(data.error || 'Registration failed')

    setSuccess(`Account created! Your TYF ID is ${data.tyfId}. Your parent will receive an email to approve your account. Once approved, you can log in!`)
  }

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
        maxWidth: 460,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 6, background: RAINBOW }} />

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Logo */}
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#e53e3e' }}>Alpha</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#3182ce' }}>Verse</span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#a0aec0', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' }}>
            Powered by TYF Network
          </p>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#2d3748', margin: '0 0 4px' }}>📋 Request New Account</p>
          <p style={{ fontSize: 13, color: '#718096', margin: '0 0 18px' }}>Fill in your details and get your parent to approve.</p>

          <div style={{ height: 3, background: RAINBOW, borderRadius: 99, marginBottom: 22 }} />

          {success ? (
            <div style={{
              background: '#f0fff4', border: '2px solid #68d391', borderRadius: 16,
              padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#276749', marginBottom: 8 }}>You're registered!</p>
              <p style={{ fontSize: 13, color: '#2f855a', lineHeight: 1.6 }}>{success}</p>
              <button
                onClick={() => router.push('/login')}
                style={{
                  marginTop: 18, padding: '12px 28px', background: '#38a169',
                  color: '#fff', border: 'none', borderRadius: 99,
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Go to Login →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Student section */}
              <div style={{
                background: '#f0fff4', border: '1.5px solid #c6f6d5',
                borderRadius: 14, padding: '14px 16px', marginBottom: 18,
              }}>
                <p style={{ fontWeight: 800, fontSize: 13, color: '#276749', margin: '0 0 12px' }}>🧑 Your Info (Student)</p>
                <Field label="Display Name" name="displayName" placeholder="E.g. Alex Johnson" />
                <Field label="Username" name="username" placeholder="Letters, numbers, underscores only" />
                <Field label="Email" name="email" type="email" placeholder="your@email.com" required={false} />
                <Field label="Password" name="password" type="password" placeholder="Choose a strong password" />
                <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Re-enter your password" />
                <div style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>Birth Year</label>
                  <select name="birthYear" required style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">Select your birth year</option>
                    {Array.from({ length: 10 }, (_, i) => 2016 - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parent section */}
              <div style={{
                background: '#ebf8ff', border: '1.5px solid #bee3f8',
                borderRadius: 14, padding: '14px 16px', marginBottom: 18,
              }}>
                <p style={{ fontWeight: 800, fontSize: 13, color: '#2c5282', margin: '0 0 12px' }}>👨‍👩‍👧 Parent Info</p>
                <p style={{ fontSize: 12, color: '#4a5568', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Your parent will use these credentials to log into the Parent Portal and approve your account.
                </p>
                <Field label="Parent Email" name="parentEmail" type="email" placeholder="parent@email.com" />
                <Field label="Parent Password" name="parentPassword" type="password" placeholder="Parent account password" />
              </div>

              {error && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 12,
                  padding: '10px 14px', marginBottom: 16, color: '#c53030', fontSize: 13, fontWeight: 700,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: 99,
                  background: loading ? '#a0aec0' : '#38a169',
                  color: '#fff', fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(56,161,105,0.35)',
                }}
              >
                {loading ? '⏳ Creating account…' : '✅ Create Account →'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#718096' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => router.push('/login')} style={{
                  background: 'none', border: 'none', color: '#3182ce',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                  textDecoration: 'underline',
                }}>
                  Sign In
                </button>
              </p>
            </form>
          )}

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
