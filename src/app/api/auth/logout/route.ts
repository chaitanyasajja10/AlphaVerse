import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('av_kid_session')
  res.cookies.delete('av_parent_session')
  res.cookies.delete('av_admin_session')
  return res
}
