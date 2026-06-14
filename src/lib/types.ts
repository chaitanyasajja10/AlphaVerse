export interface Kid {
  id: string
  username: string
  display_name: string
  avatar_emoji: string
  birth_year: number
  bio?: string
  parent_email: string
  approved: boolean
  points: number
  badges: string[]
  created_at: string
}

export interface Parent {
  id: string
  email: string
  display_name: string
  pin_hash?: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  author?: Kid
  content: string
  media_url?: string
  status: 'pending' | 'approved' | 'rejected'
  community_id?: string
  community?: Community
  reactions: Reaction[]
  created_at: string
}

export interface Community {
  id: string
  name: string
  emoji: string
  description: string
  member_count: number
  is_member?: boolean
}

export interface Reaction {
  post_id: string
  kid_id: string
  emoji: string
}

export interface Message {
  id: string
  from_id: string
  to_id: string
  from?: Kid
  content: string
  read_at?: string
  created_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  points: number
  deadline?: string
  submission_count: number
  submitted?: boolean
  status?: 'pending' | 'approved' | 'rejected'
}

export interface Badge {
  id: string
  type: string
  label: string
  emoji: string
  earned_at: string
}
