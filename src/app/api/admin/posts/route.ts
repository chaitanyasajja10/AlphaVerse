import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase.from('posts')
    .select('*, author:kids(id,username,display_name,avatar_emoji)')
    .order('created_at', { ascending: false }).limit(100)
  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  const supabase = await createAdminClient()
  await supabase.from('posts').update({ status }).eq('id', id)
  return NextResponse.json({ ok: true })
}
