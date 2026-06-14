import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: postId } = await params
  const { emoji } = await req.json()
  const supabase = await createAdminClient()
  // Toggle reaction
  const { data: existing } = await supabase.from('reactions').select('id').eq('post_id', postId).eq('kid_id', kidId).eq('emoji', emoji).single()
  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  }
  await supabase.from('reactions').insert({ post_id: postId, kid_id: kidId, emoji })
  return NextResponse.json({ action: 'added' })
}
