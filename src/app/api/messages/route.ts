import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const otherId = req.nextUrl.searchParams.get('with')
  const supabase = await createAdminClient()

  if (otherId) {
    const { data } = await supabase.from('messages')
      .select('*, from:kids!messages_from_id_fkey(id,username,display_name,avatar_emoji)')
      .or(`and(from_id.eq.${kidId},to_id.eq.${otherId}),and(from_id.eq.${otherId},to_id.eq.${kidId})`)
      .order('created_at', { ascending: true })
    return NextResponse.json(data || [])
  }

  // Get conversation list (unique peers)
  const { data } = await supabase.from('messages')
    .select('*, from:kids!messages_from_id_fkey(id,username,display_name,avatar_emoji), to:kids!messages_to_id_fkey(id,username,display_name,avatar_emoji)')
    .or(`from_id.eq.${kidId},to_id.eq.${kidId}`)
    .order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { to_id, content } = await req.json()
  if (!to_id || !content?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from('messages')
    .insert({ from_id: kidId, to_id, content: content.trim() })
    .select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
