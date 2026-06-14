import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

function makeTyfId() {
  return 'TYF' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function pickEmoji() {
  const emojis = ['🦁','🐯','🦊','🐺','🦝','🐸','🦋','🐙','🦄','🐉','🦅','🐬','🦊','🦚','🦜']
  return emojis[Math.floor(Math.random() * emojis.length)]
}

export async function POST(req: NextRequest) {
  const { displayName, username, email, password, birthYear, parentEmail, parentPassword } = await req.json()

  if (!displayName || !username || !password || !birthYear || !parentEmail || !parentPassword)
    return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })

  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores.' }, { status: 400 })

  const supabase = await createAdminClient()

  // Check username taken
  const { data: existing } = await supabase.from('kids').select('id').eq('username', username.toLowerCase()).single()
  if (existing) return NextResponse.json({ error: 'Username already taken. Try another!' }, { status: 409 })

  // Check parent email taken / create parent account
  let parentId: string
  const { data: existingParent } = await supabase.from('parents').select('id').eq('email', parentEmail.toLowerCase()).single()
  if (existingParent) {
    parentId = existingParent.id
  } else {
    const parentHash = await bcrypt.hash(parentPassword, 12)
    const { data: newParent, error: pe } = await supabase
      .from('parents')
      .insert({ email: parentEmail.toLowerCase(), display_name: 'Parent', password_hash: parentHash })
      .select('id').single()
    if (pe) return NextResponse.json({ error: 'Could not create parent account: ' + pe.message }, { status: 500 })
    parentId = newParent.id
  }

  const pwHash = await bcrypt.hash(password, 12)
  const tyfId = makeTyfId()

  const { error: ke } = await supabase.from('kids').insert({
    tyf_id: tyfId,
    username: username.toLowerCase(),
    display_name: displayName,
    email: email || null,
    password_hash: pwHash,
    birth_year: birthYear,
    parent_id: parentId,
    parent_email: parentEmail.toLowerCase(),
    avatar_emoji: pickEmoji(),
    approved: false,
    points: 0,
  })

  if (ke) return NextResponse.json({ error: ke.message }, { status: 500 })

  // TODO: Send parent approval email via Resend

  return NextResponse.json({ ok: true, tyfId })
}
