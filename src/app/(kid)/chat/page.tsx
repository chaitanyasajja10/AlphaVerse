'use client'
import { useState, useEffect, useRef, FormEvent } from 'react'

interface Kid { id: string; username: string; display_name: string; avatar_emoji: string }
interface Msg { id: string; from_id: string; content: string; created_at: string; from: Kid }

export default function ChatPage() {
  const [peers, setPeers] = useState<Kid[]>([])
  const [active, setActive] = useState<Kid | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [me, setMe] = useState<{ id: string } | null>(null)
  const [friends, setFriends] = useState<Kid[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(setMe)
    fetch('/api/friends').then(r => r.json()).then(d => setFriends(Array.isArray(d) ? d : []))
    loadConvos()
  }, [])

  async function loadConvos() {
    const res = await fetch('/api/messages')
    const data = await res.json()
    // Deduplicate peers
    const seen = new Set<string>()
    const peerList: Kid[] = []
    if (Array.isArray(data)) {
      data.forEach((m: any) => {
        const peer = m.from_id === me?.id ? m.to : m.from
        if (peer && !seen.has(peer.id)) { seen.add(peer.id); peerList.push(peer) }
      })
    }
    setPeers(peerList)
  }

  async function openChat(peer: Kid) {
    setActive(peer)
    const res = await fetch(`/api/messages?with=${peer.id}`)
    const data = await res.json()
    setMessages(Array.isArray(data) ? data : [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function sendMsg(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() || !active) return
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_id: active.id, content: text }),
    })
    setText('')
    openChat(active)
  }

  function timeStr(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const allPeers = [...new Map([...peers, ...friends].map(p => [p.id, p])).values()]

  return (
    <div className="page-wrap" style={{ padding: '24px 20px' }}>
      <div className="chat-wrap">
        {/* Left: conversation list */}
        <div className="chat-list-panel">
          <div className="chat-list-header">💬 Messages</div>
          {allPeers.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13, fontWeight: 700 }}>
              Add friends to start chatting! 👥
            </div>
          ) : allPeers.map(peer => (
            <div key={peer.id} className={`chat-item${active?.id === peer.id ? ' active' : ''}`} onClick={() => openChat(peer)}>
              <div className="av" style={{ background: 'var(--soft)' }}>{peer.avatar_emoji}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: 'var(--dark)' }}>{peer.display_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{peer.username}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: messages */}
        {active ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '2px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="av" style={{ background: 'var(--soft)' }}>{active.avatar_emoji}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: 'var(--dark)' }}>{active.display_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>@{active.username}</p>
              </div>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(msg => {
                const isMine = msg.from_id === me?.id
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', background: isMine ? 'var(--blue)' : 'var(--soft)', color: isMine ? '#fff' : 'var(--ink)', padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>
                      {msg.content}
                      <div style={{ fontSize: 11, opacity: .7, marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>{timeStr(msg.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            {/* Input */}
            <form onSubmit={sendMsg} style={{ padding: '12px 16px', borderTop: '2px solid var(--line)', display: 'flex', gap: 10 }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder={`Message ${active.display_name}…`}
                style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--line)', borderRadius: 999, fontSize: 14, fontWeight: 700, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'} />
              <button className="btn blue" disabled={!text.trim()}>Send 🚀</button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>💬</div>
              <h3 style={{ fontFamily: 'var(--head)', color: 'var(--dark)', marginTop: 12 }}>Select a chat</h3>
              <p style={{ fontWeight: 700, fontSize: 13 }}>Choose a friend from the left to start chatting!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
