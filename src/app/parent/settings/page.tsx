'use client'
import { useState } from 'react'

export default function ParentSettingsPage() {
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function savePin() {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return setMsg('❌ PIN must be exactly 4 digits')
    setSaving(true)
    const res = await fetch('/api/parent/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    setSaving(false)
    if (res.ok) { setMsg('✅ PIN saved! You can now log in with PIN.'); setPin('') }
    else setMsg('❌ Failed to save PIN')
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--head)', fontSize: 26, color: '#1a2740', marginBottom: 24 }}>⚙️ Settings</h1>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 480 }}>
        <h3 style={{ fontFamily: 'var(--head)', marginBottom: 16 }}>🔢 Set Login PIN</h3>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 16 }}>
          Set a 4-digit PIN for quick access to your parent portal instead of typing your full password.
        </p>
        {msg && <div className={`alert ${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</div>}
        <div className="field">
          <label>4-Digit PIN</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••" maxLength={4}
            style={{ letterSpacing: 12, fontSize: 24, textAlign: 'center' }} />
        </div>
        <button className="btn blue" onClick={savePin} disabled={saving || pin.length !== 4}>
          {saving ? '⏳ Saving…' : '💾 Save PIN'}
        </button>
      </div>
    </div>
  )
}
