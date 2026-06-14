import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { kid_id, approved } = await req.json()
  const supabase = await createAdminClient()
  const { data: kid } = await supabase.from('kids').select('parent_id').eq('id', kid_id).single()
  if (kid?.parent_id !== parentId) return NextResponse.json({ error: 'Not your child' }, { status: 403 })
  const { error } = await supabase.from('kids').update({ approved }).eq('id', kid_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
