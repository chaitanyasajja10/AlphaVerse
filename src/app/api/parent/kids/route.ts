import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase.from('kids').select('id,username,display_name,avatar_emoji,approved,points,birth_year,created_at').eq('parent_id', parentId)
  return NextResponse.json(data || [])
}
