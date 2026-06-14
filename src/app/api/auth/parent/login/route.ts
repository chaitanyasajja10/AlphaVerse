import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, pin, mode } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data: parent, error } = await supabase
    .from('parents')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !parent)
    return NextResponse.json({ error: 'No account found with that email.' }, { status: 401 })

  if (mode === 'pin') {
    if (!pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 })
    if (!parent.pin_hash) return NextResponse.json({ error: 'No PIN set for this account. Please use password login.' }, { status: 403 })
    const match = await bcrypt.compare(pin, parent.pin_hash)
    if (!match) return NextResponse.json({ error: 'Wrong PIN. Try again.' }, { status: 401 })
  } else {
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
    const match = await bcrypt.compare(password, parent.password_hash)
    if (!match) return NextResponse.json({ error: 'Wrong password.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('av_parent_session', parent.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
