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
  const {
    displayName, username, email, password, birthYear, dateOfBirth,
    parentEmail, parentPassword, parentName, schoolName, currentGrade,
  } = await req.json()

  if (!displayName || !username || !password || !parentEmail || !parentPassword)
    return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })

  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores.' }, { status: 400 })

  if (parentPassword.length < 6)
    return NextResponse.json({ error: 'Parent password must be at least 6 characters.' }, { status: 400 })

  // Derive birth year from dateOfBirth if not provided
  const resolvedBirthYear = birthYear || (dateOfBirth ? new Date(dateOfBirth).getFullYear() : null)
  if (!resolvedBirthYear)
    return NextResponse.json({ error: 'Date of birth is required.' }, { status: 400 })

  const supabase = await createAdminClient()

  // Check username taken
  const { data: existing } = await supabase.from('kids').select('id').eq('username', username.toLowerCase()).single()
  if (existing) return NextResponse.json({ error: 'Username already taken. Try another!' }, { status: 409 })

  // Check parent email / create parent account
  let parentId: string
  const { data: existingParent } = await supabase.from('parents').select('id').eq('email', parentEmail.toLowerCase()).single()
  if (existingParent) {
    parentId = existingParent.id
  } else {
    const parentHash = await bcrypt.hash(parentPassword, 12)
    const { data: newParent, error: pe } = await supabase
      .from('parents')
      .insert({
        email: parentEmail.toLowerCase(),
        display_name: parentName || 'Parent',
        password_hash: parentHash,
      })
      .select('id').single()
    if (pe) return NextResponse.json({ error: 'Could not create parent account: ' + pe.message }, { status: 500 })
    parentId = newParent.id
  }

  const pwHash = await bcrypt.hash(password, 12)
  const tyfId = makeTyfId()

  // Reload PostgREST schema cache (handles newly added columns)
  await supabase.rpc('reload_schema').catch(() => {/* ignore if function not present */})

  // Base insert — always works regardless of schema cache state
  const baseInsert: Record<string, unknown> = {
    tyf_id: tyfId,
    username: username.toLowerCase(),
    display_name: displayName,
    email: email || null,
    password_hash: pwHash,
    birth_year: resolvedBirthYear,
    parent_id: parentId,
    parent_email: parentEmail.toLowerCase(),
    avatar_emoji: pickEmoji(),
    approved: false,
    approval_status: 'pending',
    points: 0,
  }

  // Try extended insert with newer columns; fall back to base if cache stale
  let ke: { message: string } | null = null
  const extended = { ...baseInsert, date_of_birth: dateOfBirth || null, school_name: schoolName || null, current_grade: currentGrade || null }
  const { error: extErr } = await supabase.from('kids').insert(extended)
  if (extErr) {
    // Schema cache likely stale — insert without the new columns
    const { error: baseErr } = await supabase.from('kids').insert(baseInsert)
    ke = baseErr
  } else {
    ke = extErr
  }

  if (ke) return NextResponse.json({ error: ke.message }, { status: 500 })

  return NextResponse.json({ ok: true, tyfId })
}
