-- ════════════════════════════════════════════
-- ALPHAVERSE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Parents table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL DEFAULT 'Parent',
  password_hash TEXT NOT NULL,
  pin_hash      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Kids table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kids (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tyf_id        TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  email         TEXT,
  password_hash TEXT NOT NULL,
  avatar_emoji  TEXT DEFAULT '🦄',
  bio           TEXT,
  birth_year    INTEGER NOT NULL,
  parent_id     UUID REFERENCES parents(id) ON DELETE SET NULL,
  parent_email  TEXT NOT NULL,
  approved      BOOLEAN DEFAULT FALSE,
  points        INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Communities table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  emoji        TEXT NOT NULL DEFAULT '🌍',
  description  TEXT,
  member_count INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Community members ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  kid_id       UUID REFERENCES kids(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, kid_id)
);

-- ── Posts table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id    UUID REFERENCES kids(id) ON DELETE CASCADE,
  content      TEXT NOT NULL CHECK (char_length(content) <= 1000),
  media_url    TEXT,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reactions table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id  UUID REFERENCES posts(id) ON DELETE CASCADE,
  kid_id   UUID REFERENCES kids(id) ON DELETE CASCADE,
  emoji    TEXT NOT NULL,
  UNIQUE(post_id, kid_id, emoji)
);

-- ── Friendships table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_a    UUID REFERENCES kids(id) ON DELETE CASCADE,
  kid_b    UUID REFERENCES kids(id) ON DELETE CASCADE,
  status   TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kid_a, kid_b)
);

-- ── Messages table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_id    UUID REFERENCES kids(id) ON DELETE CASCADE,
  to_id      UUID REFERENCES kids(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) <= 500),
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Challenges table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  points       INTEGER NOT NULL DEFAULT 100,
  deadline     TIMESTAMPTZ,
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Challenge submissions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  kid_id       UUID REFERENCES kids(id) ON DELETE CASCADE,
  content      TEXT,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, kid_id)
);

-- ── Badges table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id     UUID REFERENCES kids(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  label      TEXT NOT NULL,
  emoji      TEXT NOT NULL,
  earned_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════
-- SEED DATA: Default Communities
-- ════════════════════════════════════════════

INSERT INTO communities (name, emoji, description, member_count) VALUES
  ('Gaming Zone',    '🎮', 'Talk about your favorite games, share tips and tricks!',   0),
  ('Art Studio',     '🎨', 'Share your drawings, paintings, and creative projects!',    0),
  ('Science Lab',    '🔬', 'Explore science experiments and cool discoveries!',          0),
  ('Music Room',     '🎵', 'Share your music, talk about bands and instruments!',        0),
  ('Book Club',      '📚', 'Read together and discuss amazing stories!',                0),
  ('Sports Arena',   '⚽', 'Talk about sports, share highlights and achievements!',     0),
  ('Meme Factory',   '😂', 'Share the funniest memes (parent-approved only!).',         0),
  ('Movie Night',    '🎬', 'Recommend movies and TV shows for kids!',                   0),
  ('Nature Friends', '🌿', 'Love animals and nature? This is your community!',          0),
  ('DIY Makers',     '🔧', 'Build, invent and create cool things!',                    0)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════
-- SEED DATA: Starter Challenges
-- ════════════════════════════════════════════

INSERT INTO challenges (title, description, points) VALUES
  ('Introduce Yourself!',     'Write 3 fun facts about yourself in a post.',                          50),
  ('Art Challenge',           'Draw your favorite animal and share a photo of it!',                  100),
  ('Science Fact of the Day', 'Share one amazing science fact you learned this week.',                75),
  ('Acts of Kindness',        'Describe one kind thing you did for someone this week.',               100),
  ('Book Review',             'Write a short review of a book you recently read.',                   100),
  ('Sports Achievement',      'Share a sports goal you recently achieved, big or small!',            100),
  ('Creative Story',          'Write a short creative story (at least 5 sentences).',               150),
  ('Friendship Spotlight',    'Write something kind about a friend (with their permission).',         75)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════
-- HELPER FUNCTION: increment_member_count
-- ════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_member_count(community_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE communities SET member_count = member_count + 1 WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY (optional — basic setup)
-- ════════════════════════════════════════════
-- NOTE: We use service_role key server-side so RLS is bypassed.
-- Enable if you ever use anon key directly from client.
-- ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
