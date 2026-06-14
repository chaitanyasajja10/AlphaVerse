'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Kid { display_name: string; avatar_emoji: string; points: number }

export default function KidLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [kid, setKid] = useState<Kid | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => { if (d.id) setKid(d) })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const nav = [
    { href: '/home', label: '🏠 Feed' },
    { href: '/chat', label: '💬 Chat' },
    { href: '/communities', label: '🌍 Communities' },
    { href: '/challenges', label: '⚡ Challenges' },
    { href: '/friends', label: '👥 Friends' },
    { href: '/profile', label: '😎 Profile' },
  ]

  return (
    <>
      <nav className="topbar">
        <div className="topbar-inner">
          <Link href="/home" className="brand"><span className="r">Alpha</span><span className="b">Verse</span></Link>
          <div className="tspacer" />
          <div className="topbar-nav" style={{ display: 'flex' }}>
            {nav.map(n => (
              <Link key={n.href} href={n.href} className={pathname.startsWith(n.href) ? 'active' : ''}>{n.label}</Link>
            ))}
          </div>
          <div className="tspacer" />
          {kid ? (
            <div style={{ position: 'relative' }}>
              <div className="avatar-chip" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="av">{kid.avatar_emoji}</div>
                <span className="av-name">{kid.display_name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 800 }}>⭐ {kid.points}</span>
              </div>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: '#fff', border: '2px solid var(--line)', borderRadius: 16, padding: 8, minWidth: 160, zIndex: 200, boxShadow: 'var(--shadow-md)' }}>
                  <Link href="/profile" style={{ display: 'block', padding: '8px 14px', fontSize: 13, fontWeight: 800, color: 'var(--dark)', borderRadius: 10 }} onClick={() => setMenuOpen(false)}>😎 My Profile</Link>
                  <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 13, fontWeight: 800, color: 'var(--red)', borderRadius: 10 }}>👋 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ width: 120, height: 44, background: 'var(--soft)', borderRadius: 999, animation: 'pulse 1.5s infinite' }} />
          )}
        </div>
      </nav>
      {children}
    </>
  )
}
