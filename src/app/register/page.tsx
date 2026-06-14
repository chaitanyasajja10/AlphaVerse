'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const RAINBOW = 'linear-gradient(90deg,#e53e3e,#dd6b20,#d69e2e,#38a169,#3182ce,#805ad5)'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  color: '#2d3748',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#fff',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: 13,
  color: '#2d3748',
  marginBottom: 5,
}

function Field({
  label, name, type = 'text', placeholder, required = true,
}: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  )
}

const GRADES = ['Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [addPin, setAddPin] = useState(false)
  const [agreed, setAgreed] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!agreed) return setError('Please agree to the Privacy Policy and Terms of Use to continue.')
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)

    const parentPassword = fd.get('parentPassword') as string
    const confirmPassword = fd.get('confirmPassword') as string
    if (parentPassword !== confirmPassword) {
      setLoading(false)
      return setError('Parent passwords do not match.')
    }

    // Derive a kid password from TYF ID (will be returned and sent to parent)
    // For now use a temp password; backend will auto-generate via TYF ID
    const payload = {
      displayName: fd.get('displayName'),
      username: fd.get('username'),
      email: fd.get('studentEmail') || undefined,
      password: fd.get('studentPassword') || 'AlphaVerse@2024',
      dateOfBirth: fd.get('dob'),
      schoolName: fd.get('schoolName'),
      currentGrade: fd.get('currentGrade'),
      gradeNextYear: fd.get('gradeNextYear'),
      parentName: fd.get('parentName'),
      parentEmail: fd.get('parentEmail'),
      parentPassword,
    }

    const res = await fetch('/api/auth/kid/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Registration failed')
    setSuccess(data.tyfId)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f4f8', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          width: '100%', maxWidth: 420, background: '#fff',
          borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          <div style={{ height: 6, background: RAINBOW }} />
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
            <p style={{ fontWeight: 900, fontSize: 20, color: '#276749', marginBottom: 8 }}>Account Created!</p>
            <div style={{
              background: '#f0fff4', border: '2px solid #68d391', borderRadius: 14,
              padding: '16px', marginBottom: 16,
            }}>
              <p style={{ fontSize: 12, color: '#2f855a', fontWeight: 700, marginBottom: 4 }}>Your TYF ID</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#22543d', letterSpacing: 2 }}>{success}</p>
            </div>
            <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.7, marginBottom: 20 }}>
              📧 An email has been sent to your parent for approval.<br />
              Once they approve, you can log in using your <strong>username</strong> and the password you created.
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '13px 36px', background: '#38a169',
                color: '#fff', border: 'none', borderRadius: 99,
                fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(56,161,105,0.35)',
              }}
            >
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f4f8', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: '#fff',
        borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', overflow: 'hidden',
      }}>
        {/* Rainbow top bar */}
        <div style={{ height: 6, background: RAINBOW }} />

        <div style={{ padding: '24px 24px 20px' }}>

          {/* Logo */}
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#e53e3e' }}>Alpha</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#3182ce' }}>Verse</span>
          </div>
          <p style={{ fontSize: 9, fontWeight: 800, color: '#a0aec0', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 4px' }}>
            Powered by TYF Network
          </p>
          <p style={{ fontSize: 12, color: '#718096', fontWeight: 600, margin: '0 0 14px' }}>
            A safe space where young minds connect, create &amp; grow 🚀
          </p>

          {/* Rainbow divider */}
          <div style={{ height: 3, background: RAINBOW, borderRadius: 99, marginBottom: 16 }} />

          {/* Info box */}
          <div style={{
            background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14 }}>📝</span>
            <p style={{ fontSize: 12, color: '#4a5568', margin: 0, lineHeight: 1.5 }}>
              Fill in the details below. Your parent will receive an email with your login password to approve your account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── Student fields ── */}
            <Field label="Child's Full Name" name="displayName" placeholder="Full name" />
            <Field label="Username (displayed on posts)" name="username" placeholder="e.g. curious_coder_42" />
            <Field label="Student Email" name="studentEmail" type="email" placeholder="student@email.com" required={false} />

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date of Birth</label>
              <input name="dob" type="date" required style={inputStyle} />
            </div>

            <Field label="School Name" name="schoolName" placeholder="e.g. DPS Bangalore" required={false} />

            {/* Grade row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Current Grade</label>
                <select name="currentGrade" style={{ ...inputStyle, appearance: 'none' as const }}>
                  <option value="">Grade…</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Grade next year</label>
                <select name="gradeNextYear" style={{ ...inputStyle, appearance: 'none' as const }}>
                  <option value="">Next grade…</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <Field label="Parent's Full Name" name="parentName" placeholder="Parent's name" />
            <Field label="Parent Email (approval + notifications)" name="parentEmail" type="email" placeholder="parent@email.com" />

            {/* ── Parent portal section ── */}
            <div style={{
              background: '#ebf8ff', border: '1.5px solid #bee3f8',
              borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>🏛️</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 13, color: '#2c5282', margin: 0 }}>Create Your Parent Portal Account</p>
                  <p style={{ fontSize: 12, color: '#4a5568', margin: '2px 0 0', lineHeight: 1.4 }}>
                    Set a password so you can log in to approve posts and monitor your child.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ ...labelStyle, color: '#2c5282' }}>Parent Password <span style={{ fontWeight: 500, color: '#718096' }}>(min 6 chars)</span></label>
                <input name="parentPassword" type="password" placeholder="Create a password for parent portal" required minLength={6} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ ...labelStyle, color: '#2c5282' }}>Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="Repeat password" required style={inputStyle} />
              </div>

              {/* PIN checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#2c5282', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={addPin}
                  onChange={e => setAddPin(e.target.checked)}
                  style={{ width: 15, height: 15 }}
                />
                Add optional 4-digit PIN for extra security
              </label>

              {addPin && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ ...labelStyle, color: '#2c5282' }}>4-Digit PIN</label>
                  <input name="pin" type="password" maxLength={4} placeholder="e.g. 1234" style={inputStyle} />
                </div>
              )}
            </div>

            {/* Also need student password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Student Password <span style={{ fontWeight: 500, color: '#a0aec0' }}>(for student login)</span></label>
              <input name="studentPassword" type="password" placeholder="Create a password for the student" required minLength={6} style={inputStyle} />
            </div>

            {/* Consent checkbox */}
            <label style={{
              display: 'flex', gap: 10, cursor: 'pointer', marginBottom: 18,
              fontSize: 12, color: '#4a5568', lineHeight: 1.5, fontWeight: 600,
              alignItems: 'flex-start',
            }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ width: 15, height: 15, marginTop: 2, flexShrink: 0 }}
              />
              <span>
                I am the parent/guardian and I agree to the{' '}
                <span style={{ color: '#3182ce', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
                {' '}and{' '}
                <span style={{ color: '#3182ce', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</span>.
                {' '}I consent to my child's account being created on TYF Network and I understand I am responsible for monitoring their activity.
              </span>
            </label>

            {error && (
              <div style={{
                background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10,
                padding: '10px 14px', marginBottom: 14, color: '#c53030', fontSize: 13, fontWeight: 700,
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
                boxShadow: loading ? 'none' : '0 4px 14px rgba(56,161,105,0.35)',
              }}
            >
              {loading ? '⏳ Creating account…' : 'Generate Password & Send to Parent →'}
            </button>

            <p style={{ textAlign: 'center', margin: '16px 0 4px', fontSize: 13 }}>
              <button type="button" onClick={() => router.push('/login')} style={{
                background: 'none', border: 'none', color: '#718096',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
              }}>
                — Back to Login
              </button>
            </p>

          </form>

          <p style={{
            textAlign: 'center', fontSize: 11, color: '#a0aec0',
            fontWeight: 600, marginTop: 8, lineHeight: 1.6,
          }}>
            🔒 Safe platform for Grades 4–10 · Parent-approved accounts only · AI-moderated content
          </p>
        </div>
      </div>
    </div>
  )
}
