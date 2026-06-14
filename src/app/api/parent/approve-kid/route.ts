import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { kid_id, approved, approval_status } = await req.json()

  const supabase = await createAdminClient()
  const { data: kid } = await supabase.from('kids').select('parent_id').eq('id', kid_id).single()
  if (kid?.parent_id !== parentId) return NextResponse.json({ error: 'Not your child' }, { status: 403 })

  // Derive status from boolean if approval_status not provided
  const newStatus = approval_status ?? (approved ? 'approved' : 'rejected')
  const newApproved = newStatus === 'approved'

  const { error } = await supabase
    .from('kids')
    .update({ approved: newApproved, approval_status: newStatus })
    .eq('id', kid_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, approval_status: newStatus })
}
