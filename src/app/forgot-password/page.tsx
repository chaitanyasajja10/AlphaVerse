'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const RAINBOW = 'linear-gradient(90deg,#e53e3e,#dd6b20,#d69e2e,#38a169,#3182ce,#805ad5)'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Placeholder — password reset emails not yet wired up
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
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
        maxWidth: 400,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 6, background: RAINBOW }} />
        <div style={{ padding: '28px 28px 24px' }}>
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#e53e3e' }}>Alpha</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#3182ce' }}>Verse</span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#a0aec0', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' }}>
            Powered by TYF Network
          </p>

          <div style={{ height: 3, background: RAINBOW, borderRadius: 99, marginBottom: 22 }} />

          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#2d3748', marginBottom: 8 }}>Check your email!</p>
              <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6, marginBottom: 20 }}>
                If an account exists for that email, we sent a password reset link. Check your inbox (and spam folder).
              </p>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '12px 28px', background: '#3182ce',
                  color: '#fff', border: 'none', borderRadius: 99,
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#2d3748', marginBottom: 4 }}>🔑 Forgot Password</p>
              <p style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>
                Enter your registered email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#2d3748', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    style={{
                      width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0',
                      borderRadius: 14, fontSize: 14, color: '#2d3748', outline: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box', background: '#f7fafc',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px', border: 'none', borderRadius: 99,
                    background: loading ? '#a0aec0' : '#3182ce',
                    color: '#fff', fontWeight: 800, fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', marginBottom: 14,
                  }}
                >
                  {loading ? '⏳ Sending…' : '📧 Send Reset Link →'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: '#718096' }}>
                  <button type="button" onClick={() => router.push('/login')} style={{
                    background: 'none', border: 'none', color: '#3182ce',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13, textDecoration: 'underline',
                  }}>
                    ← Back to Login
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
