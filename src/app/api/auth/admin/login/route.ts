import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { key } = await req.json()
  const adminKey = process.env.ADMIN_SECRET_KEY || 'alphaverse-admin-2024'

  if (key !== adminKey)
    return NextResponse.json({ error: 'Invalid admin key.' }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('av_admin_session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return res
}
