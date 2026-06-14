import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET — parent sees their kids' posts; pending ones first
export async function GET(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createAdminClient()
  const { data: kids } = await supabase.from('kids').select('id').eq('parent_id', parentId)
  if (!kids?.length) return NextResponse.json({ pending: [], reviewed: [] })

  const kidIds = kids.map((k: { id: string }) => k.id)

  const { data, error } = await supabase
    .from('posts')
    .select('*, author:kids(id,username,display_name,avatar_emoji)')
    .in('author_id', kidIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const pending  = (data || []).filter((p: { status: string }) => p.status === 'Pending Approval')
  const reviewed = (data || []).filter((p: { status: string }) => p.status !== 'Pending Approval')

  return NextResponse.json({ pending, reviewed })
}

// PATCH — parent approves or rejects a post
export async function PATCH(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!['Approved', 'Rejected'].includes(status))
    return NextResponse.json({ error: 'Status must be "Approved" or "Rejected"' }, { status: 400 })

  const supabase = await createAdminClient()

  // Ensure post belongs to one of this parent's kids
  const { data: kids } = await supabase.from('kids').select('id').eq('parent_id', parentId)
  const kidIds = (kids || []).map((k: { id: string }) => k.id)

  const { data: post } = await supabase.from('posts').select('author_id').eq('id', id).single()
  if (!post || !kidIds.includes(post.author_id))
    return NextResponse.json({ error: 'Post not found or not your child\'s post' }, { status: 403 })

  const { error } = await supabase.from('posts').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    status,
    message: status === 'Approved'
      ? '✅ Post approved and published to the feed!'
      : '❌ Post rejected and removed from the queue.',
  })
}
