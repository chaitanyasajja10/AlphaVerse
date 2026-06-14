import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:kids(id,username,display_name,avatar_emoji), community:communities(id,name,emoji), reactions(*)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { content, community_id } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Post cannot be empty' }, { status: 400 })
  if (content.length > 1000) return NextResponse.json({ error: 'Post too long (max 1000 chars)' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: kidId, content: content.trim(), community_id: community_id || null, status: 'pending' })
    .select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id, status: 'pending' })
}
