import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json()
  if (!identifier || !password)
    return NextResponse.json({ error: 'Username/ID and password required' }, { status: 400 })

  const supabase = await createAdminClient()

  // Find by username, TYF ID, or email
  const { data: kid, error } = await supabase
    .from('kids')
    .select('*')
    .or(`username.eq.${identifier},tyf_id.eq.${identifier},email.eq.${identifier}`)
    .single()

  if (error || !kid)
    return NextResponse.json({ error: 'Account not found. Try your username, TYF ID, or email.' }, { status: 401 })

  if (kid.approval_status === 'rejected')
    return NextResponse.json({ error: 'Your account has been rejected. Please contact support.' }, { status: 403 })

  if (kid.approval_status === 'suspended')
    return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 })

  if (!kid.approved || kid.approval_status !== 'approved')
    return NextResponse.json({ error: 'Your account is waiting for parent approval. Ask your parent to check their email!' }, { status: 403 })

  const match = await bcrypt.compare(password, kid.password_hash)
  if (!match)
    return NextResponse.json({ error: 'Wrong password. Try again!' }, { status: 401 })

  // Set session cookie
  const res = NextResponse.json({ ok: true, kid: { id: kid.id, username: kid.username, display_name: kid.display_name } })
  res.cookies.set('av_kid_session', kid.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
