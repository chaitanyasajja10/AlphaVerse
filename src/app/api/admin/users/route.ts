import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('kids')
    .select('id,username,display_name,avatar_emoji,approved,approval_status,points,created_at,school_name,current_grade,parent_email')
    .order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { kid_id, approval_status } = await req.json()
  if (!kid_id || !approval_status) return NextResponse.json({ error: 'kid_id and approval_status required' }, { status: 400 })

  const validStatuses = ['pending', 'approved', 'rejected', 'suspended']
  if (!validStatuses.includes(approval_status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('kids')
    .update({ approval_status, approved: approval_status === 'approved' })
    .eq('id', kid_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, approval_status })
}
