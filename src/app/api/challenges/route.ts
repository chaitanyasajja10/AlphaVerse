import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data: challenges } = await supabase.from('challenges').select('*').eq('active', true).order('created_at', { ascending: false })
  const { data: subs } = await supabase.from('challenge_submissions').select('challenge_id,status').eq('kid_id', kidId)
  const subMap = new Map((subs || []).map((s: any) => [s.challenge_id, s.status]))
  const result = (challenges || []).map((c: any) => ({ ...c, submitted: subMap.has(c.id), submission_status: subMap.get(c.id) }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { challenge_id, content } = await req.json()
  const supabase = await createAdminClient()
  const { error } = await supabase.from('challenge_submissions').insert({ challenge_id, kid_id: kidId, content, status: 'pending' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
