import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from('kids').select('id,username,display_name,avatar_emoji,bio,points,tyf_id,birth_year').eq('id', kidId).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
