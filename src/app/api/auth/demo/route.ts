import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

const DEMO_PASSWORD = 'demo123'
const DEMO_HASH = '$2b$12$.jasv/XDNBxZFveiZzJ5/uTolamNI1Ymp26Bu15I030Gg2/jih8AW'

export async function POST() {
  const supabase = await createAdminClient()

  // Try to find existing demo user
  let { data: kid } = await supabase
    .from('kids')
    .select('*')
    .eq('username', 'demo')
    .single()

  // If not found, create it on the fly
  if (!kid) {
    const { data: newKid, error } = await supabase
      .from('kids')
      .insert({
        tyf_id: 'TYF-DEMO-001',
        username: 'demo',
        display_name: 'Demo Student',
        email: 'demo@alphaverse.com',
        password_hash: DEMO_HASH,
        birth_year: 2012,
        parent_email: 'demo-parent@alphaverse.com',
        approved: true,
        avatar_emoji: '🚀',
        bio: 'Demo account for exploring AlphaVerse',
      })
      .select('*')
      .single()

    if (error) {
      // Maybe a race condition — try fetching again
      const { data: retry } = await supabase
        .from('kids')
        .select('*')
        .eq('username', 'demo')
        .single()
      if (!retry)
        return NextResponse.json({ error: 'Could not create demo account: ' + error.message }, { status: 500 })
      kid = retry
    } else {
      kid = newKid
    }
  }

  // Ensure approved
  if (!kid.approved) {
    await supabase.from('kids').update({ approved: true }).eq('id', kid.id)
  }

  const res = NextResponse.json({
    ok: true,
    kid: { id: kid.id, username: kid.username, display_name: kid.display_name },
  })
  res.cookies.set('av_kid_session', kid.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
