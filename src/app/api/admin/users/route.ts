import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (!req.cookies.get('av_admin_session')?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase.from('kids').select('id,username,display_name,avatar_emoji,approved,points,created_at').order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}
