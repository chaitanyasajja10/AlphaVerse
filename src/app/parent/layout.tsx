'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const nav = [
    { href: '/parent/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/parent/posts', icon: '📝', label: 'Post Approvals' },
    { href: '/parent/activity', icon: '📊', label: 'Activity' },
    { href: '/parent/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div className="pp-layout">
      <nav className="pp-nav">
        <div className="pp-nav-logo">
          <div className="pp-logo-title">🛡️ Parent Portal</div>
          <div style={{ fontSize: 11, color: '#5a7094', fontWeight: 700, marginTop: 4 }}>AlphaVerse</div>
        </div>
        {nav.map(n => (
          <Link key={n.href} href={n.href} className={`pp-nav-item${pathname === n.href ? ' active' : ''}`}>
            <span>{n.icon}</span>{n.label}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={logout} className="pp-nav-item" style={{ color: '#E53935', borderLeftColor: 'transparent', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          👋 Logout
        </button>
      </nav>
      <main className="pp-content">{children}</main>
    </div>
  )
}
