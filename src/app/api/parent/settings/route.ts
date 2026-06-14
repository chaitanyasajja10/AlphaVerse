import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const parentId = req.cookies.get('av_parent_session')?.value
  if (!parentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { pin } = await req.json()
  if (!/^\d{4}$/.test(pin)) return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 })
  const hash = await bcrypt.hash(pin, 12)
  const supabase = await createAdminClient()
  const { error } = await supabase.from('parents').update({ pin_hash: hash }).eq('id', parentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
