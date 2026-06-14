import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data: kids } = await supabase.from('kids').select('id').eq('parent_id', parentId)
  if (!kids?.length) return NextResponse.json([])
  const kidIds = kids.map((k: any) => k.id)
  const { data } = await supabase.from('posts')
    .select('*, author:kids(id,username,display_name,avatar_emoji)')
    .in('author_id', kidIds)
    .order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  if (!['approved', 'rejected'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  const supabase = await createAdminClient()
  const { error } = await supabase.from('posts').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
