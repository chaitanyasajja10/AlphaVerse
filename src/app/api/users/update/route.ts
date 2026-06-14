import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bio, avatar_emoji } = await req.json()
  const supabase = await createAdminClient()
  const updates: any = {}
  if (bio !== undefined) updates.bio = bio.slice(0, 200)
  if (avatar_emoji) updates.avatar_emoji = avatar_emoji
  const { error } = await supabase.from('kids').update(updates).eq('id', kidId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
