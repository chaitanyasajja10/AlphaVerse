import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: existing } = await supabase.from('community_members').select('id').eq('community_id', id).eq('kid_id', kidId).single()
  if (existing) {
    await supabase.from('community_members').delete().eq('community_id', id).eq('kid_id', kidId)
    await supabase.from('communities').update({ member_count: supabase.rpc('decrement', { x: 1 }) }).eq('id', id)
    return NextResponse.json({ action: 'left' })
  }
  await supabase.from('community_members').insert({ community_id: id, kid_id: kidId })
  await supabase.rpc('increment_member_count', { community_id: id })
  return NextResponse.json({ action: 'joined' })
}
