import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('posts')
    .select('*, author:kids(id,username,display_name,avatar_emoji)')
    .order('created_at', { ascending: false })
    .limit(100)
  const pending  = (data || []).filter((p: { status: string }) => p.status === 'Pending Approval')
  const approved = (data || []).filter((p: { status: string }) => p.status === 'Approved')
  const rejected = (data || []).filter((p: { status: string }) => p.status === 'Rejected')
  return NextResponse.json({ pending, approved, rejected, all: data || [] })
}

export async function PATCH(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  if (!['Pending Approval', 'Approved', 'Rejected'].includes(status))
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  const supabase = await createAdminClient()
  const { error } = await supabase.from('posts').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, status })
}
