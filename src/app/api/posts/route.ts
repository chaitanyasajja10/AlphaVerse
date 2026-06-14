import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET — public approved feed
export async function GET(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createAdminClient()
  const { searchParams } = new URL(req.url)
  const mine = searchParams.get('mine') === 'true'

  if (mine) {
    // Kid's own posts — all statuses so they can see pending ones
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:kids(id,username,display_name,avatar_emoji), community:communities(id,name,emoji), reactions(*)')
      .eq('author_id', kidId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Main feed — only approved posts
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:kids(id,username,display_name,avatar_emoji), community:communities(id,name,emoji), reactions(*)')
    .eq('status', 'Approved')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — kid creates a post; lands in parent's approval queue
export async function POST(req: NextRequest) {
  const kidId = req.cookies.get('av_kid_session')?.value
  if (!kidId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, community_id } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Post cannot be empty' }, { status: 400 })
  if (content.length > 1000) return NextResponse.json({ error: 'Post too long (max 1000 chars)' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: kidId,
      content: content.trim(),
      community_id: community_id || null,
      status: 'Pending Approval',   // ← always starts here
    })
    .select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    ok: true,
    id: data.id,
    status: 'Pending Approval',
    message: 'Your post has been sent to your parent for approval. It will appear on the feed once approved! 🎉',
  })
}
