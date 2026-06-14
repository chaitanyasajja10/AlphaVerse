import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data: communities } = await supabase.from('communities').select('*').order('member_count', { ascending: false })
  const { data: memberships } = await supabase.from('community_members').select('community_id').eq('kid_id', kidId)
  const memberSet = new Set((memberships || []).map((m: any) => m.community_id))
  const result = (communities || []).map((c: any) => ({ ...c, is_member: memberSet.has(c.id) }))
  return NextResponse.json(result)
}
