import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase.from('friendships')
    .select('*, kid_a:kids!friendships_kid_a_fkey(id,username,display_name,avatar_emoji,points), kid_b:kids!friendships_kid_b_fkey(id,username,display_name,avatar_emoji,points)')
    .or(`kid_a.eq.${kidId},kid_b.eq.${kidId}`)
    .eq('status', 'accepted')
  const friends = (data || []).map((f: any) => f.kid_a.id === kidId ? f.kid_b : f.kid_a)
  return NextResponse.json(friends)
}

export async function POST(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { username } = await req.json()
  const supabase = await createAdminClient()
  const { data: target } = await supabase.from('kids').select('id').eq('username', username.toLowerCase()).single()
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.id === kidId) return NextResponse.json({ error: 'Cannot add yourself!' }, { status: 400 })
  const { error } = await supabase.from('friendships').insert({ kid_a: kidId, kid_b: target.id, status: 'accepted' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
